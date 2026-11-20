from app.rag.query import build_tsquery


def test_drops_short_tokens_and_dedups():
    assert build_tsquery("Is GPIO12 on GPIO12?") == "gpio12"


def test_joins_with_or():
    assert build_tsquery("boot voltage") == "boot | voltage"


def test_none_when_nothing_left():
    assert build_tsquery("a of ?") is None


def test_drops_stopwords_but_keeps_content_words():
    assert build_tsquery("Who should review the audit trails?") == "audit | review | trails"


def test_stopwords_can_be_kept():
    assert "should" in build_tsquery("should review", drop_stopwords=False)


def test_match_all_joins_with_and():
    assert build_tsquery("audit trail review", match_all=True) == "audit & review & trail"
