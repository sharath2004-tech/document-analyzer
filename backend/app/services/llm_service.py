"""LLM service with OpenRouter (primary), Groq (alt), and Ollama (fallback)."""

import httpx
import logging
from app.config import settings

logger = logging.getLogger(__name__)


async def _call_openai_compatible(
    base_url: str,
    api_key: str,
    model: str,
    messages: list[dict],
    temperature: float = 0.3,
    max_tokens: int = 4096,
    extra_headers: dict | None = None,
) -> str:
    """Generic caller for OpenAI-compatible APIs (OpenRouter, Groq, Ollama)."""
    headers = {
        "Content-Type": "application/json",
    }
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    if extra_headers:
        headers.update(extra_headers)

    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            f"{base_url}/chat/completions",
            json=payload,
            headers=headers,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


async def _call_openrouter(messages: list[dict], **kwargs) -> str:
    return await _call_openai_compatible(
        base_url=settings.OPENROUTER_BASE_URL,
        api_key=settings.OPENROUTER_API_KEY,
        model=settings.OPENROUTER_MODEL,
        messages=messages,
        extra_headers={
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "Document Analyzer",
        },
        **kwargs,
    )


async def _call_groq(messages: list[dict], **kwargs) -> str:
    return await _call_openai_compatible(
        base_url=settings.GROQ_BASE_URL,
        api_key=settings.GROQ_API_KEY,
        model=settings.GROQ_MODEL,
        messages=messages,
        **kwargs,
    )


async def _call_ollama(messages: list[dict], **kwargs) -> str:
    return await _call_openai_compatible(
        base_url=f"{settings.OLLAMA_BASE_URL}/v1",
        api_key="",
        model=settings.OLLAMA_MODEL,
        messages=messages,
        **kwargs,
    )


# Provider registry
_PROVIDERS = {
    "openrouter": _call_openrouter,
    "groq": _call_groq,
    "ollama": _call_ollama,
}


async def call_llm(
    messages: list[dict],
    temperature: float = 0.3,
    max_tokens: int = 4096,
) -> str:
    """Call LLM with automatic fallback through configured providers."""
    last_error = None

    for provider_name in settings.LLM_PRIORITY:
        provider_name = provider_name.strip()
        provider_fn = _PROVIDERS.get(provider_name)
        if not provider_fn:
            logger.warning(f"Unknown LLM provider: {provider_name}")
            continue

        # Skip providers without API keys
        if provider_name == "openrouter" and not settings.OPENROUTER_API_KEY:
            continue
        if provider_name == "groq" and not settings.GROQ_API_KEY:
            continue

        try:
            logger.info(f"Trying LLM provider: {provider_name}")
            result = await provider_fn(
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            logger.info(f"LLM provider {provider_name} succeeded")
            return result
        except Exception as e:
            last_error = e
            logger.warning(f"LLM provider {provider_name} failed: {e}")
            continue

    raise RuntimeError(
        f"All LLM providers failed. Last error: {last_error}"
    )


async def check_provider_health() -> dict[str, bool]:
    """Check which LLM providers are available."""
    health = {}
    test_messages = [{"role": "user", "content": "Say 'ok'"}]

    for provider_name in ["openrouter", "groq", "ollama"]:
        provider_fn = _PROVIDERS.get(provider_name)
        if not provider_fn:
            health[provider_name] = False
            continue

        if provider_name == "openrouter" and not settings.OPENROUTER_API_KEY:
            health[provider_name] = False
            continue
        if provider_name == "groq" and not settings.GROQ_API_KEY:
            health[provider_name] = False
            continue

        try:
            await provider_fn(messages=test_messages, max_tokens=5)
            health[provider_name] = True
        except Exception:
            health[provider_name] = False

    return health
