from uuid import uuid4

from pydantic import TypeAdapter

from app.rag.prompt import REFUSAL
from app.schemas.answer import AnswerEvent, DoneEvent, SourcesEvent, TokenEvent
from app.services.answer import AnswerService, Completion


class FakeLLM:
    name = "fake"
    model = "fake-1"

    def __init__(self, tokens):
        self.tokens = tokens
        self.calls = 0
        self.closed = False

    def stream(self, system, user):
        self.calls += 1
        try:
            yield from self.tokens
        finally:
            self.closed = True  # the provider's HTTP stream would be closed here


HIT = {
    "id": 7,
    "document_id": uuid4(),
    "filename": "a.pdf",
    "version": 1,
    "sha256": "x",
    "page": 2,
    "text": "GPIO12 is a strapping pin.",
}


def run(llm, hits):
    service = AnswerService(llm, connect=None, embed_model="bge-m3")
    return list(service.generate("which pin?", hits))


def test_no_hits_refuses_without_calling_llm():
    llm = FakeLLM(["should not be used"])
    events = run(llm, [])
    assert llm.calls == 0
    assert isinstance(events[-1], Completion)
    assert events[-1].refused is True
    assert events[-1].text == REFUSAL


def test_grounded_answer_reports_citations():
    events = run(FakeLLM(["GPIO12 ", "is a strapping pin [1]."]), [HIT])
    assert [type(e) for e in events] == [SourcesEvent, TokenEvent, TokenEvent, Completion]
    done = events[-1]
    assert done.citations == [1]
    assert not done.refused and not done.uncited


def test_answer_without_citation_is_flagged():
    assert run(FakeLLM(["It is a pin."]), [HIT])[-1].uncited is True


def test_model_refusal_is_detected():
    done = run(FakeLLM([REFUSAL]), [HIT])[-1]
    assert done.refused is True
    assert done.citations == []
    assert not done.uncited


def test_sources_event_numbers_hits():
    sources = run(FakeLLM(["x [1]"]), [HIT])[0].sources
    assert sources[0].n == 1 and sources[0].page == 2


def test_event_union_round_trips_by_type_field():
    adapter = TypeAdapter(AnswerEvent)
    event = DoneEvent(answer_id=uuid4(), refused=False, citations=[1], uncited=False)
    parsed = adapter.validate_json(event.model_dump_json())
    assert isinstance(parsed, DoneEvent)
    assert adapter.validate_python({"type": "token", "text": "hi"}) == TokenEvent(text="hi")


def test_cancel_stops_the_model_and_marks_the_answer_stopped():
    import threading

    cancel = threading.Event()
    llm = FakeLLM(["one ", "two ", "three"])
    service = AnswerService(llm, connect=None, embed_model="bge-m3")
    events = []
    for event in service.generate("q", [HIT], cancel=cancel):
        events.append(event)
        if isinstance(event, TokenEvent):
            cancel.set()  # e.g. the client pressed Stop after the first token
    done = events[-1]
    assert done.stopped and done.text == "one "
    assert llm.closed
