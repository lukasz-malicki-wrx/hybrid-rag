from collections.abc import Iterator

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from ...schemas.answer import AnswerEvent, AnswerRequest
from ..deps import AnswerServiceDep, SearchServiceDep

router = APIRouter(prefix="/answers", tags=["answers"])


def _sse(events: Iterator[AnswerEvent]) -> Iterator[str]:
    for event in events:
        yield f"data: {event.model_dump_json()}\n\n"


@router.post(
    "",
    response_class=StreamingResponse,
    responses={
        200: {
            "description": "Server-sent events; each `data:` line is one AnswerEvent as JSON.",
            "content": {
                "text/event-stream": {"schema": {"$ref": "#/components/schemas/AnswerEvent"}}
            },
        }
    },
)
def answer(req: AnswerRequest, search: SearchServiceDep, answers: AnswerServiceDep):
    """Server-sent events: `sources`, then `token`s, then `done` (or `error`)."""
    hits = search.search(req.question, req.document_ids, req.k, req.mode)
    events = answers.stream(req.question, req.document_ids, {"k": req.k, "mode": req.mode}, hits)
    return StreamingResponse(
        _sse(events),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
