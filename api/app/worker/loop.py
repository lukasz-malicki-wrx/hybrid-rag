import logging
import socket
import threading
import time
from collections.abc import Callable
from pathlib import Path

from psycopg import Connection

from ..core.config import Settings
from ..repositories.job import JobRepository
from ..services.ingestion import IngestionService

logger = logging.getLogger(__name__)
HEARTBEAT_FILE = Path("/tmp/worker-heartbeat")  # noqa: S108 - container-local liveness marker


class Worker:
    """Long-running loop: claim a due job, process it, otherwise sleep until NOTIFY or timeout.

    No cron is involved: retries are jobs whose run_after lies in the future, and jobs left
    running by a dead worker are reclaimed once their heartbeat is older than the stale limit.
    """

    def __init__(
        self,
        settings: Settings,
        ingestion: IngestionService,
        connect: Callable[[], Connection],
        connect_listener: Callable[[], Connection],
        host: str | None = None,
    ) -> None:
        self._settings = settings
        self._ingestion = ingestion
        self._connect = connect
        self._connect_listener = connect_listener
        self._host = host or socket.gethostname()
        self._id = f"{self._host}:{id(self)}"

    def run(self, stop: threading.Event) -> None:
        with self._connect() as conn:
            requeued = JobRepository(conn).requeue_owned(f"{self._host}:")
        if requeued:
            logger.info("requeued %s job(s) interrupted by this worker's previous run", requeued)
        logger.info("worker %s started", self._id)
        with self._connect_listener() as listener:
            listener.execute("LISTEN ingestion_jobs")
            while not stop.is_set():
                self.beat()
                if self.run_once():
                    continue
                # Sleep until a job is queued (NOTIFY) or the poll interval passes; the poll
                # also picks up delayed retries and stale jobs, which send no notification.
                for _ in listener.notifies(
                    timeout=self._settings.worker_poll_seconds, stop_after=1
                ):
                    pass
        logger.info("worker %s stopped", self._id)

    def run_once(self) -> bool:
        """Process at most one job. Returns True if a job was claimed."""
        with self._connect() as conn:
            job = JobRepository(conn).claim(self._id, self._settings.ingest_stale_seconds)
        if job is None:
            return False
        logger.info(
            "job %s (document %s), attempt %s/%s",
            job["id"],
            job["document_id"],
            job["attempts"],
            job["max_attempts"],
        )
        started = time.monotonic()
        if job["attempts"] > job["max_attempts"]:
            self._ingestion.give_up(job, "gave up: the job was interrupted too many times")
        else:
            self._ingestion.process(job, on_progress=self.beat)
        logger.info("job %s finished in %.1f s", job["id"], time.monotonic() - started)
        return True

    @staticmethod
    def beat() -> None:
        """Liveness for the container healthcheck."""
        HEARTBEAT_FILE.touch()
