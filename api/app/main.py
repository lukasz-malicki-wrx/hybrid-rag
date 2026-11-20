from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.errors import register_error_handlers
from .api.openapi import install_openapi
from .api.routes import answers, audit, documents, health, search
from .core import migrate
from .core.config import get_settings


@asynccontextmanager
async def lifespan(_: FastAPI):
    migrate.run()
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="hybrid-rag", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(get_settings().cors_origins),
        allow_methods=["GET", "POST", "DELETE"],
        allow_headers=["content-type"],
    )
    for module in (health, documents, search, answers, audit):
        app.include_router(module.router)
    register_error_handlers(app)
    install_openapi(app)
    return app


app = create_app()
