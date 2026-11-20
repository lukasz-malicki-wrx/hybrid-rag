from typing import Any
from uuid import UUID

from psycopg import Connection
from psycopg.types.json import Jsonb


class QueryRepository:
    def __init__(self, conn: Connection) -> None:
        self._conn = conn

    def create(self, question: str, document_ids: list[UUID], params: dict[str, Any]) -> UUID:
        return self._conn.execute(
            "INSERT INTO queries (question, document_ids, params) VALUES (%s, %s, %s) RETURNING id",
            (question, document_ids, Jsonb(params)),
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
    ) -> UUID:
        return self._conn.execute(
            "INSERT INTO answers (query_id, answer, chunk_ids, corpus, embed_model, "
            "llm_provider, llm_model, prompt_version) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) "
            "RETURNING id",
            (
                query_id,
                answer,
                chunk_ids,
                Jsonb(corpus),
                embed_model,
                llm_provider,
                llm_model,
                prompt_version,
            ),
        ).fetchone()["id"]
