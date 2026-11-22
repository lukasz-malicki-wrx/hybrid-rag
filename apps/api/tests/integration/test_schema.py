import psycopg
import pytest

from app.core import migrate


def test_migrations_are_recorded_with_checksums_and_rerun_safely(db_url, conn):
    migrate.run(db_url)  # second run: nothing to apply, checksums still match
    rows = conn.execute("SELECT name, checksum FROM schema_migrations ORDER BY name").fetchall()
    assert [r["name"] for r in rows] == [m.name for m in migrate.load()]
    assert all(r["checksum"] for r in rows)


def test_answers_and_queries_are_append_only(conn):
    q = conn.execute(
        "INSERT INTO queries (question, document_ids) VALUES ('q', '{}') RETURNING id"
    ).fetchone()["id"]
    conn.execute(
        "INSERT INTO answers (query_id, answer, chunk_ids, corpus, embed_model, llm_provider, "
        "llm_model, prompt_version) VALUES (%s, 'a', '{}', '[]', 'e', 'p', 'm', 'v')",
        (q,),
    )
    conn.commit()
    with pytest.raises(psycopg.errors.RaiseException, match="answers is append-only"):
        conn.execute("UPDATE answers SET answer = 'changed'")
    conn.rollback()
    with pytest.raises(psycopg.errors.RaiseException, match="queries is append-only"):
        conn.execute("DELETE FROM queries")
    conn.rollback()


def test_audit_log_is_gone(conn):
    assert conn.execute("SELECT to_regclass('audit_log') AS t").fetchone()["t"] is None
