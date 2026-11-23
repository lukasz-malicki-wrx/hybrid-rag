from typing import Any
from uuid import UUID

from psycopg import Connection
from psycopg.types.json import Jsonb


class QueryRepository:
    def __init__(self, conn: Connection) -> None:
        self._conn = conn

    def create(
        self,
        question: str,
        document_ids: list[UUID],
        params: dict[str, Any],
        conversation_id: UUID | None = None,
        attached_document_ids: list[UUID] | None = None,
    ) -> UUID:
        return self._conn.execute(
            "INSERT INTO queries (question, document_ids, params, conversation_id, "
            "attached_document_ids) VALUES (%s, %s, %s, %s, %s) RETURNING id",
            (question, document_ids, Jsonb(params), conversation_id, attached_document_ids or []),
        ).fetchone()["id"]


class AnswerRepository:
    def __init__(self, conn: Connection) -> None:
        self._conn = conn

    def create(
        self,
        query_id: UUID,
        answer: str,
        chunk_ids: list[int],
        corpus: list[dict[str, Any]],
        embed_model: str,
        llm_provider: str,
        llm_model: str,
        prompt_version: str,
        refused: bool = False,
        uncited: bool = False,
        citations: list[int] | None = None,
        stopped: bool = False,
    ) -> UUID:
        return self._conn.execute(
            "INSERT INTO answers (query_id, answer, chunk_ids, corpus, embed_model, "
            "llm_provider, llm_model, prompt_version, refused, uncited, citations, stopped) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (
                query_id,
                answer,
                chunk_ids,
                Jsonb(corpus),
                embed_model,
                llm_provider,
                llm_model,
                prompt_version,
                refused,
                uncited,
                citations or [],
                stopped,
            ),
        ).fetchone()["id"]


class FeedbackRepository:
    def __init__(self, conn: Connection) -> None:
        self._conn = conn

    def set(self, answer_id: UUID, rating: str | None) -> dict[str, Any] | None:
        """Returns None when there is no such answer in a conversation that still exists."""
        return self._conn.execute(
            "INSERT INTO answer_feedback (answer_id, rating) "
            "SELECT a.id, %s FROM answers a JOIN queries q ON q.id = a.query_id "
            "LEFT JOIN conversations c ON c.id = q.conversation_id "
            "WHERE a.id = %s AND c.deleted_at IS NULL "
            "ON CONFLICT (answer_id) DO UPDATE SET rating = EXCLUDED.rating, updated_at = now() "
            "RETURNING answer_id, rating",
            (rating, answer_id),
        ).fetchone()
