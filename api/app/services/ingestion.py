import logging
from collections.abc import Callable
from typing import Any
from uuid import UUID

from psycopg import Connection

from ..core.config import Settings
from ..rag.chunking import split_text
from ..rag.embedding import Embedder
from ..rag.pdf import extract_pages
from ..repositories.audit import AuditRepository
from ..repositories.chunk import ChunkRepository
from ..repositories.document import DocumentRepository
from ..repositories.job import JobRepository
from ..storage import FileStore

logger = logging.getLogger(__name__)
Row = dict[str, Any]


def retry_delay_seconds(attempt: int) -> int:
    """Exponential backoff after a failed attempt: 30 s, 2 min, 8 min, ... capped at 1 h."""
    return min(30 * 4 ** (attempt - 1), 3600)


class IngestionService:
    """Processes one claimed job: original file -> text -> chunks -> embeddings -> database.

    Runs in the worker, outside any request, so it opens its own short transactions. Progress
    is committed after every batch (each commit publishes a status NOTIFY); the chunks
    themselves are written in one final transaction, so a failed attempt leaves none behind.
    """

    def __init__(
        self,
        settings: Settings,
        embedder: Embedder,
        store: FileStore,
        connect: Callable[[], Connection],
    ) -> None:
        self._settings = settings
        self._embedder = embedder
        self._store = store
        self._connect = connect

    def process(self, job: Row, on_progress: Callable[[], None] = lambda: None) -> None:
        doc_id: UUID = job["document_id"]
        try:
            with self._connect() as conn:
                doc = DocumentRepository(conn).mark_processing(doc_id)
            pages = extract_pages(self._store.read(doc["sha256"]))
            rows: list[tuple[int, int, str]] = []
            for page_no, text in enumerate(pages, start=1):
                for piece in split_text(
                    text, self._settings.chunk_chars, self._settings.chunk_overlap
                ):
                    rows.append((page_no, len(rows), piece))
            if not rows:
                raise ValueError("no extractable text (scanned PDF? OCR is not supported)")

            vectors: list[list[float]] = []
            size = self._settings.ingest_batch_size
            for start in range(0, len(rows), size):
                vectors.extend(self._embedder.embed([r[2] for r in rows[start : start + size]]))
                with self._connect() as conn:
                    DocumentRepository(conn).set_progress(doc_id, len(vectors), len(rows))
                    JobRepository(conn).heartbeat(job["id"])
                on_progress()

            self._store_result(job, len(pages), rows, vectors)
        except Exception as exc:
            logger.exception("ingestion attempt %s failed for document %s", job["attempts"], doc_id)
            self._record_failure(job, f"{type(exc).__name__}: {exc}"[:500])

    def give_up(self, job: Row, reason: str) -> None:
        """Fail a job without running it (e.g. it exhausted its attempts by crashing workers)."""
        self._record_failure(job, reason, final=True)

    def _store_result(
        self,
        job: Row,
        pages: int,
        rows: list[tuple[int, int, str]],
        vectors: list[list[float]],
    ) -> None:
        doc_id = job["document_id"]
        with self._connect() as conn:
            ChunkRepository(conn).add_many(doc_id, rows, vectors)
            DocumentRepository(conn).mark_ready(doc_id, pages, len(rows))
            JobRepository(conn).complete(job["id"])
            AuditRepository(conn).append(
                "document.ingested",
                {
                    "id": str(doc_id),
                    "job_id": job["id"],
                    "attempt": job["attempts"],
                    "pages": pages,
                    "chunks": len(rows),
                    "embed_model": self._embedder.model,
                },
            )

    def _record_failure(self, job: Row, error: str, final: bool = False) -> None:
        doc_id = job["document_id"]
        attempt = job["attempts"]
        final = final or attempt >= job["max_attempts"]
        try:
            with self._connect() as conn:
                docs, jobs, audit = (
                    DocumentRepository(conn),
                    JobRepository(conn),
                    AuditRepository(conn),
                )
                if final:
                    jobs.fail(job["id"], error)
                    docs.mark_failed(doc_id, error)
                    audit.append(
                        "document.failed",
                        {
                            "id": str(doc_id),
                            "job_id": job["id"],
                            "attempt": attempt,
                            "error": error,
                        },
                    )
                else:
                    delay = retry_delay_seconds(attempt)
                    jobs.retry_later(job["id"], error, delay)
                    docs.note_error(
                        doc_id, f"attempt {attempt} failed, retrying in {delay} s: {error}"
                    )
                    audit.append(
                        "ingestion.retry_scheduled",
                        {
                            "id": str(doc_id),
                            "job_id": job["id"],
                            "attempt": attempt,
                            "delay_seconds": delay,
                            "error": error,
                        },
                    )
        except Exception:
            # The job stays 'running'; once its heartbeat is stale another claim retries it.
            logger.exception("could not record ingestion failure for document %s", doc_id)
