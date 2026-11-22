from app.api.errors import status_for
from app.core.errors import ConflictError, DomainError, NotFoundError


class MissingChunk(NotFoundError):
    pass


def test_known_errors_map_to_status():
    assert status_for(NotFoundError("x")) == 404
    assert status_for(ConflictError("x")) == 409


def test_subclass_inherits_parent_status():
    assert status_for(MissingChunk("x")) == 404


def test_unknown_domain_error_is_400():
    assert status_for(DomainError("x")) == 400
