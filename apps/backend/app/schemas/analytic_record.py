from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


class AnalyticRecordCreate(BaseModel):
    event_time: datetime = Field(default_factory=now_utc)
    category: str = Field(min_length=2, max_length=80)
    metric_value: float = Field(ge=0)
    source: str = Field(default="manual", min_length=2, max_length=80)
    status: Literal["ok", "warning", "critical"] = "ok"
    notes: str | None = Field(default=None, max_length=1000)


class AnalyticRecordRead(BaseModel):
    id: str
    event_time: datetime
    category: str
    metric_value: float
    source: str
    status: str
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AnalyticsSummaryRead(BaseModel):
    period: str
    category: str
    total_records: int
    average_metric: float
    total_metric: float


class ExternalSummaryRead(BaseModel):
    source: str
    collected_at: datetime
    total_items: int
    average_value: float
    max_value: float
    min_value: float
