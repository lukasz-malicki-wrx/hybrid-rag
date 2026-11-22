from collections.abc import Iterator
from pathlib import Path
from urllib.parse import quote
from uuid import UUID

from fastapi import APIRouter, Response, UploadFile
from fastapi.responses import StreamingResponse

from ...schemas.document import ChunkOut, DocumentOut, DocumentStatusEvent, UploadOut
from ..deps import DocumentServiceDep, SettingsDep, StatusStreamDep

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("", status_code=202, response_model=UploadOut)
def upload_document(
    file: UploadFile,
    response: Response,
    documents: DocumentServiceDep,
    settings: SettingsDep,
    group_id: UUID | None = None,
):
    """Store the original and queue it for ingestion (202), or return the existing duplicate
    (200). With group_id the document is also added to that group. Follow progress with
    GET /documents/{id}/events."""
    data = file.file.read(settings.max_upload_bytes + 1)
    result = documents.register_upload(Path(file.filename or "document.pdf").name, data, group_id)
    if not result.queued:
        response.status_code = 200
    return {**result.document, "duplicate": not result.queued}


@router.get("", response_model=list[DocumentOut])
def list_documents(
    documents: DocumentServiceDep, include_inactive: bool = False, group_id: UUID | None = None
):
    return documents.list(include_inactive, group_id)


@router.get("/{doc_id}", response_model=DocumentOut)
def get_document(doc_id: UUID, documents: DocumentServiceDep):
    return documents.get(doc_id)


@router.get("/{doc_id}/chunks", response_model=list[ChunkOut])
def document_chunks(doc_id: UUID, documents: DocumentServiceDep):
    """How the document was cut for search: its chunks in reading order, with page and length."""
    return documents.chunks(doc_id)


@router.get(
    "/{doc_id}/file",
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}, 404: {}},
)
def document_file(doc_id: UUID, documents: DocumentServiceDep):
    """The original PDF, unchanged. Append #page=N to open it at a cited page."""
    doc, data = documents.original(doc_id)
    return Response(
        data,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename*=UTF-8''{quote(doc['filename'])}",
            "Cache-Control": "private, max-age=3600",
        },
    )


def _sse(events: Iterator[DocumentStatusEvent | None]) -> Iterator[str]:
    for event in events:
        # A comment line keeps the connection alive and reveals a closed client.
        yield ": keep-alive\n\n" if event is None else f"data: {event.model_dump_json()}\n\n"


@router.get(
    "/{doc_id}/events",
    response_class=StreamingResponse,
    responses={
        200: {
            "description": "Server-sent events: the current status, then every change, until "
            "the document is ready or failed.",
            "content": {
                "text/event-stream": {
                    "schema": {"$ref": "#/components/schemas/DocumentStatusEvent"}
                }
            },
        },
        404: {"description": "Document not found"},
    },
)
def document_events(doc_id: UUID, documents: DocumentServiceDep, stream: StatusStreamDep):
    documents.get(doc_id)  # 404 before the stream starts
    return StreamingResponse(
        _sse(stream.follow(doc_id)),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.delete("/{doc_id}", response_model=DocumentOut)
def deactivate_document(doc_id: UUID, documents: DocumentServiceDep):
    return documents.deactivate(doc_id)
