import hashlib
from dataclasses import dataclass
from typing import Any
from uuid import UUID

from psycopg import Connection
from psycopg.errors import UniqueViolation

from ..core.config import Settings
from ..core.errors import (
    ConflictError,
    NotFoundError,
    PayloadTooLargeError,
    UnsupportedMediaError,
)
from ..repositories.audit import AuditRepository
from ..repositories.document import DocumentRepository
from ..repositories.job import JobRepository
from ..storage import FileStore

Row = dict[str, Any]


@dataclass(frozen=True)
class UploadResult:
    document: Row
    queued: bool  # False: identical content already uploaded, nothing to process


class DocumentService:
    def __init__(
        self,
        conn: Connection,
        documents: DocumentRepository,
        jobs: JobRepository,
        audit: AuditRepository,
        store: FileStore,
        settings: Settings,
    ) -> None:
        self._conn = conn
        self._documents = documents
        self._jobs = jobs
        self._audit = audit
        self._store = store
        self._settings = settings

    def list(self, include_inactive: bool = False) -> list[Row]:
        return self._documents.list(include_inactive)

    def get(self, doc_id: UUID) -> Row:
        doc = self._documents.get(doc_id)
        if doc is None:
            raise NotFoundError("document not found")
        return doc

    def register_upload(self, filename: str, data: bytes) -> UploadResult:
        """Validate, keep the original file, and record the upload with its ingestion job.

        Identical content is deduplicated; the same file name with new content becomes the
        next version. The document row, the job and the audit entry commit together, so a job
        is never lost and never exists without its document.
        """
        if len(data) > self._settings.max_upload_bytes:
            limit_mb = self._settings.max_upload_bytes // 1024 // 1024
            raise PayloadTooLargeError(f"file exceeds {limit_mb} MB")
        if not data.startswith(b"%PDF-"):
            raise UnsupportedMediaError("only PDF files are supported")

        sha = hashlib.sha256(data).hexdigest()
        # Stored before the database row: if the transaction fails, an unreferenced file is
        # harmless (content-addressed); the reverse would leave a job without its file.
        # Also backfills originals of documents uploaded before files were kept.
        self._store.save(sha, data)
        try:
            # Concurrent uploads of the same content or file name wait here for each other.
            # The later one then sees the committed row: it deduplicates, takes the next
            # version number, or finds a failed document already queued for retry.
            self._documents.lock_upload(sha, filename)
            existing = self._documents.get_by_sha256(sha)
            result = (
                self._handle_existing(existing, sha)
                if existing
                else self._create_version(filename, sha, len(data))
            )
            self._conn.commit()
            return result
        except UniqueViolation:
            # Not expected while the lock is held; kept so a bug surfaces as 409, not 500.
            self._conn.rollback()
            raise ConflictError("a concurrent upload of the same document conflicted") from None

    def deactivate(self, doc_id: UUID) -> Row:
        """Soft delete: data is retained and the event is audited."""
        doc = self._documents.deactivate(doc_id)
        if doc is None:
            raise NotFoundError("active document not found")
        self._audit.append("document.deactivated", {"id": str(doc_id)})
        self._conn.commit()
        return doc

    def _queue(self, doc_id: UUID) -> None:
        job = self._jobs.enqueue(doc_id, self._settings.ingest_max_attempts)
        self._audit.append("ingestion.queued", {"id": str(doc_id), "job_id": job["id"]})

    def _handle_existing(self, existing: Row, sha: str) -> UploadResult:
        doc = existing
        if not doc["active"]:
            doc = self._documents.activate(doc["id"])
            self._audit.append("document.reactivated", {"id": str(doc["id"]), "sha256": sha})
        else:
            self._audit.append("document.duplicate_upload", {"id": str(doc["id"]), "sha256": sha})
        if doc["status"] == "failed":
            doc = self._documents.mark_processing(doc["id"])
            self._audit.append("document.retry", {"id": str(doc["id"])})
            self._queue(doc["id"])
            return UploadResult(doc, queued=True)
        return UploadResult(doc, queued=False)

    def _create_version(self, filename: str, sha: str, size: int) -> UploadResult:
        latest = self._documents.latest_by_filename(filename)
        version = latest["version"] + 1 if latest else 1
        supersedes = latest["id"] if latest else None
        doc = self._documents.create(filename, sha, version, supersedes)
        self._audit.append(
            "document.uploaded",
            {
                "id": str(doc["id"]),
                "filename": filename,
                "sha256": sha,
                "version": version,
                "supersedes_id": str(supersedes) if supersedes else None,
                "size_bytes": size,
            },
        )
        self._queue(doc["id"])
        return UploadResult(doc, queued=True)
