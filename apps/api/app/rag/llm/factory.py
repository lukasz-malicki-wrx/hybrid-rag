from collections.abc import Callable

from ...core.config import Settings
from .anthropic import AnthropicProvider
from .base import LLMProvider
from .ollama import OllamaProvider


def _ollama(s: Settings) -> LLMProvider:
    return OllamaProvider(s.ollama_url, s.llm_model, s.llm_num_ctx, s.llm_max_tokens)


def _anthropic(s: Settings) -> LLMProvider:
    if not s.anthropic_api_key:
        raise RuntimeError("LLM_PROVIDER=anthropic requires ANTHROPIC_API_KEY")
    return AnthropicProvider(s.anthropic_api_key, s.llm_model, s.llm_max_tokens)


# To add a provider: write a subclass of LLMProvider in its own module and register it here.
PROVIDERS: dict[str, Callable[[Settings], LLMProvider]] = {
    "ollama": _ollama,
    "anthropic": _anthropic,
}


def build_llm(settings: Settings) -> LLMProvider:
    try:
        return PROVIDERS[settings.llm_provider](settings)
    except KeyError:
        known = ", ".join(PROVIDERS)
        raise RuntimeError(
            f"unknown LLM_PROVIDER '{settings.llm_provider}' (available: {known})"
        ) from None
