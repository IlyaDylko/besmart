"""LLM calls via Cursor CLI (cursor-agent) — no Groq/OpenAI API key needed."""

from __future__ import annotations

import json
import os
import subprocess

CURSOR_BIN = os.environ.get("CURSOR_BIN", "cursor-agent")
DEFAULT_MODEL = os.environ.get("COVER_MODEL", "composer-2.5")
TIMEOUT_SEC = int(os.environ.get("COVER_LLM_TIMEOUT", "120"))


def run_cursor(prompt: str, model: str | None = None) -> str:
    model = model or DEFAULT_MODEL
    proc = subprocess.run(
        [CURSOR_BIN, "-p", "--trust", "--output-format", "json", "--model", model, prompt],
        capture_output=True,
        text=True,
        timeout=TIMEOUT_SEC,
    )
    if proc.returncode != 0:
        raise RuntimeError(
            f"cursor-agent exited {proc.returncode}: {proc.stderr.strip()[:400]}"
        )
    envelope = json.loads(proc.stdout)
    if isinstance(envelope, dict):
        return envelope.get("result", "")
    return str(envelope)


def extract_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1] if len(parts) > 1 else text
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()
    return json.loads(text)


def ask_json(system: str, user: str, model: str | None = None) -> dict:
    prompt = (
        f"{system.strip()}\n\n"
        f"{user.strip()}\n\n"
        "Respond with ONLY valid JSON. No markdown fences, no extra text."
    )
    return extract_json(run_cursor(prompt, model))
