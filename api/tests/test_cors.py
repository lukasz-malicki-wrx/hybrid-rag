from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import create_app


def preflight(origin: str, method: str = "POST"):
    client = TestClient(create_app())
    return client.options(
        "/answers",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": method,
            "Access-Control-Request-Headers": "content-type",
        },
    )


def test_origins_are_parsed_and_trimmed():
    assert get_settings().cors_origins == ("http://localhost:3000", "https://app.example.com")


def test_allowed_origin_gets_cors_headers():
    resp = preflight("https://app.example.com")
    assert resp.status_code == 200
    assert resp.headers["access-control-allow-origin"] == "https://app.example.com"


def test_unknown_origin_is_rejected():
    resp = preflight("https://evil.example.org")
    assert resp.status_code == 400
    assert "access-control-allow-origin" not in resp.headers


def test_unlisted_method_is_rejected():
    assert preflight("http://localhost:3000", method="PUT").status_code == 400
