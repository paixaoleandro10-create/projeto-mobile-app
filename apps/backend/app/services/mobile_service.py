import logging
from collections import defaultdict
from datetime import UTC, datetime

from pydantic import ValidationError
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload

from app.models import MobileEvent, ReportGrade, Student, Subject
from app.schemas.mobile import (
    MobileDashboardOverviewRead,
    MobileDashboardRead,
    MobileDashboardTaskRead,
    MobilePerformanceRead,
    MobileReportLineRead,
    MobileReportRead,
    MobileReportStudentRead,
    MobileReportSummaryRead,
    MobileScheduleEventRead,
    MobileScheduleRead,
    MobileSubjectRead,
    MobileSubjectsRead,
)

logger = logging.getLogger(__name__)


def _grade_label(score: float | None) -> str:
    if score is None:
        return "N/A"
    if score >= 9:
        return "A+"
    if score >= 8:
        return "A"
    if score >= 7:
        return "B+"
    if score >= 6:
        return "B"
    if score >= 5:
        return "C"
    return "D"


def _status_from_scores(scores: list[float | None]) -> str:
    valid_scores = [score for score in scores if score is not None]
    if not valid_scores:
        return "In Progress"
    if any(score is None for score in scores):
        return "In Progress"
    average = sum(valid_scores) / len(valid_scores)
    if average >= 7:
        return "Approved"
    if average >= 5:
        return "Exam"
    return "Exam"


def _default_dashboard() -> MobileDashboardRead:
    return MobileDashboardRead(
        overview=MobileDashboardOverviewRead(
            weighted_gpa="0.00",
            progress_percent=0,
            class_rank="No ranking data",
        ),
        tasks=[],
        performance=[],
    )


def _default_subjects() -> MobileSubjectsRead:
    return MobileSubjectsRead(subjects=[])


def _default_schedule() -> MobileScheduleRead:
    today = datetime.now(UTC)
    return MobileScheduleRead(
        month_label="No scheduled events",
        default_day=today.day,
        events=[],
    )


def _default_report() -> MobileReportRead:
    return MobileReportRead(
        student=MobileReportStudentRead(name="No student", class_name="-", student_id="-"),
        summary=MobileReportSummaryRead(overall="0.0", status="In Progress"),
        lines=[],
    )


def _safe_build(operation: str, builder, fallback):
    try:
        return builder()
    except ValidationError as exc:
        logger.error("mobile_contract_error operation=%s detail=%s", operation, exc)
    except SQLAlchemyError as exc:
        logger.exception("mobile_query_error operation=%s detail=%s", operation, exc)
    except Exception as exc:  # pragma: no cover
        logger.exception("mobile_unexpected_error operation=%s detail=%s", operation, exc)
    return fallback


def _get_primary_student(db: Session) -> Student | None:
    student = db.query(Student).filter(Student.is_primary.is_(True)).first()
    if student:
        return student
    return db.query(Student).order_by(Student.created_at.asc()).first()


def get_mobile_dashboard(db: Session) -> MobileDashboardRead:
    def _builder() -> MobileDashboardRead:
        student = _get_primary_student(db)
        if not student:
            return _default_dashboard()

        student_scores = (
            db.query(ReportGrade.score)
            .filter(ReportGrade.student_id == student.id, ReportGrade.score.is_not(None))
            .all()
        )
        score_values = [float(score) for (score,) in student_scores]
        average_score = sum(score_values) / len(score_values) if score_values else 0.0
        weighted_gpa = f"{average_score * 0.4:.2f}"

        total_rows = (
            db.query(func.count(ReportGrade.id))
            .filter(ReportGrade.student_id == student.id)
            .scalar()
            or 0
        )
        completed_rows = (
            db.query(func.count(ReportGrade.id))
            .filter(ReportGrade.student_id == student.id, ReportGrade.score.is_not(None))
            .scalar()
            or 0
        )
        progress_percent = int((completed_rows / total_rows) * 100) if total_rows else 0

        avg_by_student = (
            db.query(
                ReportGrade.student_id,
                func.avg(ReportGrade.score).label("avg_score"),
            )
            .filter(ReportGrade.score.is_not(None))
            .group_by(ReportGrade.student_id)
            .all()
        )
        sorted_students = sorted(
            avg_by_student,
            key=lambda row: float(row.avg_score or 0),
            reverse=True,
        )
        rank_position = next(
            (
                index
                for index, row in enumerate(sorted_students, start=1)
                if row.student_id == student.id
            ),
            1,
        )
        class_rank = (
            f"{rank_position} of {len(sorted_students)}"
            if sorted_students
            else "No ranking data"
        )

        task_events = (
            db.query(MobileEvent)
            .options(joinedload(MobileEvent.subject))
            .filter(MobileEvent.student_id == student.id)
            .order_by(MobileEvent.event_at.asc())
            .limit(3)
            .all()
        )
        tasks = [
            MobileDashboardTaskRead(
                id=event.id,
                title=event.title,
                subtitle=(
                    f"{event.event_at.strftime('%d %b %Y')} - "
                    f"{event.subject.name if event.subject else event.place}"
                ),
                progress=event.progress_percent,
                priority="high" if event.priority == "high" else None,
            )
            for event in task_events
        ]

        recent_scores = (
            db.query(ReportGrade)
            .options(joinedload(ReportGrade.subject))
            .filter(ReportGrade.student_id == student.id, ReportGrade.score.is_not(None))
            .order_by(ReportGrade.updated_at.desc())
            .limit(3)
            .all()
        )
        performance = []
        for grade in recent_scores:
            subject_average = (
                db.query(func.avg(ReportGrade.score))
                .filter(ReportGrade.subject_id == grade.subject_id, ReportGrade.score.is_not(None))
                .scalar()
            )
            score_value = float(grade.score or 0)
            average_value = float(subject_average or 0)
            delta = score_value - average_value
            performance.append(
                MobilePerformanceRead(
                    id=grade.id,
                    subject=grade.subject.name if grade.subject else "Unknown subject",
                    detail=f"Term {grade.term} grade",
                    score=f"{score_value:.1f}/{grade.max_score:.1f}",
                    delta=f"{delta:+.1f} pts vs avg",
                    gradeLabel=_grade_label(score_value),
                    tone="primary" if score_value >= 8 else "secondary",
                )
            )

        return MobileDashboardRead(
            overview=MobileDashboardOverviewRead(
                weighted_gpa=weighted_gpa,
                progress_percent=progress_percent,
                class_rank=class_rank,
            ),
            tasks=tasks,
            performance=performance,
        )

    return _safe_build("dashboard", _builder, _default_dashboard())


