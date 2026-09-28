import os
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("threatlink.ai.llm")

def get_llm_config() -> Dict[str, str]:
    api_key = os.getenv("LLM_API_KEY", "")
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    return {"api_key": api_key, "model": model}

def call_llm(system_prompt: str, user_prompt: str, timeout_seconds: int = 10) -> Optional[Dict[str, Any]]:
    """
    Call LLM API with structured JSON output, timeout handling, and fallback behavior.
    Does not log or expose API keys or credentials.
    """
    config = get_llm_config()
    api_key = config["api_key"]

    if not api_key:
        logger.info("LLM_API_KEY not configured. LLM call returning None for rule fallback.")
        return None

    try:
        # Standard HTTP client request to OpenAI-compatible LLM endpoint
        import urllib.request
        import urllib.error

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

        payload = {
            "model": config["model"],
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.1
        }

        req = urllib.request.Request(
            "https://api.openai.com/v1/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers=headers,
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=timeout_seconds) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            content = res_body["choices"][0]["message"]["content"]
            return json.loads(content)

    except urllib.error.URLError as err:
        logger.warning(f"LLM request failed or timed out: {err.reason if hasattr(err, 'reason') else err}")
        return None
    except Exception as err:
        logger.warning(f"LLM execution error: {type(err).__name__}")
        return None
