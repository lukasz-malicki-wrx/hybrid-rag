import hashlib
import logging
from collections.abc import Callable, Iterator
from dataclasses import dataclass
from typing import Any
from uuid import UUID

from psycopg import Connection

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
from ..repositories.audit import AuditRepository
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


class AnswerService:
    """Generates grounded, cited answers and records them for traceability.

    Streaming runs after the request handler returned, so persistence uses its own connection.
    """

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
        self, question: str, hits: list[dict[str, Any]]
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

        system, user = build_prompt(question, hits)
        parts: list[str] = []
        for token in self._llm.stream(system, user):
            parts.append(token)
            yield TokenEvent(text=token)
        text = "".join(parts)
        refused = is_refusal(text)
        citations = [] if refused else extract_citations(text, len(hits))
        yield Completion(text, refused, citations, uncited=not refused and not citations)

    def stream(
        self,
        question: str,
        docs: list[UUID] | None,
        params: dict[str, Any],
        hits: list[dict[str, Any]],
    ) -> Iterator[AnswerEvent]:
        """Generate, then persist; the final DoneEvent carries the stored answer's id."""
        fitted = fit_to_budget(question, hits, self._context_tokens, self._answer_tokens)
        if len(fitted) < len(hits):
            params = {**params, "dropped_for_context": len(hits) - len(fitted)}
        hits = fitted
        try:
            for item in self.generate(question, hits):
                if isinstance(item, Completion):
                    answer_id = self._save(question, docs, params, hits, item)
                    yield DoneEvent(
                        answer_id=answer_id,
                        refused=item.refused,
                        citations=item.citations,
                        uncited=item.uncited,
                    )
                else:
                    yield item
        except Exception:
            logger.exception("answer generation failed")
            self._audit_failure(question, params)
            yield ErrorEvent(message="answer generation failed")

    def _save(
        self,
        question: str,
        docs: list[UUID] | None,
        params: dict[str, Any],
        hits: list[dict[str, Any]],
        done: Completion,
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
            query_id = QueryRepository(conn).create(question, docs or [], params)
            answer_id = AnswerRepository(conn).create(
                query_id,
                done.text,
                chunk_ids,
                list(corpus.values()),
                self._embed_model,
                self._llm.name,
                self._llm.model,
                PROMPT_VERSION,
            )
            AuditRepository(conn).append(
                "answer.generated",
                {
                    "query_id": str(query_id),
                    "answer_id": str(answer_id),
                    "llm_provider": self._llm.name,
                    "llm_model": self._llm.model,
                    "prompt_version": PROMPT_VERSION,
                    # The hash ties the audit entry to the stored answer text: any later
                    # change to the answer row no longer matches the tamper-evident log.
                    "answer_sha256": hashlib.sha256(done.text.encode()).hexdigest(),
                    "chunk_ids": chunk_ids,
                    "cited": done.citations,
                    "refused": done.refused,
                    "uncited": done.uncited,
                },
            )
        return answer_id

    def _audit_failure(self, question: str, params: dict[str, Any]) -> None:
        try:
            with self._connect() as conn:
                AuditRepository(conn).append(
                    "answer.failed",
                    {"question": question[:200], "params": params, "llm_model": self._llm.model},
                )
        except Exception:
            logger.exception("could not audit answer failure")
