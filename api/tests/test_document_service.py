from datetime import UTC, datetime
from uuid import UUID, uuid4

import pytest
from psycopg.errors import UniqueViolation

from app.core.config import Settings
from app.core.errors import (
    ConflictError,
    NotFoundError,
    PayloadTooLargeError,
    UnsupportedMediaError,
)
from app.services.document import DocumentService


class FakeConn:
    def __init__(self):
        self.commits = 0
        self.rollbacks = 0

    def commit(self):
        self.commits += 1

    def rollback(self):
        self.rollbacks += 1


class FakeAudit:
    def __init__(self):
        self.events: list[str] = []

    def append(self, event, payload=None):
        self.events.append(event)


class FakeDocuments:
    def __init__(self):
        self.rows: dict[UUID, dict] = {}
        self.calls: list[str] = []

    def lock_upload(self, sha256, filename):
        self.calls.append("lock")

    def get_by_sha256(self, sha):
        self.calls.append("read")
        return next((r for r in self.rows.values() if r["sha256"] == sha), None)

    def latest_by_filename(self, filename):
        rows = [r for r in self.rows.values() if r["filename"] == filename]
        return max(rows, key=lambda r: r["version"], default=None)

    def create(self, filename, sha256, version, supersedes_id):
        row = {
            "id": uuid4(),
            "filename": filename,
            "sha256": sha256,
            "version": version,
            "supersedes_id": supersedes_id,
            "status": "processing",
            "active": True,
            "uploaded_at": datetime.now(UTC),
        }
        self.rows[row["id"]] = row
        return row

    def mark_processing(self, doc_id):
        self.rows[doc_id]["status"] = "processing"
        return self.rows[doc_id]

    def deactivate(self, doc_id):
        row = self.rows.get(doc_id)
        if row and row["active"]:
            row["active"] = False
            return row
        return None


class FakeJobs:
    def __init__(self):
        self.queued: list = []

    def enqueue(self, document_id, max_attempts):
        self.queued.append(document_id)
        return {"id": len(self.queued)}


class FakeStore:
    def __init__(self, log=None):
        self.saved: dict[str, bytes] = {}
        self.log = log

    def save(self, sha256, data):
        if self.log is not None:
            self.log.append("save")
        self.saved[sha256] = data


SETTINGS = Settings(database_url="x", ollama_url="y", max_upload_bytes=1000)


@pytest.fixture
def parts():
    conn, docs, audit = FakeConn(), FakeDocuments(), FakeAudit()
    jobs, store = FakeJobs(), FakeStore()
    service = DocumentService(conn, docs, jobs, audit, store, SETTINGS)
    return service, conn, docs, audit, jobs, store


PDF = b"%PDF-1.7 first"


def test_rejects_non_pdf(parts):
    service, *_ = parts
    with pytest.raises(UnsupportedMediaError):
        service.register_upload("a.pdf", b"hello")


def test_rejects_oversized(parts):
    service, *_ = parts
    with pytest.raises(PayloadTooLargeError):
        service.register_upload("a.pdf", b"%PDF-" + b"x" * 2000)


def test_first_upload_creates_version_one(parts):
    service, conn, _, audit, jobs, store = parts
    result = service.register_upload("a.pdf", PDF)
    assert result.queued
    assert result.document["version"] == 1
    assert audit.events == ["document.uploaded", "ingestion.queued"]
    assert jobs.queued == [result.document["id"]]
    assert list(store.saved.values()) == [PDF]
    assert conn.commits == 1


def test_identical_upload_is_deduplicated(parts):
    service, _, docs, audit, jobs, _ = parts
    service.register_upload("a.pdf", PDF)
    again = service.register_upload("copy.pdf", PDF)
    assert not again.queued
    assert len(docs.rows) == 1
    assert len(jobs.queued) == 1
    assert audit.events == ["document.uploaded", "ingestion.queued", "document.duplicate_upload"]


def test_changed_content_becomes_next_version(parts):
    service, *_ = parts
    v1 = service.register_upload("a.pdf", PDF).document
    v2 = service.register_upload("a.pdf", PDF + b" changed").document
    assert v2["version"] == 2
    assert v2["supersedes_id"] == v1["id"]


def test_deactivate_unknown_raises(parts):
    service, *_ = parts
    with pytest.raises(NotFoundError):
        service.deactivate(uuid4())


def make_service(docs, store=None):
    conn = FakeConn()
    service = DocumentService(conn, docs, FakeJobs(), FakeAudit(), store or FakeStore(), SETTINGS)
    return service, conn


def test_original_is_stored_before_locking_and_reading():
    docs = FakeDocuments()
    store = FakeStore(log=docs.calls)
    service, _ = make_service(docs, store)
    service.register_upload("a.pdf", PDF)
    assert docs.calls[:3] == ["save", "lock", "read"]


def test_failed_document_is_requeued_on_reupload(parts):
    service, _, docs, audit, jobs, _ = parts
    doc = service.register_upload("a.pdf", PDF).document
    docs.rows[doc["id"]]["status"] = "failed"
    again = service.register_upload("a.pdf", PDF)
    assert again.queued
    assert jobs.queued == [doc["id"], doc["id"]]
    assert "document.retry" in audit.events


def test_unexpected_unique_violation_becomes_409():
    class Conflicting(FakeDocuments):
        def create(self, *args):
            raise UniqueViolation("duplicate key")

    service, conn = make_service(Conflicting())
    with pytest.raises(ConflictError):
        service.register_upload("a.pdf", PDF)
    assert conn.rollbacks == 1 and conn.commits == 0
