"""Applies SQL migrations in file-name order and refuses to start if an applied file changed."""

import hashlib
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path

import psycopg

from .config import get_settings

MIGRATIONS_DIR = Path(__file__).resolve().parents[2] / "migrations"
LOCK_ID = 727274


class MigrationError(RuntimeError):
    pass


@dataclass(frozen=True)
class Migration:
    name: str
    sql: str
    checksum: str


def checksum(sql: str) -> str:
    # Normalise line endings so a checkout on Windows does not look like a modified migration.
    return hashlib.sha256(sql.replace("\r\n", "\n").encode()).hexdigest()


def load(directory: Path = MIGRATIONS_DIR) -> list[Migration]:
    return [
        Migration(p.name, sql, checksum(sql))
        for p in sorted(directory.glob("*.sql"))
        for sql in [p.read_text()]
    ]


def plan(
    migrations: Sequence[Migration], applied: Mapping[str, str | None]
) -> tuple[list[Migration], list[Migration]]:
    """Return (to_apply, to_backfill).

    to_backfill are applied migrations recorded before checksums existed. A recorded checksum
    that differs from the file means an applied migration was edited: that is a change-control
    violation, so it raises instead of silently continuing.
    """
    to_apply: list[Migration] = []
    to_backfill: list[Migration] = []
    for m in migrations:
        if m.name not in applied:
            to_apply.append(m)
        elif applied[m.name] is None:
            to_backfill.append(m)
        elif applied[m.name] != m.checksum:
            raise MigrationError(
                f"migration {m.name} was modified after it was applied; "
                "add a new migration instead of editing an applied one"
            )
    return to_apply, to_backfill


def run(database_url: str | None = None) -> None:
    with psycopg.connect(database_url or get_settings().database_url, autocommit=True) as conn:
        conn.execute("SELECT pg_advisory_lock(%s)", (LOCK_ID,))
        try:
            conn.execute(
                "CREATE TABLE IF NOT EXISTS schema_migrations ("
                "name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())"
            )
            conn.execute("ALTER TABLE schema_migrations ADD COLUMN IF NOT EXISTS checksum text")
            applied = dict(conn.execute("SELECT name, checksum FROM schema_migrations").fetchall())
            to_apply, to_backfill = plan(load(), applied)
            for m in to_backfill:
                conn.execute(
                    "UPDATE schema_migrations SET checksum = %s WHERE name = %s",
                    (m.checksum, m.name),
                )
            for m in to_apply:
                with conn.transaction():
                    conn.execute(m.sql)
                    conn.execute(
                        "INSERT INTO schema_migrations (name, checksum) VALUES (%s, %s)",
                        (m.name, m.checksum),
                    )
        finally:
            conn.execute("SELECT pg_advisory_unlock(%s)", (LOCK_ID,))
