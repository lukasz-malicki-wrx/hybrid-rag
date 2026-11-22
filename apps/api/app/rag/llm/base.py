from abc import ABC, abstractmethod
from collections.abc import Iterator


class LLMProvider(ABC):
    """Contract every LLM backend implements. Add a provider = subclass this, register it."""

    name: str  # short identifier stored with every answer, e.g. "ollama"
    model: str  # model id stored with every answer

    @abstractmethod
    def stream(self, system: str, user: str) -> Iterator[str]:
        """Yield the answer text token by token."""
