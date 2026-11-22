from fastapi import APIRouter

from ...schemas.search import SearchHit, SearchRequest
from ..deps import SearchServiceDep

router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=list[SearchHit])
def search(req: SearchRequest, service: SearchServiceDep):
    return service.search(req.question, req.document_ids, req.k, req.mode)
