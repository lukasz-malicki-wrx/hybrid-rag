from abc import ABC, abstractmethod


class StoredFileCorruptedError(RuntimeError):
    """The stored bytes no longer match the SHA-256 they were saved under."""


class FileStore(ABC):
    """Content-addressed storage for original uploaded files (key = SHA-256 of the bytes)."""

    @abstractmethod
    def save(self, sha256: str, data: bytes) -> None:
        """Store the bytes once; saving the same content again is a no-op."""

    @abstractmethod
    def read(self, sha256: str) -> bytes:
        """Return the original bytes, verified against their hash."""

    @abstractmethod
    def exists(self, sha256: str) -> bool: ...
