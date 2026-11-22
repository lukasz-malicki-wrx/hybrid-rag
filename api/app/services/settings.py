from typing import Any

from psycopg import Connection

from ..repositories.settings import SettingsRepository


class SettingsService:
    def __init__(self, conn: Connection, settings: SettingsRepository) -> None:
        self._conn = conn
        self._settings = settings

    def personal_context(self) -> str:
        """How answers should be written; empty when not set."""
        row = self._settings.get()
        return row["personal_context"] if row else ""

    def get(self) -> dict[str, Any]:
        row = self._settings.get()
        return {
            "personal_context": row["personal_context"] if row else "",
            "updated_at": row["updated_at"] if row else None,
        }

    def update(self, personal_context: str) -> dict[str, Any]:
        """Replace the personal context; an empty text turns it off."""
        row = self._settings.set_personal_context(personal_context.strip())
        self._conn.commit()
        return {"personal_context": row["personal_context"], "updated_at": row["updated_at"]}
