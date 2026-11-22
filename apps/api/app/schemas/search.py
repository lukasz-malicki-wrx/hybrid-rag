from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    document_ids: list[UUID] | None = Field(
        default=None,
        min_length=1,
        description="Limit the search to these documents; omit or null for all active documents",
    )
    k: int = Field(default=8, ge=1, le=50)
    mode: Literal["hybrid", "vector", "fulltext"] = "hybrid"


class SearchHit(BaseModel):
    id: int
    document_id: UUID
    filename: str
    version: int
    page: int
    position: int
    text: str
    distance: float | None = None
    score: float
    vector_rank: int | None
    fulltext_rank: int | None
