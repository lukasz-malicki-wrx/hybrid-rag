from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field


class DocumentOut(BaseModel):
    id: UUID
    filename: str
    sha256: str
    version: int
    supersedes_id: UUID | None
    status: Literal["processing", "ready", "failed"]
    active: bool
    pages: int | None
    error: str | None = Field(
        description="Last error; set while a failed attempt waits for its retry, or when failed"
    )
    progress: int = Field(description="Chunks embedded so far")
    progress_total: int | None = Field(description="Chunks to embed; null until text is split")
    uploaded_at: datetime
    deactivated_at: datetime | None


class UploadOut(DocumentOut):
    duplicate: bool


class DocumentStatusEvent(BaseModel):
    """One server-sent event of GET /documents/{id}/events."""

    type: Literal["status"] = "status"
    document_id: UUID
    status: Literal["processing", "ready", "failed"]
    progress: int
    progress_total: int | None
    error: str | None

    @classmethod
    def from_row(cls, row: dict[str, Any]) -> "DocumentStatusEvent":
        return cls(
            document_id=row["id"],
            status=row["status"],
            progress=row["progress"],
            progress_total=row["progress_total"],
            error=row["error"],
        )


class ChunkOut(BaseModel):
    """One searchable piece of a document, as it was cut at ingestion."""

    id: int
    page: int
    position: int = Field(description="Order of the chunk within its page")
    text: str
    chars: int
