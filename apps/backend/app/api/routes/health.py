from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.deps import get_db

router = APIRouter(prefix="/health", tags=["health"])


@router.get(
    "",
    summary="Healthcheck da API",
    description="Retorna status do serviço e valida conectividade com o banco.",
)
def healthcheck(db: Session = Depends(get_db)) -> dict[str, str]:
    timestamp = datetime.now(UTC).isoformat()
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        return JSONResponse(
            status_code=200,
            content={
                "status": "degraded",
                "database": "unavailable",
                "timestamp": timestamp,
                "detail": exc.__class__.__name__,
            },
        )

    return {"status": "ok", "database": "ok", "timestamp": timestamp}


@router.get(
    "/ready",
    summary="Readiness da API",
    description="Retorna 200 quando banco estÃ¡ pronto para atender requests.",
)
def readiness(db: Session = Depends(get_db)) -> dict[str, str]:
    timestamp = datetime.now(UTC).isoformat()
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        return JSONResponse(
            status_code=503,
            content={
                "status": "not_ready",
                "database": "unavailable",
                "timestamp": timestamp,
                "detail": exc.__class__.__name__,
            },
        )

    return {"status": "ready", "database": "ok", "timestamp": timestamp}
