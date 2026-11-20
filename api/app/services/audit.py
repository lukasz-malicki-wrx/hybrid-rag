from typing import Any

from ..repositories.audit import AuditRepository


class AuditService:
    MAX_LIMIT = 1000

    def __init__(self, audit: AuditRepository) -> None:
        self._audit = audit

    def recent(self, limit: int) -> list[dict[str, Any]]:
        return self._audit.recent(max(1, min(limit, self.MAX_LIMIT)))

    def verify(self) -> dict[str, Any]:
        broken = self._audit.first_broken_id()
        return {"valid": broken is None, "first_broken_id": broken}
