"""Integration tests against a real Postgres with pgvector.

Run only when TEST_DATABASE_URL is set. The database name must end in '_test': the suite drops
and recreates its public schema.
"""

import os
from collections.abc import Callable, Iterator
from pathlib import Path
from urllib.parse import urlparse

import psycopg
import pytest
from pgvector.psycopg import register_vector
from psycopg.rows import dict_row

from app.core import migrate

URL = os.environ.get("TEST_DATABASE_URL")
SAMPLES = Path(__file__).resolve().parents[3] / "samples"


def pytest_collection_modifyitems(items):
    if not URL:
        skip = pytest.mark.skip(reason="set TEST_DATABASE_URL to run integration tests")
        for item in items:
            if "integration" in item.nodeid:
                item.add_marker(skip)


@pytest.fixture(scope="session")
def db_url() -> str:
    assert URL
    if not urlparse(URL).path.rstrip("/").endswith("_test"):
        pytest.fail("TEST_DATABASE_URL must point at a database whose name ends with '_test'")
    with psycopg.connect(URL, autocommit=True) as conn:
        conn.execute("DROP SCHEMA public CASCADE")
        conn.execute("CREATE SCHEMA public")
    migrate.run(URL)
    return URL


@pytest.fixture
def connect(db_url) -> Callable[[], psycopg.Connection]:
    def _connect() -> psycopg.Connection:
        conn = psycopg.connect(db_url, row_factory=dict_row)
        register_vector(conn)
        return conn

    return _connect


@pytest.fixture
def connect_listener(db_url) -> Callable[[], psycopg.Connection]:
    return lambda: psycopg.connect(db_url, autocommit=True, row_factory=dict_row)


@pytest.fixture
def conn(connect) -> Iterator[psycopg.Connection]:
    c = connect()
    yield c
    c.close()
