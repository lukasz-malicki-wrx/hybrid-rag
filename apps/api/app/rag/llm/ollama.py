import json
from collections.abc import Iterator

import httpx

from .base import LLMProvider

_TIMEOUT = httpx.Timeout(600, connect=10)


def parse_ollama_line(line: str) -> str:
    if not line:
        return ""
    data = json.loads(line)
    if "error" in data:
        raise RuntimeError(data["error"])
    return data.get("message", {}).get("content", "")


class OllamaProvider(LLMProvider):
    name = "ollama"

    def __init__(self, base_url: str, model: str, num_ctx: int, max_tokens: int) -> None:
        self._base_url = base_url
        self.model = model
        self._num_ctx = num_ctx
        self._max_tokens = max_tokens

    def stream(self, system: str, user: str) -> Iterator[str]:
        payload = {
            "model": self.model,
            "stream": True,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "options": {
                "num_ctx": self._num_ctx,
                "num_predict": self._max_tokens,
                "temperature": 0.1,
            },
        }
        url = f"{self._base_url}/api/chat"
        with httpx.stream("POST", url, json=payload, timeout=_TIMEOUT) as resp:
            resp.raise_for_status()
            for line in resp.iter_lines():
                if token := parse_ollama_line(line):
                    yield token
