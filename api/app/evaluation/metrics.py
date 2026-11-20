"""Pure retrieval metrics and gold matching (no I/O)."""

import re
from collections.abc import Iterable, Sequence
from dataclasses import dataclass

KS = (1, 3, 5, 10)


def normalize(text: str) -> str:
    """Lowercase and drop all whitespace so PDF line breaks and odd spacing do not matter."""
    return re.sub(r"\s+", "", text).lower()


def matches(chunk_text: str, phrases: Iterable[str]) -> bool:
    haystack = normalize(chunk_text)
    return any(normalize(p) in haystack for p in phrases)


def first_gold_rank(retrieved_ids: Sequence[int], gold_ids: set[int]) -> int | None:
    """1-based rank of the first retrieved chunk that is a gold chunk, else None."""
    for rank, chunk_id in enumerate(retrieved_ids, start=1):
        if chunk_id in gold_ids:
            return rank
    return None


@dataclass(frozen=True)
class Summary:
    n: int
    hit_at: dict[int, float]
    mrr: float


def summarize(ranks: Sequence[int | None], ks: Sequence[int] = KS) -> Summary:
    """hit@k = share of cases with a gold chunk in the top k; MRR over the retrieved list."""
    n = len(ranks)
    if n == 0:
        return Summary(0, {k: 0.0 for k in ks}, 0.0)
    hit_at = {k: sum(1 for r in ranks if r is not None and r <= k) / n for k in ks}
    mrr = sum(1 / r for r in ranks if r is not None) / n
    return Summary(n, hit_at, mrr)
