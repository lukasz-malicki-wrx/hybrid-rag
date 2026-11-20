from typing import Any

from psycopg import Connection
from psycopg.types.json import Jsonb

Row = dict[str, Any]


class AuditRepository:
    def __init__(self, conn: Connection) -> None:
        self._conn = conn

    def append(self, event: str, payload: dict[str, Any] | None = None) -> None:
        """Timestamp and hash chain are set by a database trigger."""
        self._conn.execute(
            "INSERT INTO audit_log (event, payload) VALUES (%s, %s)",
            (event, Jsonb(payload or {})),
        )

    def recent(self, limit: int) -> list[Row]:
        return self._conn.execute(
            "SELECT * FROM audit_log ORDER BY id DESC LIMIT %s", (limit,)
        ).fetchall()

    def first_broken_id(self) -> int | None:
        return self._conn.execute("SELECT audit_verify() AS id").fetchone()["id"]
