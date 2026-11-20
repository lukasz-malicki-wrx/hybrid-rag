import pytest

from app.core.migrate import Migration, MigrationError, checksum, load, plan


def mig(name, sql="SELECT 1;"):
    return Migration(name, sql, checksum(sql))


def test_new_migrations_are_applied_in_order():
    to_apply, backfill = plan([mig("001.sql"), mig("002.sql")], {})
    assert [m.name for m in to_apply] == ["001.sql", "002.sql"]
    assert backfill == []


def test_applied_with_matching_checksum_is_skipped():
    m = mig("001.sql")
    assert plan([m], {"001.sql": m.checksum}) == ([], [])


def test_legacy_rows_without_checksum_are_backfilled():
    m = mig("001.sql")
    assert plan([m], {"001.sql": None}) == ([], [m])


def test_edited_applied_migration_is_refused():
    with pytest.raises(MigrationError, match="001.sql was modified"):
        plan([mig("001.sql", "SELECT 2;")], {"001.sql": checksum("SELECT 1;")})


def test_checksum_ignores_windows_line_endings():
    assert checksum("A;\r\nB;\r\n") == checksum("A;\nB;\n")


def test_repository_migrations_load_in_name_order():
    names = [m.name for m in load()]
    assert names == sorted(names)
    assert names[:2] == ["001_init.sql", "002_gxp_hardening.sql"]
