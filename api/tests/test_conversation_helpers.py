from app.rag.conversation import Turn, format_history, make_title, retrieval_query
from app.rag.prompt import build_prompt, fit_to_budget


def test_title_is_one_line_and_cut_at_a_word():
    assert make_title("  What is\nALCOA?  ") == "What is ALCOA?"
    long = "Who is allowed to certify the release of a batch when a computerised system " * 3
    title = make_title(long, limit=40)
    assert len(title) <= 41 and title.endswith("…")
    assert not title[:-1].endswith(" ")


def test_follow_up_is_searched_with_the_previous_question():
    history = [Turn("What does Annex 11 say about backups?", "Regular back-ups [1].")]
    assert retrieval_query("How often?", history) == (
        "What does Annex 11 say about backups?\nHow often?"
    )
    assert retrieval_query("How often?", []) == "How often?"


def test_history_drops_old_citation_numbers_and_long_answers():
    text = format_history([Turn("q1", "Answer with cite [1] and [2, 3]. " + "x" * 2000)])
    assert "[1]" not in text and "[2, 3]" not in text
    assert text.startswith("User: q1\nAssistant: Answer with cite and.")
    assert text.endswith("…")


def test_prompt_shows_history_before_excerpts():
    hit = {"filename": "a.pdf", "page": 1, "text": "alpha"}
    _, user = build_prompt("now?", [hit], history="User: before\nAssistant: yes")
    assert user.index("Earlier conversation") < user.index("Excerpts") < user.index("Question:")


def test_history_takes_room_from_the_excerpt_budget():
    hits = [{"filename": "a.pdf", "page": i, "text": "x" * 3000} for i in range(10)]
    without = fit_to_budget("q", hits, 8192, 768)
    with_history = fit_to_budget("q", hits, 8192, 768, history="h" * 6000)
    assert len(with_history) < len(without)
