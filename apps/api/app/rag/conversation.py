"""Pure helpers for multi-turn conversations."""

import re
from dataclasses import dataclass

TITLE_CHARS = 80
HISTORY_TURNS = 3
HISTORY_ANSWER_CHARS = 1200

_CITATION = re.compile(r"\s*\[\d+(?:\s*,\s*\d+)*\]")


@dataclass(frozen=True)
class Turn:
    question: str
    answer: str


def make_title(question: str, limit: int = TITLE_CHARS) -> str:
    """Conversation title from its first question: one line, cut at a word boundary."""
    text = " ".join(question.split())
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0] or text[:limit]
    return cut.rstrip(" ,.;:-") + "…"


def retrieval_query(question: str, history: list[Turn]) -> str:
    """Text to search with. A follow-up ("and what about backups?") rarely names its topic,
    so the previous question is searched together with it."""
    if not history:
        return question
    return f"{history[-1].question}\n{question}"


def format_history(history: list[Turn]) -> str:
    """Earlier turns for the prompt. Citation numbers are removed: they referred to earlier
    excerpts and would clash with the numbering of this turn's excerpts."""
    lines = []
    for turn in history:
        answer = _CITATION.sub("", turn.answer).strip()
        if len(answer) > HISTORY_ANSWER_CHARS:
            answer = answer[:HISTORY_ANSWER_CHARS].rstrip() + "…"
        lines.append(f"User: {turn.question}\nAssistant: {answer}")
    return "\n\n".join(lines)
