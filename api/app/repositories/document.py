from typing import Any
from uuid import UUID

from psycopg import Connection

Row = dict[str, Any]


class DocumentRepository:
    def __init__(self, conn: Connection) -> None:
        self._conn = conn

    def lock_upload(self, sha256: str, filename: str) -> None:
        """Serialise uploads of the same content or the same file name until commit.

        Transaction-scoped advisory locks, taken in a fixed order so two uploads can never
        wait for each other in a cycle.
        """
        self._conn.execute(
            "SELECT pg_advisory_xact_lock(k) FROM ("
            "  SELECT DISTINCT hashtextextended(key, 0) AS k FROM unnest(%s::text[]) AS key"
            ") locks ORDER BY k",
            ([f"document-sha256:{sha256}", f"document-filename:{filename}"],),
        )

    def get(self, doc_id: UUID) -> Row | None:
        return self._conn.execute("SELECT * FROM documents WHERE id = %s", (doc_id,)).fetchone()

    def get_by_sha256(self, sha256: str) -> Row | None:
        return self._conn.execute("SELECT * FROM documents WHERE sha256 = %s", (sha256,)).fetchone()

    def list(self, include_inactive: bool) -> list[Row]:
        return self._conn.execute(
            "SELECT * FROM documents WHERE active OR %s ORDER BY filename, version DESC",
            (include_inactive,),
        ).fetchall()

    def latest_by_filename(self, filename: str) -> Row | None:
        return self._conn.execute(
            "SELECT * FROM documents WHERE filename = %s ORDER BY version DESC LIMIT 1",
            (filename,),
        ).fetchone()

    def create(self, filename: str, sha256: str, version: int, supersedes_id: UUID | None) -> Row:
        return self._conn.execute(
            "INSERT INTO documents (filename, sha256, version, supersedes_id, status) "
            "VALUES (%s, %s, %s, %s, 'processing') RETURNING *",
            (filename, sha256, version, supersedes_id),
        ).fetchone()

    def activate(self, doc_id: UUID) -> Row:
        return self._conn.execute(
            "UPDATE documents SET active = true, deactivated_at = NULL WHERE id = %s RETURNING *",
            (doc_id,),
        ).fetchone()

    def deactivate(self, doc_id: UUID) -> Row | None:
        return self._conn.execute(
            "UPDATE documents SET active = false, deactivated_at = now() "
            "WHERE id = %s AND active RETURNING *",
            (doc_id,),
        ).fetchone()

    def mark_processing(self, doc_id: UUID) -> Row:
        return self._conn.execute(
            "UPDATE documents SET status = 'processing', error = NULL, progress = 0, "
            "progress_total = NULL WHERE id = %s RETURNING *",
            (doc_id,),
        ).fetchone()

    def set_progress(self, doc_id: UUID, done: int, total: int) -> None:
        self._conn.execute(
            "UPDATE documents SET progress = %s, progress_total = %s WHERE id = %s",
            (done, total, doc_id),
        )

    def note_error(self, doc_id: UUID, error: str) -> None:
        """Record a failed attempt that will be retried; the status stays 'processing'."""
        self._conn.execute("UPDATE documents SET error = %s WHERE id = %s", (error, doc_id))

    def mark_ready(self, doc_id: UUID, pages: int, chunks: int) -> None:
        self._conn.execute(
            "UPDATE documents SET status = 'ready', pages = %s, error = NULL, "
            "progress = %s, progress_total = %s WHERE id = %s",
            (pages, chunks, chunks, doc_id),
        )

    def mark_failed(self, doc_id: UUID, error: str) -> None:
        self._conn.execute(
            "UPDATE documents SET status = 'failed', error = %s WHERE id = %s", (error, doc_id)
        )
