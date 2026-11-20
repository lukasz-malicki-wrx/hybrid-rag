from typing import Annotated

from fastapi import APIRouter, Query

from ...schemas.audit import AuditEntryOut, AuditVerifyOut
from ..deps import AuditServiceDep

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("", response_model=list[AuditEntryOut])
def list_audit(service: AuditServiceDep, limit: Annotated[int, Query(ge=1, le=1000)] = 100):
    return service.recent(limit)


@router.get("/verify", response_model=AuditVerifyOut)
def verify_audit(service: AuditServiceDep):
    return service.verify()
