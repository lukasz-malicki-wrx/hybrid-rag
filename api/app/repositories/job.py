from typing import Any
from uuid import UUID

from psycopg import Connection

Row = dict[str, Any]


class JobRepository:
    """The ingestion queue. Claiming uses FOR UPDATE SKIP LOCKED, so workers never share a job."""

    def __init__(self, conn: Connection) -> None:
        self._conn = conn

    def enqueue(self, document_id: UUID, max_attempts: int) -> Row:
        return self._conn.execute(
            "INSERT INTO ingestion_jobs (document_id, max_attempts) VALUES (%s, %s) RETURNING *",
            (document_id, max_attempts),
        ).fetchone()

    def claim(self, worker_id: str, stale_after_seconds: int) -> Row | None:
        """Take the next due job, or a running job whose worker stopped sending heartbeats.

        Claiming counts as an attempt, so a job that keeps crashing its worker still runs out
        of attempts.
        """
        return self._conn.execute(
            """
            UPDATE ingestion_jobs
            SET status = 'running', locked_by = %(worker)s, heartbeat_at = now(),
                attempts = attempts + 1
            WHERE id = (
                SELECT id FROM ingestion_jobs
                WHERE (status = 'queued' AND run_after <= now())
                   OR (status = 'running'
                       AND heartbeat_at < now() - make_interval(secs => %(stale)s))
                ORDER BY run_after, id
                FOR UPDATE SKIP LOCKED
                LIMIT 1
            )
            RETURNING *
            """,
            {"worker": worker_id, "stale": stale_after_seconds},
        ).fetchone()

    def heartbeat(self, job_id: int) -> None:
        self._conn.execute(
            "UPDATE ingestion_jobs SET heartbeat_at = now() WHERE id = %s", (job_id,)
        )

    def complete(self, job_id: int) -> None:
        self._conn.execute(
            "UPDATE ingestion_jobs SET status = 'done', finished_at = now(), last_error = NULL "
            "WHERE id = %s",
            (job_id,),
        )

    def retry_later(self, job_id: int, error: str, delay_seconds: int) -> None:
        self._conn.execute(
            "UPDATE ingestion_jobs SET status = 'queued', locked_by = NULL, last_error = %s, "
            "run_after = now() + make_interval(secs => %s) WHERE id = %s",
            (error, delay_seconds, job_id),
        )

    def fail(self, job_id: int, error: str) -> None:
        self._conn.execute(
            "UPDATE ingestion_jobs SET status = 'failed', finished_at = now(), last_error = %s "
            "WHERE id = %s",
            (error, job_id),
        )

    def requeue_owned(self, worker_prefix: str) -> int:
        """Return jobs a previous run of this worker left 'running' (e.g. after a restart)."""
        cur = self._conn.execute(
            "UPDATE ingestion_jobs SET status = 'queued', locked_by = NULL, run_after = now() "
            "WHERE status = 'running' AND starts_with(locked_by, %s)",
            (worker_prefix,),
        )
        return cur.rowcount
