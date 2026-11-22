from typing import Literal

from pydantic import BaseModel


class LiveOut(BaseModel):
    status: Literal["ok"] = "ok"


class HealthOut(BaseModel):
    status: Literal["ok", "degraded"]
    db: Literal["ok", "unavailable"]
    pgvector: str | None
    ollama: Literal["ok", "unavailable"]
    ollama_models: list[str]
    models_ready: bool
    embed_model: str
    llm_provider: str
    llm_model: str
