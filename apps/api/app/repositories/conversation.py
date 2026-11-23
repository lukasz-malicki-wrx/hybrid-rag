from __future__ import annotations

from typing import Any
from uuid import UUID

from psycopg import Connection

Row = dict[str, Any]

_COLUMNS = "id, group_id, title, created_at, updated_at, favorite_at"
# Enough of the latest complete answer to make a list preview from (rag.conversation.make_preview).
# Refusals and answers stopped half-way ("Z", "-") say nothing about the conversation, so they
# are skipped: the preview is the latest answer that was written to the end.
_LATEST_ANSWER_CHARS = 400
_WITH_LATEST_ANSWER = f"""
    SELECT c.id, c.group_id, c.title, c.created_at, c.updated_at, c.favorite_at, la.latest_answer
    FROM conversations c LEFT JOIN LATERAL (
        SELECT left(a.answer, {_LATEST_ANSWER_CHARS}) AS latest_answer
        FROM queries q JOIN answers a ON a.query_id = q.id
        WHERE q.conversation_id = c.id AND NOT a.refused AND NOT a.stopped
        ORDER BY q.created_at DESC LIMIT 1
    ) la ON true
"""  # noqa: S608 - fixed column list


class ConversationRepository:
    def __init__(self, conn: Connection) -> None:
        self._conn = conn

    def create(self, title: str, group_id: UUID | None) -> Row:
        return self._conn.execute(
            f"INSERT INTO conversations (title, group_id) VALUES (%s, %s) RETURNING {_COLUMNS}",  # noqa: S608 - fixed column list
            (title, group_id),
        ).fetchone()

    def get(self, conversation_id: UUID) -> Row | None:
        return self._conn.execute(
            f"{_WITH_LATEST_ANSWER} WHERE c.id = %s AND c.deleted_at IS NULL",
            (conversation_id,),
        ).fetchone()

    def list(self, group_id: UUID | None, favorites: bool, limit: int) -> list[Row]:
        """Active conversations, most recently used first (favourites: in the order added)."""
        order = "favorite_at" if favorites else "updated_at DESC"
        return self._conn.execute(
            f"{_WITH_LATEST_ANSWER} WHERE c.deleted_at IS NULL "
            "AND (%(group)s::uuid IS NULL OR c.group_id = %(group)s::uuid) "
            "AND (NOT %(fav)s OR c.favorite_at IS NOT NULL) "
            f"ORDER BY c.{order} LIMIT %(limit)s",
            {"group": group_id, "fav": favorites, "limit": limit},
        ).fetchall()

    def update(self, conversation_id: UUID, changes: dict[str, Any]) -> Row | None:
        """changes: any of title, group_id, favorite (bool)."""
        sets, params = [], {"id": conversation_id}
        if "title" in changes:
            sets.append("title = %(title)s")
            params["title"] = changes["title"]
        if "group_id" in changes:
            sets.append("group_id = %(group_id)s")
            params["group_id"] = changes["group_id"]
        if "favorite" in changes:
            sets.append(
                "favorite_at = CASE WHEN %(favorite)s THEN coalesce(favorite_at, now()) END"
            )
            params["favorite"] = changes["favorite"]
        if sets:
            self._conn.execute(
                f"UPDATE conversations SET {', '.join(sets)} "  # noqa: S608 - fixed column names
                "WHERE id = %(id)s AND deleted_at IS NULL",
                params,
            )
        return self.get(conversation_id)

    def touch(self, conversation_id: UUID) -> None:
        self._conn.execute(
            "UPDATE conversations SET updated_at = now() WHERE id = %s", (conversation_id,)
        )

    def soft_delete(self, conversation_id: UUID) -> bool:
        cur = self._conn.execute(
            "UPDATE conversations SET deleted_at = now(), favorite_at = NULL "
            "WHERE id = %s AND deleted_at IS NULL",
            (conversation_id,),
        )
        return cur.rowcount == 1

    def soft_delete_in_group(self, group_id: UUID) -> list[UUID]:
        rows = self._conn.execute(
            "UPDATE conversations SET deleted_at = now(), favorite_at = NULL "
            "WHERE group_id = %s AND deleted_at IS NULL RETURNING id",
            (group_id,),
        ).fetchall()
        return [r["id"] for r in rows]

    def documents(self, conversation_id: UUID) -> list[Row]:
        """Pinned documents, in the order they were pinned."""
        return self._conn.execute(
            """
            SELECT d.id, d.filename, d.version, d.status, d.active
            FROM conversation_documents cd JOIN documents d ON d.id = cd.document_id
            WHERE cd.conversation_id = %s AND cd.removed_at IS NULL
            ORDER BY cd.added_at, d.filename
            """,
            (conversation_id,),
        ).fetchall()

    def pin(self, conversation_id: UUID, document_ids: list[UUID]) -> int:
        """Add documents (already pinned ones are kept). Returns how many were new."""
        cur = self._conn.execute(
            "INSERT INTO conversation_documents (conversation_id, document_id) "
            "SELECT %s, unnest(%s::uuid[]) "
            "ON CONFLICT (conversation_id, document_id) DO UPDATE SET removed_at = NULL, "
            "added_at = now() WHERE conversation_documents.removed_at IS NOT NULL",
            (conversation_id, document_ids),
        )
        return cur.rowcount

    def set_documents(self, conversation_id: UUID, document_ids: list[UUID]) -> None:
        """Replace the pinned set (unpinned rows are marked removed); [] = default scope."""
        self._conn.execute(
            "UPDATE conversation_documents SET removed_at = now() "
            "WHERE conversation_id = %s AND removed_at IS NULL "
            "AND NOT (document_id = ANY(%s::uuid[]))",
            (conversation_id, document_ids),
        )
        if document_ids:
            self.pin(conversation_id, document_ids)

    def messages(self, conversation_id: UUID) -> list[Row]:
        """Every question in order, with its answer when one was stored."""
        return self._conn.execute(
            """
            SELECT q.id AS query_id, q.question, q.created_at, q.attached_document_ids,
                   a.id AS answer_id, a.answer, a.refused, a.uncited, a.stopped,
                   a.citations, a.chunk_ids, a.created_at AS answered_at, f.rating
            FROM queries q LEFT JOIN answers a ON a.query_id = q.id
            LEFT JOIN answer_feedback f ON f.answer_id = a.id
            WHERE q.conversation_id = %s
            ORDER BY q.created_at
            """,
            (conversation_id,),
        ).fetchall()

    def history(self, conversation_id: UUID, turns: int) -> list[Row]:
        """The last answered turns, oldest first, for the model's context."""
        rows = self._conn.execute(
            """
            SELECT q.question, a.answer, a.refused FROM queries q
            JOIN answers a ON a.query_id = q.id
            WHERE q.conversation_id = %s
            ORDER BY q.created_at DESC LIMIT %s
            """,
            (conversation_id, turns),
        ).fetchall()
        return list(reversed(rows))
