import hashlib
import os

import pytest

from app.storage import LocalFileStore, StoredFileCorruptedError

DATA = b"%PDF-1.7 original"
SHA = hashlib.sha256(DATA).hexdigest()


def test_round_trip_is_content_addressed_and_read_only(tmp_path):
    store = LocalFileStore(tmp_path)
    store.save(SHA, DATA)
    path = tmp_path / SHA[:2] / f"{SHA}.pdf"
    assert path.read_bytes() == DATA
    assert oct(path.stat().st_mode & 0o777) == "0o440"
    assert store.read(SHA) == DATA
    assert not list(path.parent.glob("*.tmp"))


def test_saving_twice_is_a_no_op(tmp_path):
    store = LocalFileStore(tmp_path)
    store.save(SHA, DATA)
    store.save(SHA, DATA)
    assert store.exists(SHA)


def test_rejects_bytes_that_do_not_match_the_hash(tmp_path):
    with pytest.raises(ValueError, match="does not match"):
        LocalFileStore(tmp_path).save(SHA, b"other")


def test_detects_a_modified_original(tmp_path):
    store = LocalFileStore(tmp_path)
    store.save(SHA, DATA)
    path = tmp_path / SHA[:2] / f"{SHA}.pdf"
    os.chmod(path, 0o640)
    path.write_bytes(b"tampered")
    with pytest.raises(StoredFileCorruptedError):
        store.read(SHA)


def test_rejects_keys_that_could_escape_the_directory(tmp_path):
    with pytest.raises(ValueError, match="SHA-256"):
        LocalFileStore(tmp_path).read("../../etc/passwd")
