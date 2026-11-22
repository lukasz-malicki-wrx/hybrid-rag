import logging
import queue
import threading
from collections.abc import Callable, Iterator
from contextlib import closing
from dataclasses import dataclass
from typing import Any
from uuid import UUID

from psycopg import Connection

from ..rag.conversation import Turn, format_history
from ..rag.llm import LLMProvider
from ..rag.prompt import (
    PROMPT_VERSION,
    REFUSAL,
    build_prompt,
    extract_citations,
    fit_to_budget,
    is_refusal,
)
from ..repositories.answer import AnswerRepository, QueryRepository
from ..repositories.conversation import ConversationRepository
from ..schemas.answer import (
    AnswerEvent,
    DoneEvent,
    ErrorEvent,
    SourceOut,
    SourcesEvent,
    TokenEvent,
)

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class Completion:
    """Internal end-of-generation marker (carries the full text, which is never streamed)."""

    text: str
    refused: bool
    citations: list[int]
    uncited: bool
    stopped: bool = False


class AnswerRun:
    """A generation running in its own thread, decoupled from the HTTP connection.

    The response relays next_event() until it returns None. If the client goes away, the
    response calls cancel(): the thread stops the model at the next token, closing the
    connection to it, and still stores what was generated (marked stopped).
    """

    def __init__(self) -> None:
        self._events: queue.Queue[AnswerEvent | None] = queue.Queue()
        self.cancelled = threading.Event()

    def next_event(self) -> AnswerEvent | None:
        return self._events.get()

    def cancel(self) -> None:
        self.cancelled.set()

    def put(self, event: AnswerEvent | None) -> None:
        self._events.put(event)


class AnswerService:
    """Generates grounded, cited answers and stores them with what they were based on."""

    def __init__(
        self,
        llm: LLMProvider,
        connect: Callable[[], Connection],
        embed_model: str,
        context_tokens: int = 8192,
        answer_tokens: int = 768,
    ) -> None:
        self._llm = llm
        self._connect = connect
        self._embed_model = embed_model
        self._context_tokens = context_tokens
        self._answer_tokens = answer_tokens

    def generate(
        self,
        question: str,
        hits: list[dict[str, Any]],
        history: str = "",
        cancel: threading.Event | None = None,
        personal: str = "",
    ) -> Iterator[SourcesEvent | TokenEvent | Completion]:
        """Pure generation: sources, then tokens, then a Completion. No persistence."""
        yield SourcesEvent(
            sources=[
                SourceOut(
                    n=n,
                    chunk_id=h["id"],
                    document_id=h["document_id"],
                    filename=h["filename"],
                    version=h["version"],
                    page=h["page"],
                    text=h["text"],
                )
                for n, h in enumerate(hits, start=1)
            ]
        )
        if not hits:
            yield TokenEvent(text=REFUSAL)
            yield Completion(REFUSAL, refused=True, citations=[], uncited=False)
            return

        system, user = build_prompt(question, hits, history, personal)
        parts: list[str] = []
        stopped = False
        # closing(): leaving the loop early closes the provider's HTTP stream right away,
        # which makes the model server stop generating.
        with closing(self._llm.stream(system, user)) as tokens:
            for token in tokens:
                if cancel is not None and cancel.is_set():
                    stopped = True
                    break
                parts.append(token)
                yield TokenEvent(text=token)
        text = "".join(parts)
        refused = is_refusal(text)
        citations = [] if refused else extract_citations(text, len(hits))
        yield Completion(
            text, refused, citations, uncited=not refused and not citations, stopped=stopped
        )

    def start(
        self,
        question: str,
        conversation_id: UUID | None,
        history: list[Turn],
        docs: list[UUID] | None,
        params: dict[str, Any],
        hits: list[dict[str, Any]],
        attached: list[UUID] | None = None,
        personal: str = "",
    ) -> AnswerRun:
        run = AnswerRun()
        threading.Thread(
            target=self._run,
            args=(
                run,
                question,
                conversation_id,
                history,
                docs,
                params,
                hits,
                attached or [],
                personal,
            ),
            name="answer",
            daemon=True,
        ).start()
        return run

    def _run(
        self,
        run: AnswerRun,
        question: str,
        conversation_id: UUID | None,
        history: list[Turn],
        docs: list[UUID] | None,
        params: dict[str, Any],
        hits: list[dict[str, Any]],
        attached: list[UUID],
        personal: str,
    ) -> None:
        try:
            history_text = format_history(history)
            fitted = fit_to_budget(
                question,
                hits,
                self._context_tokens,
                self._answer_tokens,
                history_text,
                personal,
            )
            if personal:
                # Stored with the question, so the style of an answer can be explained later.
                params = {**params, "personal_context": personal}
            if len(fitted) < len(hits):
                params = {**params, "dropped_for_context": len(hits) - len(fitted)}
            if history:
                params = {**params, "history_turns": len(history)}
            for item in self.generate(question, fitted, history_text, run.cancelled, personal):
                if isinstance(item, Completion):
                    answer_id = self._save(
                        question, conversation_id, docs, params, fitted, item, attached
                    )
                    run.put(
                        DoneEvent(
                            answer_id=answer_id,
                            refused=item.refused,
                            citations=item.citations,
                            uncited=item.uncited,
                            stopped=item.stopped,
                        )
                    )
                else:
                    run.put(item)
        except Exception:
            logger.exception("answer generation failed")
            run.put(ErrorEvent(message="answer generation failed"))
        finally:
            run.put(None)

    def _save(
        self,
        question: str,
        conversation_id: UUID | None,
        docs: list[UUID] | None,
        params: dict[str, Any],
        hits: list[dict[str, Any]],
        done: Completion,
        attached: list[UUID] | None = None,
    ) -> UUID:
        corpus = {
            str(h["document_id"]): {
                "id": str(h["document_id"]),
                "sha256": h["sha256"],
                "version": h["version"],
            }
            for h in hits
        }
        chunk_ids = [h["id"] for h in hits]
        with self._connect() as conn:
            # An empty list means "all active documents"; the API rejects an explicit [].
            query_id = QueryRepository(conn).create(
                question, docs or [], params, conversation_id, attached
            )
            answer_id = AnswerRepository(conn).create(
                query_id,
                done.text,
                chunk_ids,
                list(corpus.values()),
                self._embed_model,
                self._llm.name,
                self._llm.model,
                PROMPT_VERSION,
                refused=done.refused,
                uncited=done.uncited,
                citations=done.citations,
                stopped=done.stopped,
            )
            if conversation_id is not None:
                ConversationRepository(conn).touch(conversation_id)
        return answer_id
