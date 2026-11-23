import hashlib
import threading
import time
import uuid

import pytest

from app.core.errors import ConflictError, NotFoundError
from app.rag.prompt import REFUSAL
from app.repositories.answer import FeedbackRepository
from app.repositories.chunk import ChunkRepository
from app.repositories.conversation import ConversationRepository
from app.repositories.document import DocumentRepository
from app.repositories.group import GroupRepository
from app.schemas.answer import DoneEvent, TokenEvent
from app.services.answer import AnswerService
from app.services.conversation import ConversationService
from app.services.feedback import FeedbackService
from app.services.group import GroupService


def groups(conn) -> GroupService:
    return GroupService(
        conn,
        GroupRepository(conn),
        ConversationRepository(conn),
        DocumentRepository(conn),
    )


def conversations(conn) -> ConversationService:
    return ConversationService(
        conn,
        ConversationRepository(conn),
        GroupRepository(conn),
        ChunkRepository(conn),
        DocumentRepository(conn),
    )


def unique(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


@pytest.fixture(autouse=True)
def no_favourites(connect):
    with connect() as c:
        c.execute("UPDATE conversations SET favorite_at = NULL WHERE favorite_at IS NOT NULL")


def test_group_names_are_unique_ignoring_case(conn):
    name = unique("Med")
    groups(conn).create(name)
    with pytest.raises(ConflictError):
        groups(conn).create(f"  {name.upper()} ")


def test_deleting_a_group_deletes_its_conversations(conn):
    g = groups(conn).create(unique("gxp"))
    svc = conversations(conn)
    for q in ("first?", "second?"):
        svc.start_turn(q, None, g["id"])
    assert groups(conn).get(g["id"])["conversation_count"] == 2

    result = groups(conn).delete(g["id"])
    assert result["deleted_conversations"] == 2
    assert svc.list(g["id"], False, 50) == []
    with pytest.raises(NotFoundError):
        groups(conn).get(g["id"])


def test_at_most_ten_favourites(conn):
    svc = conversations(conn)
    ids = [svc.start_turn(f"q{i}?", None, None).conversation["id"] for i in range(11)]
    for cid in ids[:10]:
        assert svc.update(cid, {"favorite": True})["favorite"]
    with pytest.raises(ConflictError, match="at most 10"):
        svc.update(ids[10], {"favorite": True})
    # deleting a favourite frees a slot
    svc.delete(ids[0])
    assert svc.update(ids[10], {"favorite": True})["favorite"]
    favourites = svc.list(None, True, 50)
    assert len(favourites) == 10 and favourites[-1]["id"] == ids[10]


def test_favourite_limit_holds_under_concurrency(connect):
    with connect() as c:
        svc = conversations(c)
        ids = [svc.start_turn(f"c{i}?", None, None).conversation["id"] for i in range(15)]
    outcomes = []

    def favourite(cid):
        with connect() as c:
            try:
                conversations(c).update(cid, {"favorite": True})
                outcomes.append("ok")
            except ConflictError:
                outcomes.append("limit")

    threads = [threading.Thread(target=favourite, args=(cid,)) for cid in ids]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert outcomes.count("ok") == 10 and outcomes.count("limit") == 5


def test_new_conversation_in_a_group_searches_only_its_documents(conn):
    g = groups(conn).create(unique("scope"))
    sha = hashlib.sha256(uuid.uuid4().bytes).hexdigest()
    doc = DocumentRepository(conn).create(f"{sha[:6]}.pdf", sha, 1, None)
    conn.commit()
    groups(conn).add_document(g["id"], doc["id"])

    turn = conversations(conn).start_turn("Who approves?", None, g["id"])
    assert turn.created and turn.conversation["title"] == "Who approves?"
    assert turn.scope == [doc["id"]]
    assert conversations(conn).start_turn("Ungrouped?", None, None).scope is None


class FakeLLM:
    name, model = "fake", "fake-1"

    def __init__(self, tokens, delay=0.0):
        self.tokens, self.delay = tokens, delay
        self.prompts = []

    def stream(self, system, user):
        self.prompts.append(user)
        for t in self.tokens:
            time.sleep(self.delay)
            yield t


def chunk_hit(conn) -> dict:
    sha = hashlib.sha256(uuid.uuid4().bytes).hexdigest()
    doc = DocumentRepository(conn).create(f"{sha[:6]}.pdf", sha, 1, None)
    ChunkRepository(conn).add_many(doc["id"], [(3, 0, "Backups must be tested.")], [[0.1] * 1024])
    conn.commit()
    row = conn.execute("SELECT id FROM chunks WHERE document_id = %s", (doc["id"],)).fetchone()
    return {
        "id": row["id"],
        "document_id": doc["id"],
        "filename": doc["filename"],
        "version": 1,
        "sha256": sha,
        "page": 3,
        "text": "Backups must be tested.",
    }


def drain(run):
    events = []
    while (e := run.next_event()) is not None:
        events.append(e)
    return events


def test_two_turns_are_stored_and_the_second_sees_the_first(connect, conn):
    hit = chunk_hit(conn)
    llm = FakeLLM(["Backups ", "must be tested [1]."])
    answers = AnswerService(llm, connect, "bge-m3")
    svc = conversations(conn)

    turn = svc.start_turn("What about backups?", None, None)
    drain(
        answers.start("What about backups?", turn.conversation["id"], turn.history, None, {}, [hit])
    )
    turn2 = svc.start_turn("How often?", turn.conversation["id"], None)
    assert [t.question for t in turn2.history] == ["What about backups?"]
    events = drain(
        answers.start("How often?", turn2.conversation["id"], turn2.history, None, {}, [hit])
    )
    assert isinstance(events[-1], DoneEvent) and events[-1].citations == [1]
    assert (
        "Earlier conversation" in llm.prompts[1]
        and "[1]" not in llm.prompts[1].split("Excerpts")[0]
    )

    detail = svc.detail(turn.conversation["id"])
    assert [m["question"] for m in detail["messages"]] == ["What about backups?", "How often?"]
    answer = detail["messages"][0]["answer"]
    assert answer["citations"] == [1] and answer["sources"][0]["page"] == 3


def test_stop_keeps_the_partial_answer_marked_stopped(connect, conn):
    hit = chunk_hit(conn)
    answers = AnswerService(FakeLLM(["word "] * 200, delay=0.01), connect, "bge-m3")
    turn = conversations(conn).start_turn("Long answer please?", None, None)
    run = answers.start("Long answer please?", turn.conversation["id"], [], None, {}, [hit])
    seen = 0
    while (e := run.next_event()) is not None:
        if isinstance(e, TokenEvent):
            seen += 1
            if seen == 3:
                run.cancel()  # what the API does when the client disconnects
        last = e
    assert isinstance(last, DoneEvent) and last.stopped
    stored = conversations(conn).detail(turn.conversation["id"])["messages"][0]["answer"]
    assert stored["stopped"] and stored["text"].count("word") < 200


def new_doc(conn) -> dict:
    sha = hashlib.sha256(uuid.uuid4().bytes).hexdigest()
    doc = DocumentRepository(conn).create(f"{sha[:6]}.pdf", sha, 1, None)
    conn.commit()
    return doc


def test_pinned_documents_narrow_the_scope_and_clearing_restores_it(conn):
    g = groups(conn).create(unique("pin"))
    in_group, attached = new_doc(conn), new_doc(conn)
    groups(conn).add_document(g["id"], in_group["id"])
    svc = conversations(conn)

    # attaching a file to the first message pins it: only that file is searched
    turn = svc.start_turn("About the attachment?", None, g["id"], [attached["id"]])
    assert turn.scope == [attached["id"]]
    cid = turn.conversation["id"]
    assert [d["id"] for d in svc.detail(cid)["documents"]] == [attached["id"]]

    # a later question in the same conversation keeps the pinned scope
    assert svc.start_turn("And then?", cid, None).scope == [attached["id"]]

    # clearing the pins falls back to the group's documents
    assert svc.set_documents(cid, []) == []
    assert svc.start_turn("Whole group?", cid, None).scope == [in_group["id"]]


def test_ungrouped_conversation_without_pins_searches_everything(conn):
    svc = conversations(conn)
    cid = svc.start_turn("Anything?", None, None).conversation["id"]
    doc = new_doc(conn)
    assert svc.set_documents(cid, [doc["id"], doc["id"]])[0]["id"] == doc["id"]  # deduplicated
    assert svc.start_turn("Only that?", cid, None).scope == [doc["id"]]
    svc.set_documents(cid, [])
    assert svc.start_turn("Everything?", cid, None).scope is None


def test_deleted_pinned_document_falls_back_to_the_default_scope(conn):
    svc = conversations(conn)
    doc = new_doc(conn)
    cid = svc.start_turn("Pinned?", None, None, [doc["id"]]).conversation["id"]
    DocumentRepository(conn).deactivate(doc["id"])
    conn.commit()
    assert svc.start_turn("Still?", cid, None).scope is None


def test_unknown_documents_cannot_be_pinned(conn):
    svc = conversations(conn)
    with pytest.raises(NotFoundError, match="not available"):
        svc.start_turn("Pin a ghost?", None, None, [uuid.uuid4()])
    cid = svc.start_turn("Valid?", None, None).conversation["id"]
    with pytest.raises(NotFoundError):
        svc.set_documents(cid, [uuid.uuid4()])


def test_attachments_are_shown_with_their_question(connect, conn):
    hit = chunk_hit(conn)
    doc = new_doc(conn)
    answers = AnswerService(FakeLLM(["Plug it in [1]."]), connect, "bge-m3")
    svc = conversations(conn)

    turn = svc.start_turn("How do I connect it?", None, None, None, [doc["id"]])
    assert turn.scope == [doc["id"]]  # an attached file is also pinned
    drain(
        answers.start(
            "How do I connect it?", turn.conversation["id"], [], turn.scope, {}, [hit], [doc["id"]]
        )
    )
    turn2 = svc.start_turn("Anything else?", turn.conversation["id"], None)
    drain(answers.start("Anything else?", turn2.conversation["id"], turn2.history, None, {}, [hit]))

    first, second = svc.detail(turn.conversation["id"])["messages"]
    assert [a["filename"] for a in first["attachments"]] == [doc["filename"]]
    assert second["attachments"] == []


def test_removing_a_document_from_a_group_is_soft_and_can_be_undone(conn):
    g = groups(conn).create(unique("soft"))
    doc = new_doc(conn)
    groups(conn).add_document(g["id"], doc["id"])
    groups(conn).remove_document(g["id"], doc["id"])
    assert GroupRepository(conn).document_ids(g["id"]) == []
    row = conn.execute(
        "SELECT removed_at FROM group_documents WHERE group_id = %s", (g["id"],)
    ).fetchone()
    assert row["removed_at"] is not None  # the row is kept
    groups(conn).add_document(g["id"], doc["id"])
    assert GroupRepository(conn).document_ids(g["id"]) == [doc["id"]]


def test_unpinning_is_soft_and_repinning_restores(conn):
    svc = conversations(conn)
    doc = new_doc(conn)
    cid = svc.start_turn("Soft pins?", None, None, [doc["id"]]).conversation["id"]
    svc.set_documents(cid, [])
    assert svc.detail(cid)["documents"] == []
    kept = conn.execute(
        "SELECT count(*) AS n FROM conversation_documents WHERE conversation_id = %s", (cid,)
    ).fetchone()["n"]
    assert kept == 1
    svc.set_documents(cid, [doc["id"]])
    assert [d["id"] for d in svc.detail(cid)["documents"]] == [doc["id"]]


def answered(connect, conn, svc, question, tokens, conversation_id=None):
    """Run one turn to completion; returns the conversation id."""
    hit = chunk_hit(conn)
    turn = svc.start_turn(question, conversation_id, None)
    cid = turn.conversation["id"]
    drain(
        AnswerService(FakeLLM(tokens), connect, "bge-m3").start(
            question, cid, turn.history, None, {}, [hit]
        )
    )
    return cid


def listed(svc, cid):
    return next(c for c in svc.list(None, False, 200) if c["id"] == cid)


def test_preview_is_empty_until_the_first_answer(connect, conn):
    svc = conversations(conn)
    turn = svc.start_turn("Anything yet?", None, None)
    cid = turn.conversation["id"]
    assert turn.conversation.get("preview") is None
    assert listed(svc, cid)["preview"] is None
    assert svc.detail(cid)["preview"] is None
    answered(connect, conn, svc, "Anything now?", ["Backups ", "must be tested [1]."], cid)
    assert listed(svc, cid)["preview"] == "Backups must be tested."


def test_preview_comes_from_the_latest_answer(connect, conn):
    svc = conversations(conn)
    cid = answered(connect, conn, svc, "First?", ["Old answer [1]."])
    answered(connect, conn, svc, "Second?", ["New answer [1]."], cid)
    assert listed(svc, cid)["preview"] == "New answer."
    assert svc.detail(cid)["preview"] == "New answer."
    # a question still waiting for its answer does not hide the previous preview
    svc.start_turn("Third?", cid, None)
    assert listed(svc, cid)["preview"] == "New answer."


def test_preview_survives_update_and_group_lists(connect, conn):
    svc = conversations(conn)
    g = groups(conn).create(unique("prev"))
    turn = svc.start_turn("Grouped?", None, g["id"])
    cid = turn.conversation["id"]
    drain(
        AnswerService(FakeLLM(["Grouped answer."]), connect, "bge-m3").start(
            "Grouped?", cid, [], None, {}, [chunk_hit(conn)]
        )
    )
    assert svc.update(cid, {"favorite": True})["preview"] == "Grouped answer."
    assert svc.update(cid, {"title": "Renamed"})["preview"] == "Grouped answer."
    assert [c["preview"] for c in svc.list(g["id"], False, 50)] == ["Grouped answer."]
    assert [c["preview"] for c in svc.list(None, True, 50) if c["id"] == cid] == ["Grouped answer."]


def test_preview_cuts_a_long_answer_without_a_dangling_citation(connect, conn):
    svc = conversations(conn)
    # the 400th character falls inside the "[1]" marker
    cid = answered(connect, conn, svc, "Long?", ["x" * 397 + " [1] and more text"])
    preview = listed(svc, cid)["preview"]
    assert "[" not in preview and preview.endswith("…")


def test_preview_skips_refusals_and_stopped_answers(connect, conn):
    svc = conversations(conn)
    cid = answered(connect, conn, svc, "Backups?", ["Backups must be tested [1]."])
    # a refusal says nothing about the conversation: the earlier answer stays the preview
    answered(connect, conn, svc, "Pancakes?", [REFUSAL], cid)
    assert listed(svc, cid)["preview"] == "Backups must be tested."
    # an answer stopped after a word or two neither
    turn = svc.start_turn("Restore?", cid, None)
    run = AnswerService(FakeLLM(["Z"] + ["word "] * 200, delay=0.01), connect, "bge-m3").start(
        "Restore?", cid, turn.history, None, {}, [chunk_hit(conn)]
    )
    run.next_event()
    run.cancel()
    drain(run)
    assert svc.detail(cid)["messages"][-1]["answer"]["stopped"]
    assert listed(svc, cid)["preview"] == "Backups must be tested."
    # only refusals: no preview at all
    only = answered(connect, conn, svc, "Weather?", [REFUSAL])
    assert listed(svc, only)["preview"] is None


def rate(conn, answer_id, rating):
    return FeedbackService(conn, FeedbackRepository(conn)).set(answer_id, rating)


def first_answer(svc, cid):
    return svc.detail(cid)["messages"][0]["answer"]


def test_rating_an_answer_can_be_replaced_and_withdrawn(connect, conn):
    svc = conversations(conn)
    cid = answered(connect, conn, svc, "Rate me?", ["Fine [1]."])
    answer = first_answer(svc, cid)
    assert answer["rating"] is None

    assert rate(conn, answer["id"], "up") == {"answer_id": answer["id"], "rating": "up"}
    assert first_answer(svc, cid)["rating"] == "up"
    assert rate(conn, answer["id"], "down")["rating"] == "down"
    assert first_answer(svc, cid)["rating"] == "down"
    assert rate(conn, answer["id"], None)["rating"] is None
    assert first_answer(svc, cid)["rating"] is None
    n = conn.execute(
        "SELECT count(*) AS n FROM answer_feedback WHERE answer_id = %s", (answer["id"],)
    ).fetchone()["n"]
    assert n == 1  # one row per answer, kept when withdrawn


def test_rating_an_unknown_answer_is_not_found(conn):
    with pytest.raises(NotFoundError):
        rate(conn, uuid.uuid4(), "up")


def test_rating_an_answer_of_a_deleted_conversation_is_not_found(connect, conn):
    svc = conversations(conn)
    cid = answered(connect, conn, svc, "Gone soon?", ["Yes [1]."])
    answer_id = first_answer(svc, cid)["id"]
    svc.delete(cid)
    with pytest.raises(NotFoundError):
        rate(conn, answer_id, "up")
    conn.rollback()
    assert (
        conn.execute(
            "SELECT count(*) AS n FROM answer_feedback WHERE answer_id = %s", (answer_id,)
        ).fetchone()["n"]
        == 0
    )
