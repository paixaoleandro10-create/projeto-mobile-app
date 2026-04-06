from app.api.routes.analytics import router as analytics_router
from app.api.routes.health import router as health_router
from app.api.routes.ingestion import router as ingestion_router
from app.api.routes.mobile import router as mobile_router

__all__ = ["analytics_router", "health_router", "ingestion_router", "mobile_router"]
