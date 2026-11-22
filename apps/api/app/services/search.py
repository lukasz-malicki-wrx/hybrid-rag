from typing import Any, Literal
from uuid import UUID

from ..rag.embedding import Embedder
from ..rag.fusion import rrf
from ..rag.query import build_tsquery
from ..repositories.chunk import ChunkRepository

Row = dict[str, Any]
Mode = Literal["hybrid", "vector", "fulltext"]
CANDIDATES = 50


class SearchService:
    def __init__(
        self,
        chunks: ChunkRepository,
        embedder: Embedder,
        max_vector_distance: float | None = None,
    ) -> None:
        self._chunks = chunks
        self._embedder = embedder
        self._max_distance = max_vector_distance

    def search(
        self,
        question: str,
        docs: list[UUID] | None = None,
        k: int = 8,
        mode: Mode = "hybrid",
    ) -> list[Row]:
        """Top-k chunks, or [] when nothing in the corpus is related to the question.

        mode: 'hybrid' (RRF fusion), 'vector' or 'fulltext'.
        """
        if mode not in ("hybrid", "vector", "fulltext"):
            raise ValueError(f"unknown search mode: {mode}")
        vec_rows: list[Row] = []
        fts_rows: list[Row] = []
        if mode in ("hybrid", "vector"):
            embedding = self._embedder.embed([question])[0]
            vec_rows = self._chunks.vector_search(embedding, docs, CANDIDATES)
        if mode in ("hybrid", "fulltext") and (tsq := build_tsquery(question)):
            fts_rows = self._chunks.fulltext_search(tsq, docs, CANDIDATES)

        if not self._is_relevant(question, docs, mode, vec_rows):
            return []

        by_id = {r["id"]: r for r in fts_rows + vec_rows}  # vector rows carry the distance
        vec_rank = {r["id"]: i for i, r in enumerate(vec_rows, start=1)}
        fts_rank = {r["id"]: i for i, r in enumerate(fts_rows, start=1)}
        scores = rrf([[r["id"] for r in vec_rows], [r["id"] for r in fts_rows]])

        ranked = sorted(scores, key=lambda cid: scores[cid], reverse=True)[:k]
        return [
            {
                **by_id[cid],
                "distance": by_id[cid].get("distance"),
                "score": scores[cid],
                "vector_rank": vec_rank.get(cid),
                "fulltext_rank": fts_rank.get(cid),
            }
            for cid in ranked
        ]

    def _is_relevant(
        self, question: str, docs: list[UUID] | None, mode: Mode, vec_rows: list[Row]
    ) -> bool:
        """Relevance gate. Nearest neighbours always exist, so 'some results' proves nothing.

        Relevant when the nearest chunk is within the distance threshold, or (hybrid) when one
        chunk contains every content word of the question: exact identifiers such as "ALCOA"
        sit far away in embedding space but are a strong keyword match.
        """
        if self._max_distance is None or mode == "fulltext":
            return True
        if vec_rows and vec_rows[0]["distance"] <= self._max_distance:
            return True
        if mode == "hybrid" and (strict := build_tsquery(question, match_all=True)):
            return bool(self._chunks.fulltext_search(strict, docs, 1))
        return False
