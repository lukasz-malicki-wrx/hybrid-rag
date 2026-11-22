class DomainError(Exception):
    """Base class for errors raised by services; mapped to HTTP in the api layer."""


class NotFoundError(DomainError):
    pass


class ConflictError(DomainError):
    pass


class PayloadTooLargeError(DomainError):
    pass


class UnsupportedMediaError(DomainError):
    pass
