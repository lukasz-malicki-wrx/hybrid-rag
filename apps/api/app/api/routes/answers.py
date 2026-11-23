from collections.abc import AsyncIterator
from uuid import UUID

from fastapi import APIRouter
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import StreamingResponse

from ...rag.conversation import retrieval_query
from ...schemas.answer import AnswerRequest, ConversationEvent, FeedbackIn, FeedbackOut
from ...services.answer import AnswerRun
from ..deps import (
    AnswerServiceDep,
    ConversationServiceDep,
    FeedbackServiceDep,
    SearchServiceDep,
    SettingsServiceDep,
)

router = APIRouter(prefix="/answers", tags=["answers"])


async def _relay(first: ConversationEvent, run: AnswerRun) -> AsyncIterator[str]:
    try:
        yield f"data: {first.model_dump_json()}\n\n"
        while (event := await run_in_threadpool(run.next_event)) is not None:
            yield f"data: {event.model_dump_json()}\n\n"
    finally:
        # Runs when the stream ends and when the client disconnects (e.g. a Stop button
        # aborting the request): the generation thread then stops the model.
        run.cancel()


@router.post(
    "",
    response_class=StreamingResponse,
    responses={
        200: {
            "description": "Server-sent events; each `data:` line is one AnswerEvent as JSON: "
            "`conversation`, `sources`, `token`s, then `done` (or `error`). Closing the "
            "connection stops generation; the partial answer is stored as stopped.",
            "content": {
                "text/event-stream": {"schema": {"$ref": "#/components/schemas/AnswerEvent"}}
            },
        }
    },
)
async def answer(
    req: AnswerRequest,
    conversations: ConversationServiceDep,
    search: SearchServiceDep,
    answers: AnswerServiceDep,
    settings: SettingsServiceDep,
):
    turn = await run_in_threadpool(
        conversations.start_turn,
        req.question,
        req.conversation_id,
        req.group_id,
        req.pin_document_ids,
        req.attached_document_ids,
    )
    docs = req.document_ids if req.document_ids is not None else turn.scope
    personal = await run_in_threadpool(settings.personal_context)
    hits = await run_in_threadpool(
        search.search, retrieval_query(req.question, turn.history), docs, req.k, req.mode
    )
    run = answers.start(
        req.question,
        turn.conversation["id"],
        turn.history,
        docs,
        {"k": req.k, "mode": req.mode},
        hits,
        req.attached_document_ids or [],
        personal,
    )
    first = ConversationEvent(
        conversation_id=turn.conversation["id"],
        title=turn.conversation["title"],
        created=turn.created,
    )
    return StreamingResponse(
        _relay(first, run),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.put(
    "/{answer_id}/feedback",
    response_model=FeedbackOut,
    responses={404: {"description": "No such answer, or its conversation was deleted"}},
)
def set_feedback(answer_id: UUID, body: FeedbackIn, feedback: FeedbackServiceDep):
    """Rate an answer; rating again replaces the rating, null withdraws it."""
    return feedback.set(answer_id, body.rating)
