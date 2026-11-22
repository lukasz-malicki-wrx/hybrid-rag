from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from ..core.errors import (
    ConflictError,
    DomainError,
    NotFoundError,
    PayloadTooLargeError,
    UnsupportedMediaError,
)

_STATUS: dict[type[DomainError], int] = {
    NotFoundError: 404,
    ConflictError: 409,
    PayloadTooLargeError: 413,
    UnsupportedMediaError: 415,
}


def status_for(exc: DomainError) -> int:
    """HTTP status for a domain error; subclasses inherit their parent's status."""
    for cls in type(exc).__mro__:
        if cls in _STATUS:
            return _STATUS[cls]
    return 400


def register_error_handlers(app: FastAPI) -> None:
    async def handle(_: Request, exc: DomainError) -> JSONResponse:
        return JSONResponse({"detail": str(exc)}, status_code=status_for(exc))

    app.add_exception_handler(DomainError, handle)
