from typing import Any
from uuid import UUID

from psycopg import Connection

from ..core.errors import NotFoundError
from ..repositories.answer import FeedbackRepository


class FeedbackService:
    def __init__(self, conn: Connection, feedback: FeedbackRepository) -> None:
        self._conn = conn
        self._feedback = feedback

    def set(self, answer_id: UUID, rating: str | None) -> dict[str, Any]:
        row = self._feedback.set(answer_id, rating)
        if row is None:
            raise NotFoundError("answer not found")
        self._conn.commit()
        return row
