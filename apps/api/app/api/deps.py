from functools import lru_cache
from typing import Annotated

from fastapi import Depends
from psycopg import Connection

from ..core.config import Settings, get_settings
from ..core.db import connect, connect_listener, get_conn
from ..rag.embedding import Embedder, OllamaEmbedder
from ..rag.llm import LLMProvider, build_llm
from ..repositories.answer import FeedbackRepository
from ..repositories.chunk import ChunkRepository
from ..repositories.conversation import ConversationRepository
from ..repositories.document import DocumentRepository
from ..repositories.group import GroupRepository
from ..repositories.job import JobRepository
from ..repositories.settings import SettingsRepository
from ..services.answer import AnswerService
from ..services.conversation import ConversationService
from ..services.document import DocumentService
from ..services.document_events import DocumentStatusStream
from ..services.feedback import FeedbackService
from ..services.group import GroupService
from ..services.health import HealthService
from ..services.search import SearchService
from ..services.settings import SettingsService
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
        _store(),
        settings,
        GroupRepository(conn),
        ChunkRepository(conn),
    )


def get_group_service(conn: ConnDep) -> GroupService:
    return GroupService(
        conn,
        GroupRepository(conn),
        ConversationRepository(conn),
        DocumentRepository(conn),
    )


def get_conversation_service(conn: ConnDep) -> ConversationService:
    return ConversationService(
        conn,
        ConversationRepository(conn),
        GroupRepository(conn),
        ChunkRepository(conn),
        DocumentRepository(conn),
    )


def get_feedback_service(conn: ConnDep) -> FeedbackService:
    return FeedbackService(conn, FeedbackRepository(conn))


def get_settings_service(conn: ConnDep) -> SettingsService:
    return SettingsService(conn, SettingsRepository(conn))


def get_status_stream() -> DocumentStatusStream:
    return DocumentStatusStream(connect_listener)


def get_search_service(conn: ConnDep) -> SearchService:
    return SearchService(ChunkRepository(conn), _embedder(), get_settings().max_vector_distance)


def get_answer_service(settings: SettingsDep) -> AnswerService:
    return AnswerService(
        _llm(), connect, settings.embed_model, settings.llm_num_ctx, settings.llm_max_tokens
    )


def get_health_service(settings: SettingsDep) -> HealthService:
    return HealthService(settings)


DocumentServiceDep = Annotated[DocumentService, Depends(get_document_service)]
GroupServiceDep = Annotated[GroupService, Depends(get_group_service)]
ConversationServiceDep = Annotated[ConversationService, Depends(get_conversation_service)]
FeedbackServiceDep = Annotated[FeedbackService, Depends(get_feedback_service)]
SettingsServiceDep = Annotated[SettingsService, Depends(get_settings_service)]
StatusStreamDep = Annotated[DocumentStatusStream, Depends(get_status_stream)]
SearchServiceDep = Annotated[SearchService, Depends(get_search_service)]
AnswerServiceDep = Annotated[AnswerService, Depends(get_answer_service)]
HealthServiceDep = Annotated[HealthService, Depends(get_health_service)]
