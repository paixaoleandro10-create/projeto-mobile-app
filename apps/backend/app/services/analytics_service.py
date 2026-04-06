from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.analytic_record import AnalyticRecord
from app.schemas.analytic_record import AnalyticRecordCreate, AnalyticsSummaryRead

SQLITE_PERIOD_MAP = {
    "day": "%Y-%m-%d",
    "month": "%Y-%m",
    "year": "%Y",
}


def create_record(db: Session, payload: AnalyticRecordCreate) -> AnalyticRecord:
    record = AnalyticRecord(
        event_time=payload.event_time,
        category=payload.category,
        metric_value=payload.metric_value,
        source=payload.source,
        status=payload.status,
        notes=payload.notes,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def list_records(
    db: Session,
    limit: int = 100,
    category: str | None = None,
) -> list[AnalyticRecord]:
    query = db.query(AnalyticRecord).order_by(AnalyticRecord.event_time.desc())
    if category:
        query = query.filter(AnalyticRecord.category == category)
    return query.limit(limit).all()


def summarize_records(db: Session, period: str = "day") -> list[AnalyticsSummaryRead]:
    if period not in {"day", "month", "year"}:
        raise ValueError("Invalid period. Expected one of: day, month, year.")

    if db.bind is not None:
        dialect = db.bind.dialect.name
    else:
        settings = get_settings()
        dialect = "sqlite" if settings.database_url.startswith("sqlite") else "postgresql"
    if dialect == "sqlite":
        period_expr = func.strftime(SQLITE_PERIOD_MAP[period], AnalyticRecord.event_time)
    else:
        period_expr = func.date_trunc(period, AnalyticRecord.event_time)

    rows = (
        db.query(
            period_expr.label("period"),
            AnalyticRecord.category.label("category"),
            func.count(AnalyticRecord.id).label("total_records"),
            func.avg(AnalyticRecord.metric_value).label("average_metric"),
            func.sum(AnalyticRecord.metric_value).label("total_metric"),
        )
        .group_by(period_expr, AnalyticRecord.category)
        .order_by(period_expr.asc(), AnalyticRecord.category.asc())
        .all()
    )

    return [
        AnalyticsSummaryRead(
            period=str(row.period),
            category=row.category,
            total_records=int(row.total_records),
            average_metric=float(row.average_metric or 0),
            total_metric=float(row.total_metric or 0),
        )
        for row in rows
    ]
