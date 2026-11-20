import httpx

from .base import Embedder


class OllamaEmbedder(Embedder):
    def __init__(self, base_url: str, model: str, dim: int, batch_size: int = 16) -> None:
        self._base_url = base_url
        self.model = model
        self._dim = dim
        self._batch_size = batch_size

    def embed(self, texts: list[str]) -> list[list[float]]:
        out: list[list[float]] = []
        with httpx.Client(timeout=300) as client:
            for i in range(0, len(texts), self._batch_size):
                resp = client.post(
                    f"{self._base_url}/api/embed",
                    json={"model": self.model, "input": texts[i : i + self._batch_size]},
                )
                resp.raise_for_status()
                out.extend(resp.json()["embeddings"])
        if out and len(out[0]) != self._dim:
            raise ValueError(f"expected {self._dim}-dim embeddings, got {len(out[0])}")
        return out