def get_mobile_subjects(db: Session) -> MobileSubjectsRead:
    def _builder() -> MobileSubjectsRead:
        student = _get_primary_student(db)
        if not student:
            return _default_subjects()

        student_subjects = (
            db.query(Subject)
            .join(ReportGrade, ReportGrade.subject_id == Subject.id)
            .filter(ReportGrade.student_id == student.id)
            .group_by(Subject.id)
            .order_by(Subject.name.asc())
            .all()
        )

        subject_cards = []
        for subject in student_subjects:
            score_rows = (
                db.query(ReportGrade.score)
                .filter(
                    ReportGrade.student_id == student.id,
                    ReportGrade.subject_id == subject.id,
                    ReportGrade.score.is_not(None),
                )
                .all()
            )
            score_values = [float(score) for (score,) in score_rows]
            average = int(round(sum(score_values) / len(score_values) * 10)) if score_values else 0
            grade = _grade_label(sum(score_values) / len(score_values) if score_values else None)

            students_count = (
                db.query(func.count(func.distinct(ReportGrade.student_id)))
                .filter(ReportGrade.subject_id == subject.id, ReportGrade.score.is_not(None))
                .scalar()
                or 0
            )

            subject_cards.append(
                MobileSubjectRead(
                    id=subject.id,
                    subject=subject.name,
                    teacher=subject.teacher_name,
                    grade=grade,
                    average=max(0, min(100, average)),
                    accent="primary" if subject.accent == "primary" else "tertiary",
                    students=int(students_count),
                )
            )

        return MobileSubjectsRead(subjects=subject_cards)

    return _safe_build("subjects", _builder, _default_subjects())


def get_mobile_schedule(db: Session) -> MobileScheduleRead:
    def _builder() -> MobileScheduleRead:
        student = _get_primary_student(db)
        if not student:
            return _default_schedule()

        events = (
            db.query(MobileEvent)
            .filter(MobileEvent.student_id == student.id)
            .order_by(MobileEvent.event_at.asc())
            .all()
        )
        if not events:
            return _default_schedule()

        first_event = events[0]
        month_label = first_event.event_at.strftime("%B %Y")
        default_day = first_event.event_at.day

        serialized_events = [
            MobileScheduleEventRead(
                id=event.id,
                day=event.event_at.day,
                time=event.event_at.strftime("%I:%M"),
                meridiem=event.event_at.strftime("%p"),
                title=event.title,
                place=event.place,
                detail=event.detail,
                priority="high" if event.priority == "high" else "normal",
            )
            for event in events
        ]

        return MobileScheduleRead(
            month_label=month_label,
            default_day=default_day,
            events=serialized_events,
        )

    return _safe_build("schedule", _builder, _default_schedule())


def get_mobile_report(db: Session) -> MobileReportRead:
    def _builder() -> MobileReportRead:
        student = _get_primary_student(db)
        if not student:
            return _default_report()

        grades = (
            db.query(ReportGrade)
            .options(joinedload(ReportGrade.subject))
            .filter(ReportGrade.student_id == student.id)
            .order_by(ReportGrade.subject_id.asc(), ReportGrade.term.asc())
            .all()
        )
        if not grades:
            return _default_report()

        grouped: dict[str, list[ReportGrade]] = defaultdict(list)
        for grade in grades:
            grouped[grade.subject_id].append(grade)

        lines: list[MobileReportLineRead] = []
        line_averages: list[float] = []
        for subject_id, rows in grouped.items():
            rows_by_term = {row.term: row for row in rows}
            term_scores: list[float | None] = [
                rows_by_term.get(term).score if rows_by_term.get(term) else None
                for term in range(1, 5)
            ]
            term_labels = tuple("-" if score is None else f"{score:.1f}" for score in term_scores)
            valid_scores = [float(score) for score in term_scores if score is not None]
            average = sum(valid_scores) / len(valid_scores) if valid_scores else 0.0
            line_averages.append(average)
            status = _status_from_scores(term_scores)
            subject_name = rows[0].subject.name if rows[0].subject else "Unknown subject"

            lines.append(
                MobileReportLineRead(
                    id=subject_id,
                    subject=subject_name,
                    terms=term_labels,
                    average=f"{average:.1f}",
                    status=status,
                )
            )

        overall = sum(line_averages) / len(line_averages) if line_averages else 0.0
        summary_status = "Approved" if overall >= 7 else "Exam"

        return MobileReportRead(
            student=MobileReportStudentRead(
                name=student.full_name,
                class_name=student.class_name,
                student_id=student.external_student_id,
            ),
            summary=MobileReportSummaryRead(
                overall=f"{overall:.1f}",
                status=summary_status,
            ),
            lines=sorted(lines, key=lambda line: line.subject),
        )

    return _safe_build("report", _builder, _default_report())
