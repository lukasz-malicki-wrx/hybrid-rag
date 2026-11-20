import logging
from collections.abc import Iterable

import httpx
import psycopg

from ..core.config import Settings

logger = logging.getLogger(__name__)


def has_model(available: Iterable[str], wanted: str) -> bool:
    """Ollama lists 'bge-m3:latest' for a model pulled as 'bge-m3'."""
    names = set(available)
    return wanted in names or (":" not in wanted and f"{wanted}:latest" in names)


class HealthService:
    """Readiness: every dependency the API needs to answer, without raising when one is down."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def check(self) -> dict:
        db, pgvector = "unavailable", None
        try:
            with psycopg.connect(self._settings.database_url, connect_timeout=3) as conn:
                row = conn.execute(
                    "SELECT extversion FROM pg_extension WHERE extname = 'vector'"
                ).fetchone()
            db, pgvector = "ok", row[0] if row else None
        except psycopg.Error:
            logger.warning("health: database unavailable", exc_info=True)

        ollama, models = "unavailable", []
        try:
            resp = httpx.get(f"{self._settings.ollama_url}/api/tags", timeout=3)
            resp.raise_for_status()
            ollama, models = "ok", [m["name"] for m in resp.json().get("models", [])]
        except httpx.HTTPError:
            logger.warning("health: ollama unavailable", exc_info=True)

        required = [self._settings.embed_model]
        if self._settings.llm_provider == "ollama":
            required.append(self._settings.llm_model)
        models_ready = all(has_model(models, m) for m in required)

        ready = db == "ok" and pgvector is not None and models_ready
        return {
            "status": "ok" if ready else "degraded",
            "db": db,
            "pgvector": pgvector,
            "ollama": ollama,
            "ollama_models": models,
            "models_ready": models_ready,
            "embed_model": self._settings.embed_model,
            "llm_provider": self._settings.llm_provider,
            "llm_model": self._settings.llm_model,
        }
