import re

# Common English function words; they match almost every chunk and only add noise to ranking.
STOPWORDS = frozenset(
    """
    the and for are but not you all any can had her was one our out has have been were they
    their this that with from will would there what when which who whom whose why how into
    than then them these those been being does did doing done should could may might must
    shall about above after again against before below between both during each few more most
    other over same some such only own very just also its his she him your yours ours here
    where while until under onto upon via per
    """.split()
)


def build_tsquery(
    question: str, drop_stopwords: bool = True, match_all: bool = False
) -> str | None:
    """tsquery from the question's words (short tokens and stopwords dropped).

    OR-joined for ranking; with match_all, AND-joined: every content word must be present.
    """
    words = {w for w in re.findall(r"\w+", question.lower()) if len(w) > 2}
    if drop_stopwords:
        words -= STOPWORDS
    return (" & " if match_all else " | ").join(sorted(words)) or None
