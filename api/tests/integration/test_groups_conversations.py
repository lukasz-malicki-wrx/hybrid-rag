import hashlib
import threading
import time
import uuid

import pytest

from app.core.errors import ConflictError, NotFoundError
from app.repositories.chunk import ChunkRepository
from app.repositories.conversation import ConversationRepository
from app.repositories.document import DocumentRepository
from app.repositories.group import GroupRepository
from app.schemas.answer import DoneEvent, TokenEvent
from app.services.answer import AnswerService
from app.services.conversation import ConversationService
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
