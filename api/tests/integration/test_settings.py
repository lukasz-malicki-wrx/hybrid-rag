from app.repositories.settings import SettingsRepository
from app.services.settings import SettingsService


def service(conn) -> SettingsService:
    return SettingsService(conn, SettingsRepository(conn))


def test_personal_context_is_a_single_value(conn):
    svc = service(conn)
    svc.update("  Answer in Polish.  ")
    assert svc.personal_context() == "Answer in Polish."
    svc.update("Answer briefly.")
    assert svc.get()["personal_context"] == "Answer briefly."
    assert conn.execute("SELECT count(*) AS n FROM user_settings").fetchone()["n"] == 1


def test_clearing_turns_it_off(conn):
    svc = service(conn)
    svc.update("Something")
    svc.update("")
    assert svc.personal_context() == ""
