from app.rag.fusion import rrf


def test_item_in_both_rankings_beats_item_in_one():
    scores = rrf([["a", "b"], ["c", "a"]])
    assert scores["a"] > scores["b"]
    assert scores["a"] > scores["c"]


def test_higher_rank_scores_higher():
    scores = rrf([["a", "b", "c"]])
    assert scores["a"] > scores["b"] > scores["c"]


def test_empty_rankings():
    assert rrf([[], []]) == {}
