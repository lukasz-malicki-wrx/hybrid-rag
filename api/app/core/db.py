from collections.abc import Iterator

import psycopg
from pgvector.psycopg import register_vector
from psycopg.rows import dict_row

from .config import get_settings


def connect() -> psycopg.Connection:
    conn = psycopg.connect(get_settings().database_url, row_factory=dict_row)
    register_vector(conn)
    return conn


def connect_listener() -> psycopg.Connection:
    """Autocommit connection for LISTEN: notifications only arrive outside a transaction."""
    return psycopg.connect(get_settings().database_url, autocommit=True, row_factory=dict_row)


def get_conn() -> Iterator[psycopg.Connection]:
    """Per-request connection. Services own commit; uncommitted work is rolled back on close."""
    conn = connect()
    try:
        yield conn
    finally:
        conn.close()
