import pytest

from app.rag.embedding import Embedder
from app.services.search import SearchService


class FakeEmbedder(Embedder):
    model = "fake"

    def embed(self, texts):
        return [[0.0] * 3 for _ in texts]


class FakeChunks:
    def __init__(self, nearest_distance, strict_match):
        self.nearest_distance = nearest_distance
        self.strict_match = strict_match
        self.fulltext_queries = []

    def vector_search(self, embedding, docs, limit):
        return [{"id": 1, "text": "v", "distance": self.nearest_distance}]

    def fulltext_search(self, tsquery, docs, limit):
        self.fulltext_queries.append(tsquery)
        if "&" in tsquery:
            return [{"id": 2, "text": "f"}] if self.strict_match else []
        return [{"id": 2, "text": "f"}]


def service(distance, strict=False, threshold=0.5):
    chunks = FakeChunks(distance, strict)
    return SearchService(chunks, FakeEmbedder(), threshold), chunks


def test_close_neighbour_passes_gate():
    svc, _ = service(0.3)
    assert {h["id"] for h in svc.search("audit trail review")} == {1, 2}


def test_far_neighbour_without_keyword_match_returns_nothing():
    svc, chunks = service(0.7)
    assert svc.search("pancake recipe") == []
    assert "pancake & recipe" in chunks.fulltext_queries


def test_far_neighbour_with_exact_keyword_match_passes():
    svc, _ = service(0.7, strict=True)
    assert svc.search("ALCOA") != []


def test_vector_mode_has_no_keyword_rescue():
    svc, _ = service(0.7, strict=True)
    assert svc.search("ALCOA", mode="vector") == []


def test_gate_can_be_disabled():
    svc, _ = service(0.9, threshold=None)
    assert svc.search("anything") != []


def test_unknown_mode_is_rejected():
    svc, _ = service(0.3)
    with pytest.raises(ValueError, match="unknown search mode"):
        svc.search("q", mode="semantic")
