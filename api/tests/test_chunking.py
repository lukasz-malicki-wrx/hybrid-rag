from app.rag.chunking import split_text


def test_empty_text_gives_no_chunks():
    assert split_text("   \n  ") == []


def test_short_text_is_single_chunk():
    assert split_text("Hello world.") == ["Hello world."]


def test_chunks_respect_size_and_overlap():
    text = ". ".join(f"Sentence number {i}" for i in range(400))
    chunks = split_text(text, size=500, overlap=100)
    assert len(chunks) > 1
    assert all(len(c) <= 500 for c in chunks)
    assert chunks[1][:30] in chunks[0]


def test_no_progress_stall_on_unbroken_text():
    chunks = split_text("x" * 5000, size=500, overlap=100)
    assert "".join(chunks).count("x") >= 5000
