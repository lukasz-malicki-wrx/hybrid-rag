"""Ingestion worker: `python -m app.worker`."""

import logging
import signal
import threading

from ..core import migrate
from ..core.config import get_settings
from ..core.db import connect, connect_listener
from ..rag.embedding import OllamaEmbedder
from ..services.ingestion import IngestionService
from ..storage import LocalFileStore
from .loop import Worker


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
    settings = get_settings()
    migrate.run()  # idempotent and serialised by an advisory lock; the API runs it too

    stop = threading.Event()
    for sig in (signal.SIGTERM, signal.SIGINT):
        signal.signal(sig, lambda *_: stop.set())

    ingestion = IngestionService(
        settings,
        OllamaEmbedder(settings.ollama_url, settings.embed_model, settings.embed_dim),
        LocalFileStore(settings.upload_dir),
        connect,
    )
    Worker(settings, ingestion, connect, connect_listener).run(stop)


if __name__ == "__main__":
    main()
