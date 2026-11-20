import hashlib
import uuid

import psycopg
import pytest

from app.repositories.document import DocumentRepository
from app.repositories.job import JobRepository


@pytest.fixture(autouse=True)
def empty_queue(connect):
    """Each test starts with no waiting or running jobs (jobs are not deletable history)."""
    with connect() as c:
        c.execute("UPDATE ingestion_jobs SET status = 'done' WHERE status IN ('queued', 'running')")


def new_document(conn) -> dict:
    sha = hashlib.sha256(uuid.uuid4().bytes).hexdigest()
    doc = DocumentRepository(conn).create(f"{sha[:8]}.pdf", sha, 1, None)
    conn.commit()
    return doc


def test_two_workers_never_claim_the_same_job(connect):
    with connect() as setup:
        a, b = new_document(setup), new_document(setup)
        jobs = JobRepository(setup)
        ids = {jobs.enqueue(a["id"], 3)["id"], jobs.enqueue(b["id"], 3)["id"]}
        setup.commit()

    w1, w2 = connect(), connect()
    try:
        first = JobRepository(w1).claim("w1", 600)  # transaction still open: row locked
        second = JobRepository(w2).claim("w2", 600)  # must skip it, not wait for it
        assert first and second
        assert first["id"] != second["id"]
        assert {first["id"], second["id"]} == ids
        assert first["attempts"] == second["attempts"] == 1
    finally:
        w1.rollback()
        w2.rollback()
        w1.close()
        w2.close()


def test_job_without_heartbeat_is_reclaimed(conn):
    doc = new_document(conn)
    jobs = JobRepository(conn)
    job = jobs.enqueue(doc["id"], 3)
    conn.execute(
        "UPDATE ingestion_jobs SET status = 'running', locked_by = 'dead:1', attempts = 1, "
        "heartbeat_at = now() - interval '1 hour' WHERE id = %s",
        (job["id"],),
    )
    conn.commit()
    reclaimed = jobs.claim("alive:1", 600)
    conn.commit()
    assert reclaimed["id"] == job["id"]
    assert reclaimed["locked_by"] == "alive:1"
    assert reclaimed["attempts"] == 2


def test_delayed_retry_is_not_claimed_early(conn):
    doc = new_document(conn)
    jobs = JobRepository(conn)
    job = jobs.enqueue(doc["id"], 3)
    jobs.retry_later(job["id"], "boom", 3600)
    conn.commit()
    assert jobs.claim("w", 600) is None
    conn.rollback()


def test_only_one_active_job_per_document(conn):
    doc = new_document(conn)
    JobRepository(conn).enqueue(doc["id"], 3)
    with pytest.raises(psycopg.errors.UniqueViolation):
        JobRepository(conn).enqueue(doc["id"], 3)
    conn.rollback()


def test_queueing_a_job_notifies_the_worker(conn, connect_listener):
    with connect_listener() as listener:
        listener.execute("LISTEN ingestion_jobs")
        doc = new_document(conn)
        job = JobRepository(conn).enqueue(doc["id"], 3)
        conn.commit()
        notes = list(listener.notifies(timeout=5, stop_after=1))
    assert notes and notes[0].payload == str(job["id"])


def test_document_progress_is_published(conn, connect_listener):
    import json

    doc = new_document(conn)
    with connect_listener() as listener:
        listener.execute("LISTEN document_status")
        DocumentRepository(conn).set_progress(doc["id"], 3, 9)
        conn.commit()
        payloads = [json.loads(n.payload) for n in listener.notifies(timeout=5, stop_after=1)]
    assert payloads[0]["id"] == str(doc["id"])
    assert (payloads[0]["progress"], payloads[0]["progress_total"]) == (3, 9)
