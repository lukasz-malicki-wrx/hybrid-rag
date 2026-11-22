from dataclasses import dataclass
from pathlib import Path

from ..core.config import get_settings
from ..core.db import connect
from ..rag.embedding import OllamaEmbedder
from ..repositories.chunk import ChunkRepository
from ..services.search import SearchService
from .dataset import EvalCase, load_cases
from .metrics import KS, Summary, first_gold_rank, matches, summarize

MODES = ("vector", "fulltext", "hybrid")


@dataclass
class EvalReport:
    modes: list[str]
    invalid: list[str]  # cases whose gold phrase is not in the ingested corpus
    ranks: dict[str, dict[str, int | None]]  # mode -> case id -> rank (answerable cases)
    rejected: dict[str, dict[str, bool]]  # mode -> case id -> returned nothing (unanswerable)
    cases: list[EvalCase]

    def summary(self, mode: str, kind: str | None = None) -> Summary:
        selected = [c.id for c in self.cases if kind in (None, c.kind) and c.id in self.ranks[mode]]
        return summarize([self.ranks[mode][cid] for cid in selected])


def run(dataset: Path, modes: tuple[str, ...] = MODES, k: int = 10) -> EvalReport:
    settings = get_settings()
    embedder = OllamaEmbedder(settings.ollama_url, settings.embed_model, settings.embed_dim)
    cases = load_cases(dataset)
    ranks: dict[str, dict[str, int | None]] = {m: {} for m in modes}
    rejected: dict[str, dict[str, bool]] = {m: {} for m in modes}
    invalid: list[str] = []

    with connect() as conn:
        chunks = ChunkRepository(conn)
        search = SearchService(chunks, embedder, settings.max_vector_distance)
        for case in cases:
            if not case.answerable:
                for mode in modes:
                    rejected[mode][case.id] = not search.search(case.question, None, k, mode)
                continue
            gold = {
                row["id"]
                for row in chunks.by_filename(case.document)
                if matches(row["text"], case.any_of)
            }
            if not gold:
                invalid.append(case.id)
                continue
            for mode in modes:
                hits = search.search(case.question, None, k, mode)
                ranks[mode][case.id] = first_gold_rank([h["id"] for h in hits], gold)
    return EvalReport(list(modes), invalid, ranks, rejected, cases)


def _pct(x: float) -> str:
    return f"{x * 100:.0f}%"


def format_markdown(report: EvalReport) -> str:
    out: list[str] = []
    kinds = [None, *sorted({c.kind for c in report.cases if c.answerable})]
    for kind in kinds:
        title = "All answerable questions" if kind is None else f"{kind} questions"
        n = report.summary(report.modes[0], kind).n
        out.append(f"### {title} (n={n})\n")
        out.append("| Mode | " + " | ".join(f"hit@{k}" for k in KS) + " | MRR@10 |")
        out.append("| --- | " + " | ".join("---" for _ in KS) + " | --- |")
        for mode in report.modes:
            s = report.summary(mode, kind)
            hits = " | ".join(_pct(s.hit_at[k]) for k in KS)
            out.append(f"| {mode} | {hits} | {s.mrr:.3f} |")
        out.append("")
    unanswerable = [c.id for c in report.cases if not c.answerable]
    if unanswerable:
        out.append(f"### Unanswerable questions (n={len(unanswerable)})\n")
        out.append("| Mode | correctly returned nothing |")
        out.append("| --- | --- |")
        for mode in report.modes:
            hits = sum(report.rejected[mode][cid] for cid in unanswerable)
            out.append(f"| {mode} | {hits}/{len(unanswerable)} |")
        out.append("")
    if report.invalid:
        out.append(f"Skipped (gold phrase not in corpus): {', '.join(report.invalid)}\n")
    return "\n".join(out)
