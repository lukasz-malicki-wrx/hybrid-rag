from fastapi import APIRouter, Response

from ...schemas.health import HealthOut, LiveOut
from ..deps import HealthServiceDep

router = APIRouter(tags=["health"])


@router.get("/health/live", response_model=LiveOut)
def live():
    """Liveness: the process answers. Used by the container healthcheck."""
    return LiveOut()


@router.get("/health", response_model=HealthOut, responses={503: {"model": HealthOut}})
def health(service: HealthServiceDep, response: Response):
    """Readiness: database, pgvector and the required models. 503 when degraded."""
    result = service.check()
    if result["status"] != "ok":
        response.status_code = 503
    return result
