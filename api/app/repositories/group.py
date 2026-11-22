from __future__ import annotations

from typing import Any
from uuid import UUID

from psycopg import Connection

Row = dict[str, Any]

_WITH_COUNTS = """
    SELECT g.id, g.name, g.created_at,
        (SELECT count(*) FROM conversations c
         WHERE c.group_id = g.id AND c.deleted_at IS NULL) AS conversation_count,
        (SELECT count(*) FROM group_documents gd JOIN documents d ON d.id = gd.document_id
         WHERE gd.group_id = g.id AND gd.removed_at IS NULL AND d.active) AS document_count
    FROM groups g
    WHERE g.deleted_at IS NULL
"""


class GroupRepository:
    def __init__(self, conn: Connection) -> None:
        self._conn = conn

    def list(self) -> list[Row]:
        return self._conn.execute(_WITH_COUNTS + " ORDER BY lower(g.name)").fetchall()

    def get(self, group_id: UUID) -> Row | None:
        """Active group with its conversation and document counts."""
        return self._conn.execute(_WITH_COUNTS + " AND g.id = %s", (group_id,)).fetchone()

    def create(self, name: str) -> Row:
        return self._conn.execute(
            "INSERT INTO groups (name) VALUES (%s) RETURNING id", (name,)
        ).fetchone()

    def rename(self, group_id: UUID, name: str) -> bool:
        cur = self._conn.execute(
            "UPDATE groups SET name = %s WHERE id = %s AND deleted_at IS NULL", (name, group_id)
        )
        return cur.rowcount == 1

    def soft_delete(self, group_id: UUID) -> bool:
        cur = self._conn.execute(
            "UPDATE groups SET deleted_at = now() WHERE id = %s AND deleted_at IS NULL",
            (group_id,),
        )
        return cur.rowcount == 1

    def link_document(self, group_id: UUID, document_id: UUID) -> bool:
        """Add (or restore) a document. Returns False when it was already in the group."""
        cur = self._conn.execute(
            "INSERT INTO group_documents (group_id, document_id) VALUES (%s, %s) "
            "ON CONFLICT (group_id, document_id) DO UPDATE SET removed_at = NULL, "
            "added_at = now() WHERE group_documents.removed_at IS NOT NULL",
            (group_id, document_id),
        )
        return cur.rowcount == 1

    def unlink_document(self, group_id: UUID, document_id: UUID) -> bool:
        """Soft removal: the link is kept and marked removed."""
        cur = self._conn.execute(
            "UPDATE group_documents SET removed_at = now() "
            "WHERE group_id = %s AND document_id = %s AND removed_at IS NULL",
            (group_id, document_id),
        )
        return cur.rowcount == 1

    def document_ids(self, group_id: UUID) -> list[UUID]:
        rows = self._conn.execute(
            "SELECT document_id FROM group_documents WHERE group_id = %s AND removed_at IS NULL",
            (group_id,),
        ).fetchall()
        return [r["document_id"] for r in rows]
