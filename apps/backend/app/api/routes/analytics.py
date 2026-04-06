from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas import AnalyticRecordCreate, AnalyticRecordRead, AnalyticsSummaryRead, ExternalSummaryRead
from app.services import create_record, list_records, summarize_external_metrics, summarize_records

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post(
    "/records",
    response_model=AnalyticRecordRead,
    status_code=status.HTTP_201_CREATED,
    summary="Cria novo registro analítico",
)
def create_analytic_record(
    payload: AnalyticRecordCreate,
    db: Session = Depends(get_db),
) -> AnalyticRecordRead:
    record = create_record(db, payload)
    return AnalyticRecordRead.model_validate(record)


@router.get(
    "/records",
    response_model=list[AnalyticRecordRead],
    summary="Lista registros analíticos",
)
def get_analytic_records(
    limit: int = Query(default=100, ge=1, le=1000),
    category: str | None = Query(default=None, min_length=2, max_length=80),
    db: Session = Depends(get_db),
) -> list[AnalyticRecordRead]:
    records = list_records(db=db, limit=limit, category=category)
    return [AnalyticRecordRead.model_validate(item) for item in records]


@router.get(
    "/summary",
    response_model=list[AnalyticsSummaryRead],
    summary="Resumo analítico por categoria e período",
    description="Agrega dados por dia, mês ou ano para alimentar dashboards e relatórios.",
)
def get_analytics_summary(
    period: str = Query(default="day", pattern="^(day|month|year)$"),
    db: Session = Depends(get_db),
) -> list[AnalyticsSummaryRead]:
    try:
        return summarize_records(db=db, period=period)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get(
    "/external-summary",
    response_model=ExternalSummaryRead,
    summary="Consome ou simula dados externos para análise",
)
async def get_external_summary(
    simulate: bool = Query(
        default=True,
        description="Quando true, usa payload simulado para análise sem dependência externa.",
    ),
) -> ExternalSummaryRead:
    return await summarize_external_metrics(simulate=simulate)
