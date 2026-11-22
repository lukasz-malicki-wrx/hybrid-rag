from typing import Any

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from pydantic import TypeAdapter

from ..schemas.answer import AnswerEvent
from ..schemas.document import DocumentStatusEvent

# Event types sent over server-sent events. Streaming responses have no response_model, so the
# schemas are added to the OpenAPI components explicitly for client code generation.
STREAM_EVENTS: dict[str, Any] = {
    "AnswerEvent": AnswerEvent,
    "DocumentStatusEvent": DocumentStatusEvent,
}


def install_openapi(app: FastAPI) -> None:
    def build() -> dict:
        if app.openapi_schema:
            return app.openapi_schema
        schema = get_openapi(title=app.title, version=app.version, routes=app.routes)
        components = schema.setdefault("components", {}).setdefault("schemas", {})
        for name, event_type in STREAM_EVENTS.items():
            event_schema = TypeAdapter(event_type).json_schema(
                ref_template="#/components/schemas/{model}"
            )
            components.update(event_schema.pop("$defs", {}))
            components[name] = event_schema
        app.openapi_schema = schema
        return schema

    app.openapi = build  # type: ignore[method-assign]
