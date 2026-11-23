"""Pure helpers for multi-turn conversations."""

import re
from dataclasses import dataclass

TITLE_CHARS = 80
PREVIEW_CHARS = 160
HISTORY_TURNS = 3
HISTORY_ANSWER_CHARS = 1200

_CITATION = re.compile(r"\s*\[\d+(?:\s*,\s*\d+)*\]")
# A marker cut in half by the caller's own truncation: "[1" or "[2, " at the very end.
_CUT_CITATION = re.compile(r"\s*\[[\d\s,]*$")


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


# Markdown that models put in answers: list bullets and numbers, headings, emphasis and code marks.
_MARKDOWN_LINE = re.compile(r"^\s*(?:[-*•+]\s+|\d+[.)]\s+|#{1,6}\s+|>\s*)", re.MULTILINE)
_MARKDOWN_INLINE = re.compile(r"\*\*|__|`")


def make_preview(answer: str | None, limit: int = PREVIEW_CHARS) -> str | None:
    """Start of an answer for a conversation list: one line of plain text, without citation
    numbers or Markdown marks."""
    text = _CUT_CITATION.sub("", _CITATION.sub("", answer or ""))
    text = _MARKDOWN_INLINE.sub("", _MARKDOWN_LINE.sub("", text))
    return make_title(text, limit) or None


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
