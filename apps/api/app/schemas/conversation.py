from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field

from .answer import SourceOut


class ConversationOut(BaseModel):
    id: UUID
    group_id: UUID | None
    title: str
    created_at: datetime
    updated_at: datetime
    favorite: bool
    preview: str | None = Field(
        default=None, description="Start of the latest answer; null before the first one"
    )


class DocumentRef(BaseModel):
    id: UUID
    filename: str
    version: int
    status: str
    active: bool


class ConversationDocuments(BaseModel):
    document_ids: list[UUID] = Field(
        max_length=200, description="Documents to search; an empty list = the default scope"
    )


class ConversationUpdate(BaseModel):
    """Only the fields sent are changed. group_id: null moves it out of any group."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    favorite: bool | None = None
    group_id: UUID | None = None


class AnswerOut(BaseModel):
    id: UUID
    text: str
    refused: bool | None
    uncited: bool | None
    stopped: bool
    citations: list[int]
    sources: list[SourceOut]
    rating: Literal["up", "down"] | None = Field(
        default=None, description="The reader's rating; null when not rated"
    )
    created_at: datetime


class MessageOut(BaseModel):
    query_id: UUID
    question: str
    created_at: datetime
    attachments: list[DocumentRef] = Field(description="Files attached to this question")
    answer: AnswerOut | None = Field(description="Null when generation failed")


class ConversationDetail(ConversationOut):
    documents: list[DocumentRef] = Field(
        description="Pinned documents. When non-empty, the conversation searches only these "
        "(inactive ones are skipped); otherwise its group's documents, or all documents."
    )
    messages: list[MessageOut]
