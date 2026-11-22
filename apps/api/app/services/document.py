from __future__ import annotations

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
from ..repositories.chunk import ChunkRepository
from ..repositories.document import DocumentRepository
from ..repositories.group import GroupRepository
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
        store: FileStore,
        settings: Settings,
        groups: GroupRepository | None = None,
        chunks: ChunkRepository | None = None,
    ) -> None:
        self._conn = conn
        self._documents = documents
        self._groups = groups
        self._chunks = chunks
        self._jobs = jobs
        self._store = store
        self._settings = settings

    def list(self, include_inactive: bool = False, group_id: UUID | None = None) -> list[Row]:
        return self._documents.list(include_inactive, group_id)

    def original(self, doc_id: UUID) -> tuple[Row, bytes]:
        """The uploaded file, verified against its hash."""
        doc = self.get(doc_id)
        if not self._store.exists(doc["sha256"]):
            raise NotFoundError("the original file of this document was not kept")
        return doc, self._store.read(doc["sha256"])

    def chunks(self, doc_id: UUID) -> list[Row]:
        """The document's chunks in reading order; 404 for an unknown document."""
        self.get(doc_id)
        return self._chunks.by_document(doc_id) if self._chunks else []

    def get(self, doc_id: UUID) -> Row:
        doc = self._documents.get(doc_id)
        if doc is None:
            raise NotFoundError("document not found")
        return doc

    def register_upload(
        self, filename: str, data: bytes, group_id: UUID | None = None
    ) -> UploadResult:
        """Validate, keep the original file, and record the upload with its ingestion job.

        Identical content is deduplicated; the same file name with new content becomes the
        next version. The document row and its ingestion job commit together, so a job is
        never lost and never exists without its document.
        """
        if len(data) > self._settings.max_upload_bytes:
            limit_mb = self._settings.max_upload_bytes // 1024 // 1024
            raise PayloadTooLargeError(f"file exceeds {limit_mb} MB")
        if not data.startswith(b"%PDF-"):
            raise UnsupportedMediaError("only PDF files are supported")
        if group_id is not None and (self._groups is None or self._groups.get(group_id) is None):
            raise NotFoundError("group not found")

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
                self._handle_existing(existing)
                if existing
                else self._create_version(filename, sha, len(data))
            )
            if group_id is not None:
                self._groups.link_document(group_id, result.document["id"])
            self._conn.commit()
            return result
        except UniqueViolation:
            # Not expected while the lock is held; kept so a bug surfaces as 409, not 500.
            self._conn.rollback()
            raise ConflictError("a concurrent upload of the same document conflicted") from None

    def deactivate(self, doc_id: UUID) -> Row:
        """Soft delete: the document is hidden and no longer searched; its data is kept."""
        doc = self._documents.deactivate(doc_id)
        if doc is None:
            raise NotFoundError("active document not found")
        self._conn.commit()
        return doc

    def _queue(self, doc_id: UUID) -> None:
        self._jobs.enqueue(doc_id, self._settings.ingest_max_attempts)

    def _handle_existing(self, existing: Row) -> UploadResult:
        doc = existing
        if not doc["active"]:
            doc = self._documents.activate(doc["id"])
        if doc["status"] == "failed":
            doc = self._documents.mark_processing(doc["id"])
            self._queue(doc["id"])
            return UploadResult(doc, queued=True)
        return UploadResult(doc, queued=False)

    def _create_version(self, filename: str, sha: str, size: int) -> UploadResult:
        latest = self._documents.latest_by_filename(filename)
        version = latest["version"] + 1 if latest else 1
        supersedes = latest["id"] if latest else None
        doc = self._documents.create(filename, sha, version, supersedes)
        self._queue(doc["id"])
        return UploadResult(doc, queued=True)
