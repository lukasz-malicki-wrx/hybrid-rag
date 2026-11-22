from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Query, Response

from ...schemas.conversation import (
    ConversationDetail,
    ConversationDocuments,
    ConversationOut,
    ConversationUpdate,
    DocumentRef,
)
from ..deps import ConversationServiceDep

router = APIRouter(prefix="/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationOut])
def list_conversations(
    conversations: ConversationServiceDep,
    group_id: UUID | None = None,
    favorites: bool = False,
    limit: Annotated[int, Query(ge=1, le=200)] = 50,
):
    """Most recently used first; with favorites=true, favourites in the order they were added."""
    return conversations.list(group_id, favorites, limit)


@router.get("/{conversation_id}", response_model=ConversationDetail)
def get_conversation(conversation_id: UUID, conversations: ConversationServiceDep):
    return conversations.detail(conversation_id)


@router.patch(
    "/{conversation_id}",
    response_model=ConversationOut,
    responses={409: {"description": "Favourite limit (10) reached"}},
)
def update_conversation(
    conversation_id: UUID, body: ConversationUpdate, conversations: ConversationServiceDep
):
    return conversations.update(conversation_id, body.model_dump(exclude_unset=True))


@router.put("/{conversation_id}/documents", response_model=list[DocumentRef])
def set_conversation_documents(
    conversation_id: UUID, body: ConversationDocuments, conversations: ConversationServiceDep
):
    """Choose the documents this conversation searches. An empty list returns to the default
    scope: the conversation's group, or all documents."""
    return conversations.set_documents(conversation_id, body.document_ids)


@router.delete("/{conversation_id}", status_code=204)
def delete_conversation(conversation_id: UUID, conversations: ConversationServiceDep):
    conversations.delete(conversation_id)
    return Response(status_code=204)
