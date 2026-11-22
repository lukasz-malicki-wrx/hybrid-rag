from typing import Any

from psycopg import Connection

Row = dict[str, Any]


class SettingsRepository:
    """User settings: a single row (there are no user accounts yet)."""

    def __init__(self, conn: Connection) -> None:
        self._conn = conn

    def get(self) -> Row | None:
        return self._conn.execute(
            "SELECT personal_context, updated_at FROM user_settings"
        ).fetchone()

    def set_personal_context(self, text: str) -> Row:
        return self._conn.execute(
            "INSERT INTO user_settings (personal_context, updated_at) VALUES (%s, now()) "
            "ON CONFLICT (id) DO UPDATE SET personal_context = EXCLUDED.personal_context, "
            "updated_at = now() RETURNING personal_context, updated_at",
            (text,),
        ).fetchone()
