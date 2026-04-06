import logging

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.mobile import (
    MobileDashboardRead,
    MobileReportRead,
    MobileScheduleRead,
    MobileSubjectsRead,
    MobileTelemetryCreate,
)
from app.services.mobile_service import (
    get_mobile_dashboard,
    get_mobile_report,
    get_mobile_schedule,
    get_mobile_subjects,
)

router = APIRouter(prefix="/mobile", tags=["mobile"])
logger = logging.getLogger(__name__)


@router.get(
    "/dashboard",
    response_model=MobileDashboardRead,
    summary="Dados do dashboard mobile",
    description="Entrega visão geral de performance, tarefas e itens recentes.",
)
def mobile_dashboard(
    db: Session = Depends(get_db),
) -> MobileDashboardRead:
    return get_mobile_dashboard(db)


@router.get(
    "/subjects",
    response_model=MobileSubjectsRead,
    summary="Dados da tela de materias mobile",
    description="Entrega lista de materias e indicadores para cards.",
)
def mobile_subjects(
    db: Session = Depends(get_db),
) -> MobileSubjectsRead:
    return get_mobile_subjects(db)


@router.get(
    "/schedule",
    response_model=MobileScheduleRead,
    summary="Dados da agenda mobile",
    description="Entrega mes de referencia, dia selecionado e eventos associados.",
)
def mobile_schedule(
    db: Session = Depends(get_db),
) -> MobileScheduleRead:
    return get_mobile_schedule(db)


@router.get(
    "/report",
    response_model=MobileReportRead,
    summary="Dados da tela de boletim mobile",
    description="Entrega dados do estudante, resumo e linhas de notas para renderizacao da tabela.",
)
def mobile_report(
    db: Session = Depends(get_db),
) -> MobileReportRead:
    return get_mobile_report(db)


@router.post(
    "/telemetry",
    status_code=status.HTTP_202_ACCEPTED,
    summary="Registra telemetria do cliente mobile-web",
    description=(
        "Registra eventos de fallback, erro de contrato "
        "ou erro de query reportado pelo cliente."
    ),
)
def mobile_telemetry(payload: MobileTelemetryCreate) -> Response:
    if payload.event == "fallback_used":
        logger.warning(
            "mobile_fallback_used screen=%s reason=%s",
            payload.screen or "unknown",
            payload.reason or "no reason",
        )
    elif payload.event == "contract_error":
        logger.error(
            "mobile_contract_error_reported screen=%s reason=%s",
            payload.screen or "unknown",
            payload.reason or "no reason",
        )
    else:
        logger.error(
            "mobile_query_error_reported screen=%s reason=%s",
            payload.screen or "unknown",
            payload.reason or "no reason",
        )
    return Response(status_code=status.HTTP_202_ACCEPTED)
