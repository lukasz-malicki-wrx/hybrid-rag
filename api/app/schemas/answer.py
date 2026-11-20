from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, Field


class AnswerRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    document_ids: list[UUID] | None = Field(
        default=None,
        min_length=1,
        description="Limit the search to these documents; omit or null for all active documents",
    )
    k: int = Field(default=6, ge=1, le=20)
    mode: Literal["hybrid", "vector", "fulltext"] = "hybrid"


class SourceOut(BaseModel):
    n: int = Field(description="Citation number used in the answer as [n]")
    chunk_id: int
    document_id: UUID
    filename: str
    version: int
    page: int
    text: str


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


class ErrorEvent(BaseModel):
    type: Literal["error"] = "error"
    message: str


AnswerEvent = Annotated[
    SourcesEvent | TokenEvent | DoneEvent | ErrorEvent, Field(discriminator="type")
]
