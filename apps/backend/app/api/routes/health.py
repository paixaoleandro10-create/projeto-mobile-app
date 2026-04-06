from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_db

router = APIRouter(prefix="/health", tags=["health"])


@router.get(
    "",
    summary="Healthcheck da API",
    description="Retorna status do serviço e valida conectividade com o banco.",
)
def healthcheck(db: Session = Depends(get_db)) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {
        "status": "ok",
        "database": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
