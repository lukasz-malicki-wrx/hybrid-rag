from abc import ABC, abstractmethod


class Embedder(ABC):
    """Contract every embedding backend implements (mirrors LLMProvider in rag/llm)."""

    model: str  # model id, recorded with every ingest and answer

    @abstractmethod
    def embed(self, texts: list[str]) -> list[list[float]]:
        """Return one vector per input text, in the same order."""
