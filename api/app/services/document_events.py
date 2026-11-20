import json
import time
from collections.abc import Callable, Iterator
from uuid import UUID

from psycopg import Connection

from ..repositories.document import DocumentRepository
from ..schemas.document import DocumentStatusEvent

TERMINAL = frozenset({"ready", "failed"})


class DocumentStatusStream:
    """Follows one document's status through Postgres LISTEN/NOTIFY.

    Yields the current state first, then every change, and ends when the document is ready or
    failed. Yields None as a keep-alive when nothing happened, so a closed client is noticed.
    """

    def __init__(
        self,
        connect_listener: Callable[[], Connection],
        keepalive_seconds: float = 15,
        max_seconds: float = 3600,
    ) -> None:
        self._connect_listener = connect_listener
        self._keepalive = keepalive_seconds
        self._max = max_seconds

    def follow(self, doc_id: UUID) -> Iterator[DocumentStatusEvent | None]:
        with self._connect_listener() as conn:
            conn.execute("LISTEN document_status")  # subscribe before reading: no gap
            doc = DocumentRepository(conn).get(doc_id)
            if doc is None:
                return
            event = DocumentStatusEvent.from_row(doc)
            yield event
            deadline = time.monotonic() + self._max
            while event.status not in TERMINAL and time.monotonic() < deadline:
                changed = False
                for note in conn.notifies(timeout=self._keepalive, stop_after=1):
                    payload = json.loads(note.payload)
                    if payload["id"] == str(doc_id):
                        event = DocumentStatusEvent.from_row(payload)
                        changed = True
                if changed:
                    yield event
                else:
                    yield None
