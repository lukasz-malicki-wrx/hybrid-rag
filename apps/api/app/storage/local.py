import hashlib
import os
import re
import uuid
from pathlib import Path

from .base import FileStore, StoredFileCorruptedError

_SHA256 = re.compile(r"[0-9a-f]{64}")


class LocalFileStore(FileStore):
    """Originals on a local directory (a Docker volume), sharded by the first two hex digits.

    Files are written atomically (temp file + rename) and made read-only: an original is never
    changed after upload, and every read checks it still matches its hash.
    """

    def __init__(self, root: str | Path) -> None:
        self._root = Path(root)

    def _path(self, sha256: str) -> Path:
        if not _SHA256.fullmatch(sha256):
            raise ValueError("not a SHA-256 hex digest")
        return self._root / sha256[:2] / f"{sha256}.pdf"

    def exists(self, sha256: str) -> bool:
        return self._path(sha256).is_file()

    def save(self, sha256: str, data: bytes) -> None:
        path = self._path(sha256)
        if path.is_file():
            return
        if hashlib.sha256(data).hexdigest() != sha256:
            raise ValueError("data does not match the given SHA-256")
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_name(f".{path.name}.{uuid.uuid4().hex}.tmp")
        with open(tmp, "wb") as fh:
            fh.write(data)
            fh.flush()
            os.fsync(fh.fileno())
        os.chmod(tmp, 0o440)
        os.replace(tmp, path)

    def read(self, sha256: str) -> bytes:
        data = self._path(sha256).read_bytes()
        if hashlib.sha256(data).hexdigest() != sha256:
            raise StoredFileCorruptedError(f"stored file {sha256} does not match its hash")
        return data
