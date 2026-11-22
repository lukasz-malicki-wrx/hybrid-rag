import json
from collections.abc import Iterator

import httpx

from .base import LLMProvider

_TIMEOUT = httpx.Timeout(600, connect=10)


def parse_anthropic_line(line: str) -> str:
    if not line.startswith("data:"):
        return ""
    data = json.loads(line[5:])
    if data.get("type") == "content_block_delta":
        return data["delta"].get("text", "")
    if data.get("type") == "error":
        raise RuntimeError(data["error"].get("message", "provider error"))
    return ""


class AnthropicProvider(LLMProvider):
    name = "anthropic"
    _URL = "https://api.anthropic.com/v1/messages"

    def __init__(self, api_key: str, model: str, max_tokens: int) -> None:
        self._api_key = api_key
        self.model = model
        self._max_tokens = max_tokens

    def stream(self, system: str, user: str) -> Iterator[str]:
        headers = {"x-api-key": self._api_key, "anthropic-version": "2023-06-01"}
        payload = {
            "model": self.model,
            "max_tokens": self._max_tokens,
            "temperature": 0.1,
            "stream": True,
            "system": system,
            "messages": [{"role": "user", "content": user}],
        }
        with httpx.stream(
            "POST", self._URL, headers=headers, json=payload, timeout=_TIMEOUT
        ) as resp:
            resp.raise_for_status()
            for line in resp.iter_lines():
                if token := parse_anthropic_line(line):
                    yield token
