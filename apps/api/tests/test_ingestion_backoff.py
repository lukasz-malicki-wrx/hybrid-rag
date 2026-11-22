from app.services.ingestion import retry_delay_seconds


def test_backoff_grows_and_is_capped():
    assert [retry_delay_seconds(a) for a in (1, 2, 3)] == [30, 120, 480]
    assert retry_delay_seconds(10) == 3600
