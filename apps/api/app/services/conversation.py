from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from uuid import UUID

from psycopg import Connection
from psycopg.errors import CheckViolation

from ..core.errors import ConflictError, NotFoundError
from ..rag.conversation import HISTORY_TURNS, Turn, make_title
from ..repositories.chunk import ChunkRepository
from ..repositories.conversation import ConversationRepository
from ..repositories.document import DocumentRepository
from ..repositories.group import GroupRepository

Row = dict[str, Any]
FAVORITE_LIMIT = 10  # enforced by a database trigger; the constant is for messages and docs


@dataclass(frozen=True)
class TurnContext:
    conversation: Row
    created: bool
    history: list[Turn]
    # Documents to search: the pinned ones, else the group's, else None (= all documents).
    scope: list[UUID] | None


def public(row: Row) -> Row:
    return {**row, "favorite": row.get("favorite_at") is not None}


class ConversationService:
    def __init__(
        self,
        conn: Connection,
        conversations: ConversationRepository,
        groups: GroupRepository,
        chunks: ChunkRepository,
        documents: DocumentRepository,
    ) -> None:
        self._conn = conn
        self._conversations = conversations
        self._groups = groups
        self._chunks = chunks
        self._documents = documents

    def list(self, group_id: UUID | None, favorites: bool, limit: int) -> list[Row]:
        return [public(r) for r in self._conversations.list(group_id, favorites, limit)]

    def get(self, conversation_id: UUID) -> Row:
        conv = self._conversations.get(conversation_id)
        if conv is None:
            raise NotFoundError("conversation not found")
        return conv

    def detail(self, conversation_id: UUID) -> Row:
        conv = self.get(conversation_id)
        rows = self._conversations.messages(conversation_id)
        chunk_ids = [cid for r in rows for cid in (r["chunk_ids"] or [])]
        chunks = {c["id"]: c for c in self._chunks.by_ids(chunk_ids)} if chunk_ids else {}
        attached_ids = list({d for r in rows for d in r["attached_document_ids"]})
        attached = self._documents.refs(attached_ids) if attached_ids else {}
        messages = []
        for r in rows:
            answer = None
            if r["answer_id"] is not None:
                sources = [
                    {
                        "n": n,
                        "chunk_id": cid,
                        "document_id": chunks[cid]["document_id"],
                        "filename": chunks[cid]["filename"],
                        "version": chunks[cid]["version"],
                        "page": chunks[cid]["page"],
                        "text": chunks[cid]["text"],
                    }
                    for n, cid in enumerate(r["chunk_ids"] or [], start=1)
                    if cid in chunks
                ]
                answer = {
                    "id": r["answer_id"],
                    "text": r["answer"],
                    "refused": r["refused"],
                    "uncited": r["uncited"],
                    "stopped": r["stopped"],
                    "citations": r["citations"] or [],
                    "sources": sources,
                    "created_at": r["answered_at"],
                }
            messages.append(
                {
                    "query_id": r["query_id"],
                    "question": r["question"],
                    "created_at": r["created_at"],
                    "attachments": [
                        attached[d] for d in r["attached_document_ids"] if d in attached
                    ],
                    "answer": answer,
                }
            )
        return {
            **public(conv),
            "documents": self._conversations.documents(conversation_id),
            "messages": messages,
        }

    def set_documents(self, conversation_id: UUID, document_ids: list[UUID]) -> list[Row]:
        """Choose which documents the conversation searches; [] = the default scope."""
        self.get(conversation_id)
        ids = list(dict.fromkeys(document_ids))
        self._require_active(ids)
        self._conversations.set_documents(conversation_id, ids)
        self._conn.commit()
        return self._conversations.documents(conversation_id)

    def _require_active(self, document_ids: list[UUID]) -> None:
        missing = self._documents.missing_or_inactive(document_ids) if document_ids else []
        if missing:
            raise NotFoundError(f"{len(missing)} of the selected documents are not available")

    def update(self, conversation_id: UUID, changes: dict[str, Any]) -> Row:
        self.get(conversation_id)
        if changes.get("group_id") is not None and self._groups.get(changes["group_id"]) is None:
            raise NotFoundError("group not found")
        try:
            conv = self._conversations.update(conversation_id, changes)
        except CheckViolation:
            self._conn.rollback()
            raise ConflictError(
                f"at most {FAVORITE_LIMIT} favourite conversations are allowed"
            ) from None
        self._conn.commit()
        return public(conv)

    def delete(self, conversation_id: UUID) -> None:
        if not self._conversations.soft_delete(conversation_id):
            raise NotFoundError("conversation not found")
        self._conn.commit()

    def start_turn(
        self,
        question: str,
        conversation_id: UUID | None,
        group_id: UUID | None,
        pin_document_ids: list[UUID] | None = None,
        attached_document_ids: list[UUID] | None = None,
    ) -> TurnContext:
        """Resolve (or create) the conversation for a new question, pin the chosen and the
        attached documents to it, and return its recent history and search scope."""
        pins = list(dict.fromkeys([*(pin_document_ids or []), *(attached_document_ids or [])]))
        self._require_active(pins)
        if conversation_id is not None:
            conv, created = self.get(conversation_id), False
        else:
            if group_id is not None and self._groups.get(group_id) is None:
                raise NotFoundError("group not found")
            conv, created = self._conversations.create(make_title(question), group_id), True
            self._conn.commit()
        if pins:
            self._conversations.pin(conv["id"], pins)
            self._conn.commit()
        history = [
            Turn(r["question"], r["answer"])
            for r in self._conversations.history(conv["id"], HISTORY_TURNS)
        ]
        pinned = [d["id"] for d in self._conversations.documents(conv["id"]) if d["active"]]
        if pinned:
            scope = pinned
        elif conv["group_id"]:
            scope = self._groups.document_ids(conv["group_id"])
        else:
            scope = None
        return TurnContext(conv, created, history, scope)
