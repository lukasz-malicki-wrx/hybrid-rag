from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, Field


class AnswerRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    conversation_id: UUID | None = Field(
        default=None, description="Continue this conversation; omit to start a new one"
    )
    group_id: UUID | None = Field(
        default=None,
        description="Group of a new conversation; its documents become the search scope",
    )
    pin_document_ids: list[UUID] | None = Field(
        default=None,
        min_length=1,
        max_length=50,
        description="Documents to pin to the conversation before answering; a conversation "
        "with pinned documents searches only those",
    )
    attached_document_ids: list[UUID] | None = Field(
        default=None,
        min_length=1,
        max_length=20,
        description="Files attached to this question: shown with it in the conversation and "
        "pinned to the conversation like pin_document_ids",
    )
    document_ids: list[UUID] | None = Field(
        default=None,
        min_length=1,
        description="Limit the search to these documents; omit or null for all active documents",
    )
    k: int = Field(default=6, ge=1, le=20)
    mode: Literal["hybrid", "vector", "fulltext"] = "hybrid"


class FeedbackIn(BaseModel):
    rating: Literal["up", "down"] | None = Field(description="null withdraws the rating")


class FeedbackOut(BaseModel):
    answer_id: UUID
    rating: Literal["up", "down"] | None


class SourceOut(BaseModel):
    n: int = Field(description="Citation number used in the answer as [n]")
    chunk_id: int
    document_id: UUID
    filename: str
    version: int
    page: int
    text: str


class ConversationEvent(BaseModel):
    """First event: the conversation this answer belongs to (created if it was new)."""

    type: Literal["conversation"] = "conversation"
    conversation_id: UUID
    title: str
    created: bool


class SourcesEvent(BaseModel):
    """First event: the excerpts given to the model, numbered for citations."""

    type: Literal["sources"] = "sources"
    sources: list[SourceOut]


class TokenEvent(BaseModel):
    """A piece of the answer text, in order."""

    type: Literal["token"] = "token"
    text: str


class DoneEvent(BaseModel):
    """Final event after the answer was stored."""

    type: Literal["done"] = "done"
    answer_id: UUID
    refused: bool
    citations: list[int]
    uncited: bool = Field(description="True when the answer is not a refusal but cites nothing")
    stopped: bool = Field(default=False, description="Generation was stopped by the client")


class ErrorEvent(BaseModel):
    type: Literal["error"] = "error"
    message: str


AnswerEvent = Annotated[
    ConversationEvent | SourcesEvent | TokenEvent | DoneEvent | ErrorEvent,
    Field(discriminator="type"),
]
