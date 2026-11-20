from datetime import datetime
from typing import Any

from pydantic import BaseModel


class AuditEntryOut(BaseModel):
    id: int
    ts: datetime
    event: str
    payload: dict[str, Any]
    prev_hash: str | None
    hash: str


class AuditVerifyOut(BaseModel):
    valid: bool
    first_broken_id: int | None
