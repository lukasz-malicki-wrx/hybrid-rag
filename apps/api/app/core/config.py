import os
from dataclasses import dataclass
from functools import lru_cache


@dataclass(frozen=True)
class Settings:
    database_url: str
    ollama_url: str
    embed_model: str = "bge-m3"
    embed_dim: int = 1024
    max_upload_bytes: int = 50 * 1024 * 1024
    chunk_chars: int = 1800
    chunk_overlap: int = 200
    llm_provider: str = "ollama"
    llm_model: str = "qwen2.5:3b"
    llm_num_ctx: int = 8192
    llm_max_tokens: int = 768
    anthropic_api_key: str | None = None
    cors_origins: tuple[str, ...] = ("http://localhost:3000",)
    # Cosine distance above which the nearest chunk counts as unrelated (calibrated for bge-m3;
    # see docs/EVALUATION.md). None disables the relevance gate.
    max_vector_distance: float | None = 0.5
    upload_dir: str = "/data/uploads"
    ingest_max_attempts: int = 3
    ingest_stale_seconds: int = 600  # a running job without a heartbeat this long is reclaimed
    ingest_batch_size: int = 8  # chunks embedded between progress updates
    worker_poll_seconds: float = 5.0


def _optional_float(raw: str | None, default: float) -> float | None:
    """Unset or empty -> default; 'off' -> None (gate disabled); otherwise the number."""
    if raw is None or raw.strip() == "":
        return default
    if raw.strip().lower() == "off":
        return None
    return float(raw)


DEFAULT_MODELS = {"ollama": "qwen2.5:3b", "anthropic": "claude-sonnet-5-5"}


@lru_cache
def get_settings() -> Settings:
    provider = os.environ.get("LLM_PROVIDER", "ollama")
    return Settings(
        database_url=os.environ["DATABASE_URL"],
        ollama_url=os.environ["OLLAMA_URL"],
        embed_model=os.environ.get("EMBED_MODEL", "bge-m3"),
        max_upload_bytes=int(os.environ.get("MAX_UPLOAD_MB", "50")) * 1024 * 1024,
        llm_provider=provider,
        llm_model=os.environ.get("LLM_MODEL") or DEFAULT_MODELS.get(provider, ""),
        llm_num_ctx=int(os.environ.get("LLM_NUM_CTX", "8192")),
        llm_max_tokens=int(os.environ.get("LLM_MAX_TOKENS", "768")),
        anthropic_api_key=os.environ.get("ANTHROPIC_API_KEY") or None,
        max_vector_distance=_optional_float(os.environ.get("MAX_VECTOR_DISTANCE"), 0.5),
        upload_dir=os.environ.get("UPLOAD_DIR", "/data/uploads"),
        ingest_max_attempts=int(os.environ.get("INGEST_MAX_ATTEMPTS", "3")),
        ingest_stale_seconds=int(os.environ.get("INGEST_STALE_SECONDS", "600")),
        cors_origins=tuple(
            o.strip()
            for o in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
            if o.strip()
        ),
    )
