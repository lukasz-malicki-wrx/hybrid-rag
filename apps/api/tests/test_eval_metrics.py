from app.evaluation.metrics import first_gold_rank, matches, normalize, summarize


def test_normalize_ignores_whitespace_and_case():
    assert normalize("Audit  trails\nneed") == "audittrailsneed"


def test_matches_across_line_breaks_and_spacing_artifacts():
    chunk = "the reason should be\ndocumented. Audit trails need to be avail able"
    assert matches(chunk, ["reason should be documented"])
    assert matches(chunk, ["audit trails need to be available"])
    assert not matches(chunk, ["batch release"])


def test_first_gold_rank():
    assert first_gold_rank([5, 9, 3], {3, 9}) == 2
    assert first_gold_rank([5, 9], {1}) is None


def test_summarize_hit_rate_and_mrr():
    s = summarize([1, 3, None, 2], ks=(1, 3))
    assert s.n == 4
    assert s.hit_at == {1: 0.25, 3: 0.75}
    assert abs(s.mrr - (1 + 1 / 3 + 0 + 1 / 2) / 4) < 1e-9


def test_summarize_empty():
    assert summarize([]).mrr == 0.0


def test_dataset_validates_gold_against_kind():
    import pytest

    from app.evaluation.dataset import EvalCase

    EvalCase(id="n", kind="unanswerable", question="q")
    with pytest.raises(ValueError, match="need document"):
        EvalCase(id="a", kind="paraphrase", question="q")
    with pytest.raises(ValueError, match="must not name"):
        EvalCase(id="u", kind="unanswerable", question="q", document="d", any_of=["x"])


def test_repository_dataset_loads():
    from pathlib import Path

    from app.evaluation.dataset import load_cases

    cases = load_cases(Path(__file__).parents[3] / "eval" / "questions.json")
    assert sum(not c.answerable for c in cases) == 10
