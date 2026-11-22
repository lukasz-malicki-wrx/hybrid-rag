from __future__ import annotations

from typing import Any
from uuid import UUID

from psycopg import Connection
from psycopg.errors import UniqueViolation

from ..core.errors import ConflictError, NotFoundError
from ..repositories.conversation import ConversationRepository
from ..repositories.document import DocumentRepository
from ..repositories.group import GroupRepository

Row = dict[str, Any]


class GroupService:
    def __init__(
        self,
        conn: Connection,
        groups: GroupRepository,
        conversations: ConversationRepository,
        documents: DocumentRepository,
    ) -> None:
        self._conn = conn
        self._groups = groups
        self._conversations = conversations
        self._documents = documents

    def list(self) -> list[Row]:
        return self._groups.list()

    def get(self, group_id: UUID) -> Row:
        group = self._groups.get(group_id)
        if group is None:
            raise NotFoundError("group not found")
        return group

    def create(self, name: str) -> Row:
        name = name.strip()
        try:
            group_id = self._groups.create(name)["id"]
        except UniqueViolation:
            self._conn.rollback()
            raise ConflictError(f"a group named '{name}' already exists") from None
        self._conn.commit()
        return self.get(group_id)

    def rename(self, group_id: UUID, name: str) -> Row:
        name = name.strip()
        try:
            renamed = self._groups.rename(group_id, name)
        except UniqueViolation:
            self._conn.rollback()
            raise ConflictError(f"a group named '{name}' already exists") from None
        if not renamed:
            raise NotFoundError("group not found")
        self._conn.commit()
        return self.get(group_id)

    def delete(self, group_id: UUID) -> dict[str, Any]:
        """Delete the group and every conversation in it (soft delete: rows are kept, hidden).
        Documents stay in the library; only their membership in the group is removed."""
        self.get(group_id)
        deleted = self._conversations.soft_delete_in_group(group_id)
        self._groups.soft_delete(group_id)
        self._conn.commit()
        return {"id": group_id, "deleted_conversations": len(deleted)}

    def add_document(self, group_id: UUID, document_id: UUID) -> None:
        self.get(group_id)
        doc = self._documents.get(document_id)
        if doc is None or not doc["active"]:
            raise NotFoundError("active document not found")
        self._groups.link_document(group_id, document_id)
        self._conn.commit()

    def remove_document(self, group_id: UUID, document_id: UUID) -> None:
        self.get(group_id)
        if not self._groups.unlink_document(group_id, document_id):
            raise NotFoundError("document is not in this group")
        self._conn.commit()
