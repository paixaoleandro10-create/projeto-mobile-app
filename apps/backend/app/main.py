from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import models as _models  # noqa: F401
from app.api.routes import analytics_router, health_router, ingestion_router, mobile_router
from app.core.config import get_settings
from app.core.database import Base, SessionLocal, engine
from app.services.mobile_seed import seed_mobile_data
from app.web.routes import router as web_router

settings = get_settings()
mobile_web_static_dir = Path(__file__).resolve().parent / "web" / "static" / "mobile-web"
web_static_dir = Path(__file__).resolve().parent / "web" / "static" / "web"
app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description=(
        "API inicial para projeto orientado a dados. "
        "Documentação interativa disponível em /docs e /redoc."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/mobile/static",
    StaticFiles(directory=str(mobile_web_static_dir)),
    name="mobile-static",
)
app.mount(
    "/mobile-web/static",
    StaticFiles(directory=str(mobile_web_static_dir)),
    name="mobile-web-static-legacy",
)
app.mount(
    "/web/static",
    StaticFiles(directory=str(web_static_dir)),
    name="web-static",
)


@app.on_event("startup")
def startup() -> None:
    if settings.auto_create_tables:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_mobile_data(db)
        finally:
            db.close()


@app.get("/", tags=["system"], summary="Informações do serviço")
def root() -> dict[str, str]:
    return {
        "service": settings.app_name,
        "docs": "/docs",
        "health": f"{settings.api_v1_prefix}/health",
    }


app.include_router(health_router, prefix=settings.api_v1_prefix)
app.include_router(analytics_router, prefix=settings.api_v1_prefix)
app.include_router(ingestion_router, prefix=settings.api_v1_prefix)
app.include_router(mobile_router, prefix=settings.api_v1_prefix)
app.include_router(web_router)


