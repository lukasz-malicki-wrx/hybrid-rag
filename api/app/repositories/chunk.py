from typing import Any
from uuid import UUID

from pgvector import Vector
from psycopg import Connection

Row = dict[str, Any]

_COLUMNS = "c.id, c.document_id, d.filename, d.version, d.sha256, c.page, c.position, c.text"
_FROM = "FROM chunks c JOIN documents d ON d.id = c.document_id"
_FILTER = (
    "d.active AND d.status = 'ready' "
    "AND (%(docs)s::uuid[] IS NULL OR c.document_id = ANY(%(docs)s::uuid[]))"
)


class ChunkRepository:
    def __init__(self, conn: Connection) -> None:
        self._conn = conn

    def add_many(
        self,
        document_id: UUID,
        rows: list[tuple[int, int, str]],
        vectors: list[list[float]],
    ) -> None:
        """rows: (page, position, text) aligned with vectors."""
        with self._conn.cursor() as cur:
            cur.executemany(
                "INSERT INTO chunks (document_id, page, position, text, embedding) "
                "VALUES (%s, %s, %s, %s, %s)",
                [
                    (document_id, page, pos, text, Vector(vec))
                    for (page, pos, text), vec in zip(rows, vectors, strict=True)
                ],
            )

    def by_document(self, document_id: UUID) -> list[Row]:
        """All chunks of a document in reading order (no embeddings: they are 1024 numbers each)."""
        return self._conn.execute(
            "SELECT id, page, position, text, length(text) AS chars FROM chunks "
            "WHERE document_id = %s ORDER BY page, position",
            (document_id,),
        ).fetchall()

    def by_ids(self, chunk_ids: list[int]) -> list[Row]:
        """Chunks with their document, in the order given (inactive documents included:
        history must still show what an old answer was based on)."""
        rows = self._conn.execute(
            f"SELECT {_COLUMNS} {_FROM} WHERE c.id = ANY(%s)",  # noqa: S608
            (chunk_ids,),
        ).fetchall()
        by_id = {r["id"]: r for r in rows}
        return [by_id[i] for i in chunk_ids if i in by_id]

    def by_filename(self, name_part: str) -> list[Row]:
        """Active, ready chunks of documents whose filename contains name_part."""
        return self._conn.execute(
            f"SELECT c.id, c.text {_FROM} WHERE d.active AND d.status = 'ready' "  # noqa: S608
            "AND d.filename ILIKE %s",
            (f"%{name_part}%",),
        ).fetchall()

    def vector_search(
        self, embedding: list[float], docs: list[UUID] | None, limit: int
    ) -> list[Row]:
        self._conn.execute("SET LOCAL hnsw.iterative_scan = strict_order")
        return self._conn.execute(
            f"SELECT {_COLUMNS}, c.embedding <=> %(q)s AS distance "  # noqa: S608
            f"{_FROM} WHERE {_FILTER} ORDER BY distance LIMIT %(n)s",
            {"docs": docs, "q": Vector(embedding), "n": limit},
        ).fetchall()

    def fulltext_search(self, tsquery: str, docs: list[UUID] | None, limit: int) -> list[Row]:
        return self._conn.execute(
            f"SELECT {_COLUMNS} {_FROM} WHERE {_FILTER} "  # noqa: S608
            "AND c.tsv @@ to_tsquery('simple', %(tsq)s) "
            "ORDER BY ts_rank_cd(c.tsv, to_tsquery('simple', %(tsq)s)) DESC LIMIT %(n)s",
            {"docs": docs, "tsq": tsquery, "n": limit},
        ).fetchall()
