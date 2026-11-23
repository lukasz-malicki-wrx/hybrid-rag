from uuid import uuid4

from fastapi.testclient import TestClient

from app.api.deps import get_conversation_service, get_feedback_service
from app.core.errors import NotFoundError
from app.main import create_app
from app.services.conversation import ConversationService


class FakeFeedback:
    def __init__(self, known: set):
        self.known = known

    def set(self, answer_id, rating):
        if answer_id not in self.known:
            raise NotFoundError("answer not found")
        return {"answer_id": answer_id, "rating": rating}


def client_for(feedback: FakeFeedback) -> TestClient:
    app = create_app()
    app.dependency_overrides[get_feedback_service] = lambda: feedback
    return TestClient(app)


def test_rating_an_answer_returns_it():
    answer_id = uuid4()
    client = client_for(FakeFeedback({answer_id}))
    for rating in ("up", "down", None):
        resp = client.put(f"/answers/{answer_id}/feedback", json={"rating": rating})
        assert resp.status_code == 200
        assert resp.json() == {"answer_id": str(answer_id), "rating": rating}


def test_rating_an_unknown_answer_is_404():
    client = client_for(FakeFeedback(set()))
    resp = client.put(f"/answers/{uuid4()}/feedback", json={"rating": "up"})
    assert resp.status_code == 404
    assert resp.json() == {"detail": "answer not found"}


def test_a_bad_rating_is_422():
    answer_id = uuid4()
    client = client_for(FakeFeedback({answer_id}))
    for body in ({"rating": "meh"}, {}, {"rating": 5}):
        resp = client.put(f"/answers/{answer_id}/feedback", json=body)
        assert resp.status_code == 422, body


class _Conn:
    def __init__(self):
        self.calls = []

    def commit(self):
        self.calls.append("commit")

    def rollback(self):
        self.calls.append("rollback")


class _VanishingConversations:
    """get() finds the conversation, then it is deleted before update() re-reads it."""

    def get(self, conversation_id):
        return {"id": conversation_id}

    def update(self, conversation_id, changes):
        return None


def test_updating_a_conversation_deleted_meanwhile_is_404_not_a_crash():
    conn = _Conn()
    service = ConversationService(conn, _VanishingConversations(), None, None, None)
    app = create_app()
    app.dependency_overrides[get_conversation_service] = lambda: service
    resp = TestClient(app).patch(f"/conversations/{uuid4()}", json={"title": "x"})
    assert resp.status_code == 404
    assert "commit" not in conn.calls
