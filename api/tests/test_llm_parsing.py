import json

import pytest

from app.rag.llm.anthropic import parse_anthropic_line
from app.rag.llm.ollama import parse_ollama_line


def test_ollama_token():
    assert parse_ollama_line(json.dumps({"message": {"content": "hi"}, "done": False})) == "hi"


def test_ollama_blank_and_done_lines():
    assert parse_ollama_line("") == ""
    assert parse_ollama_line(json.dumps({"message": {"content": ""}, "done": True})) == ""


def test_ollama_error_raises():
    with pytest.raises(RuntimeError, match="model not found"):
        parse_ollama_line(json.dumps({"error": "model not found"}))


def test_anthropic_delta():
    line = "data: " + json.dumps(
        {"type": "content_block_delta", "delta": {"type": "text_delta", "text": "yo"}}
    )
    assert parse_anthropic_line(line) == "yo"


def test_anthropic_ignores_other_events():
    assert parse_anthropic_line("event: ping") == ""
    assert parse_anthropic_line('data: {"type": "message_start"}') == ""


def test_factory_picks_provider_and_rejects_unknown():
    from app.core.config import Settings
    from app.rag.llm import OllamaProvider, build_llm

    base = {"database_url": "x", "ollama_url": "http://o"}
    assert isinstance(build_llm(Settings(**base)), OllamaProvider)
    with pytest.raises(RuntimeError, match="unknown LLM_PROVIDER"):
        build_llm(Settings(**base, llm_provider="nope"))
    with pytest.raises(RuntimeError, match="ANTHROPIC_API_KEY"):
        build_llm(Settings(**base, llm_provider="anthropic"))
