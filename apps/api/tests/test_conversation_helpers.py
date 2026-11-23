from app.rag.conversation import Turn, format_history, make_preview, make_title, retrieval_query
from app.rag.prompt import build_prompt, fit_to_budget


def test_title_is_one_line_and_cut_at_a_word():
    assert make_title("  What is\nALCOA?  ") == "What is ALCOA?"
    long = "Who is allowed to certify the release of a batch when a computerised system " * 3
    title = make_title(long, limit=40)
    assert len(title) <= 41 and title.endswith("…")
    assert not title[:-1].endswith(" ")


def test_preview_is_one_line_without_citation_numbers():
    text = "Backups\nmust be tested [1] and kept [2, 3]. Restore them yearly."
    assert make_preview(text) == "Backups must be tested and kept. Restore them yearly."


def test_preview_is_cut_at_a_word():
    preview = make_preview("alpha beta gamma delta " * 20, limit=30)
    assert preview is not None and len(preview) <= 31 and preview.endswith("…")
    assert not preview[:-1].endswith(" ")


def test_preview_of_nothing_is_none():
    assert make_preview(None) is None
    assert make_preview("") is None
    assert make_preview("  \n ") is None
    assert make_preview("[1]") is None


def test_preview_drops_a_citation_cut_in_half_by_truncation():
    # the SQL keeps the first 400 characters, which can end inside a marker
    for tail in (" [1", " [12, ", " [", " [2,3"):
        assert make_preview("Backups must be tested" + tail) == "Backups must be tested"


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


def test_preview_drops_markdown_marks():
    text = "- The area is 130 m2 [4].\n- **Two** floors, `garage` [1]\n## Notes\n1. Built in 2020"
    assert make_preview(text) == "The area is 130 m2. Two floors, garage Notes Built in 2020"
