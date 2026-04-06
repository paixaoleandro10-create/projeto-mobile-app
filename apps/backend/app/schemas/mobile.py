from typing import Literal

from pydantic import BaseModel, Field


class MobileDashboardOverviewRead(BaseModel):
    weighted_gpa: str
    progress_percent: int = Field(ge=0, le=100)
    class_rank: str


class MobileDashboardTaskRead(BaseModel):
    id: str
    title: str
    subtitle: str
    progress: int | None = Field(default=None, ge=0, le=100)
    priority: Literal["high"] | None = None


class MobilePerformanceRead(BaseModel):
    id: str
    subject: str
    detail: str
    score: str
    delta: str
    gradeLabel: str
    tone: Literal["primary", "secondary"]


class MobileDashboardRead(BaseModel):
    overview: MobileDashboardOverviewRead
    tasks: list[MobileDashboardTaskRead]
    performance: list[MobilePerformanceRead]


class MobileSubjectRead(BaseModel):
    id: str
    subject: str
    teacher: str
    grade: str
    average: int = Field(ge=0, le=100)
    accent: Literal["primary", "tertiary"]
    students: int = Field(ge=0)


class MobileSubjectsRead(BaseModel):
    subjects: list[MobileSubjectRead]


class MobileScheduleEventRead(BaseModel):
    id: str
    day: int = Field(ge=1, le=31)
    time: str
    meridiem: Literal["AM", "PM"]
    title: str
    place: str
    detail: str
    priority: Literal["high", "normal"]


class MobileScheduleRead(BaseModel):
    month_label: str
    default_day: int = Field(ge=1, le=31)
    events: list[MobileScheduleEventRead]


class MobileReportStudentRead(BaseModel):
    name: str
    class_name: str
    student_id: str


class MobileReportSummaryRead(BaseModel):
    overall: str
    status: str


class MobileReportLineRead(BaseModel):
    id: str
    subject: str
    terms: tuple[str, str, str, str]
    average: str
    status: Literal["Approved", "In Progress", "Exam"]


class MobileReportRead(BaseModel):
    student: MobileReportStudentRead
    summary: MobileReportSummaryRead
    lines: list[MobileReportLineRead]


class MobileTelemetryCreate(BaseModel):
    event: Literal["fallback_used", "contract_error", "query_error"]
    screen: Literal["dashboard", "subjects", "schedule", "report"] | None = None
    reason: str | None = Field(default=None, max_length=200)
