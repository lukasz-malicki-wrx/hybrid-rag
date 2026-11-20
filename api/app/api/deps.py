from functools import lru_cache
from typing import Annotated

from fastapi import Depends
from psycopg import Connection

from ..core.config import Settings, get_settings
from ..core.db import connect, connect_listener, get_conn
from ..rag.embedding import Embedder, OllamaEmbedder
from ..rag.llm import LLMProvider, build_llm
from ..repositories.audit import AuditRepository
from ..repositories.chunk import ChunkRepository
from ..repositories.document import DocumentRepository
from ..repositories.job import JobRepository
from ..services.answer import AnswerService
from ..services.audit import AuditService
from ..services.document import DocumentService
from ..services.document_events import DocumentStatusStream
from ..services.health import HealthService
from ..services.search import SearchService
from ..storage import FileStore, LocalFileStore

SettingsDep = Annotated[Settings, Depends(get_settings)]
ConnDep = Annotated[Connection, Depends(get_conn)]


@lru_cache
def _embedder() -> Embedder:
    s = get_settings()
    return OllamaEmbedder(s.ollama_url, s.embed_model, s.embed_dim)


@lru_cache
def _llm() -> LLMProvider:
    return build_llm(get_settings())


@lru_cache
def _store() -> FileStore:
    return LocalFileStore(get_settings().upload_dir)


def get_document_service(conn: ConnDep, settings: SettingsDep) -> DocumentService:
    return DocumentService(
        conn,
        DocumentRepository(conn),
        JobRepository(conn),
        AuditRepository(conn),
        _store(),
        settings,
    )


def get_status_stream() -> DocumentStatusStream:
    return DocumentStatusStream(connect_listener)


def get_search_service(conn: ConnDep) -> SearchService:
    return SearchService(ChunkRepository(conn), _embedder(), get_settings().max_vector_distance)


def get_answer_service(settings: SettingsDep) -> AnswerService:
    return AnswerService(
        _llm(), connect, settings.embed_model, settings.llm_num_ctx, settings.llm_max_tokens
    )


def get_audit_service(conn: ConnDep) -> AuditService:
    return AuditService(AuditRepository(conn))


def get_health_service(settings: SettingsDep) -> HealthService:
    return HealthService(settings)


DocumentServiceDep = Annotated[DocumentService, Depends(get_document_service)]
StatusStreamDep = Annotated[DocumentStatusStream, Depends(get_status_stream)]
SearchServiceDep = Annotated[SearchService, Depends(get_search_service)]
AnswerServiceDep = Annotated[AnswerService, Depends(get_answer_service)]
AuditServiceDep = Annotated[AuditService, Depends(get_audit_service)]
HealthServiceDep = Annotated[HealthService, Depends(get_health_service)]
