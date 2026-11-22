from datetime import datetime

from pydantic import BaseModel, Field

PERSONAL_CONTEXT_MAX = 2000


class SettingsIn(BaseModel):
    personal_context: str = Field(
        max_length=PERSONAL_CONTEXT_MAX,
        description="How answers should be written (language, length, format, tone). "
        "It cannot change that answers come only from the documents and cite them. "
        "An empty string turns it off.",
    )


class SettingsOut(BaseModel):
    personal_context: str
    updated_at: datetime | None
