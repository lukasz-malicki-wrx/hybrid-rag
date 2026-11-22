import threading

from app.core.config import Settings
from app.rag.embedding import Embedder
from app.repositories.chunk import ChunkRepository
from app.repositories.document import DocumentRepository
from app.repositories.job import JobRepository
from app.services.document import DocumentService
from app.services.document_events import DocumentStatusStream
from app.services.ingestion import IngestionService
from app.storage import LocalFileStore
from app.worker.loop import Worker

from .conftest import SAMPLES

PDF = (SAMPLES / "eu-gmp-annex11.pdf").read_bytes()


class FakeEmbedder(Embedder):
    model = "fake-1024"

    def __init__(self, fail_times: int = 0):
        self.fail_times = fail_times

    def embed(self, texts):
        if self.fail_times:
            self.fail_times -= 1
            raise RuntimeError("embedding backend down")
        return [[0.01] * 1024 for _ in texts]


def settings(**overrides) -> Settings:
    return Settings(database_url="unused", ollama_url="unused", **overrides)


def upload(connect, store, data=PDF, name="annex.pdf", **overrides):
    with connect() as conn:
        service = DocumentService(
            conn,
            DocumentRepository(conn),
            JobRepository(conn),
            store,
            settings(**overrides),
        )
        return service.register_upload(name, data)


def clear_queue(connect):
    with connect() as conn:
        conn.execute("UPDATE ingestion_jobs SET status = 'done' WHERE status <> 'done'")


def worker(connect, connect_listener, store, embedder, **overrides):
    s = settings(**overrides)
    return Worker(s, IngestionService(s, embedder, store, connect), connect, connect_listener)


def document(connect, doc_id):
    with connect() as conn:
        return DocumentRepository(conn).get(doc_id)


def test_upload_then_worker_makes_the_document_searchable(connect, connect_listener, tmp_path):
    clear_queue(connect)
    store = LocalFileStore(tmp_path)
    result = upload(connect, store)
    assert result.queued and store.exists(result.document["sha256"])

    assert worker(connect, connect_listener, store, FakeEmbedder()).run_once()

    doc = document(connect, result.document["id"])
    assert doc["status"] == "ready"
    assert doc["progress"] == doc["progress_total"] > 0
    with connect() as conn:
        chunks = conn.execute(
            "SELECT count(*) AS n FROM chunks WHERE document_id = %s", (doc["id"],)
        ).fetchone()["n"]
        job = conn.execute(
            "SELECT status FROM ingestion_jobs WHERE document_id = %s", (doc["id"],)
        ).fetchone()
    assert chunks == doc["progress_total"]
    assert job["status"] == "done"

    with connect() as conn:
        listed = ChunkRepository(conn).by_document(doc["id"])
    assert len(listed) == chunks
    order = [(c["page"], c["position"]) for c in listed]
    assert order == sorted(order)
    assert all(c["chars"] == len(c["text"]) > 0 for c in listed)


def test_failed_attempt_is_retried_later_then_fails_for_good(connect, connect_listener, tmp_path):
    clear_queue(connect)
    store = LocalFileStore(tmp_path)
    data = PDF + b"\n% variant for the retry test\n"
    doc_id = upload(connect, store, data, "retry.pdf", ingest_max_attempts=2).document["id"]
    w = worker(connect, connect_listener, store, FakeEmbedder(fail_times=5))

    assert w.run_once()  # attempt 1 fails -> retry scheduled
    doc = document(connect, doc_id)
    assert doc["status"] == "processing"
    assert "attempt 1 failed" in doc["error"]
    assert not w.run_once()  # the retry is not due yet

    with connect() as conn:
        conn.execute(
            "UPDATE ingestion_jobs SET run_after = now() WHERE document_id = %s", (doc_id,)
        )
    assert w.run_once()  # attempt 2 of 2 fails -> final
    doc = document(connect, doc_id)
    assert doc["status"] == "failed"
    assert "embedding backend down" in doc["error"]


def test_concurrent_identical_uploads_create_one_document_and_one_job(connect, tmp_path):
    store = LocalFileStore(tmp_path)
    data = PDF + b"\n% variant for the concurrency test\n"
    results = []

    def go():
        results.append(upload(connect, store, data, "race.pdf"))

    threads = [threading.Thread(target=go) for _ in range(6)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert len({r.document["id"] for r in results}) == 1
    assert sum(r.queued for r in results) == 1


def test_status_stream_starts_with_current_state_and_ends_when_ready(
    connect, connect_listener, tmp_path
):
    clear_queue(connect)
    store = LocalFileStore(tmp_path)
    data = PDF + b"\n% variant for the stream test\n"
    doc_id = upload(connect, store, data, "stream.pdf").document["id"]

    stream = DocumentStatusStream(connect_listener, keepalive_seconds=0.5, max_seconds=30)
    events = stream.follow(doc_id)
    first = next(events)
    assert first.status == "processing"

    w = worker(connect, connect_listener, store, FakeEmbedder())
    t = threading.Thread(target=w.run_once)
    t.start()
    rest = [e for e in events if e is not None]
    t.join()
    assert rest[-1].status == "ready"
    assert rest[-1].progress == rest[-1].progress_total
