from app.services.health import has_model


def test_untagged_model_matches_latest():
    assert has_model(["bge-m3:latest"], "bge-m3")


def test_tagged_model_needs_exact_tag():
    assert has_model(["qwen2.5:3b"], "qwen2.5:3b")
    assert not has_model(["qwen2.5:7b"], "qwen2.5:3b")


def test_missing_model():
    assert not has_model([], "bge-m3")
