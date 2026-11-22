from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class GroupIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class GroupOut(BaseModel):
    id: UUID
    name: str
    created_at: datetime
    conversation_count: int = Field(
        description="Active conversations; all of them are deleted with the group"
    )
    document_count: int


class GroupDeleted(BaseModel):
    id: UUID
    deleted_conversations: int
