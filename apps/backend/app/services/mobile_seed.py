from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.models import MobileEvent, ReportGrade, Student, Subject


def _dt(year: int, month: int, day: int, hour: int, minute: int) -> datetime:
    return datetime(year, month, day, hour, minute, tzinfo=UTC)


def seed_mobile_data(db: Session) -> None:
    if db.query(Student).count() > 0:
        return

    students = [
        Student(
            full_name="Gabriel Silva",
            class_name="Senior year",
            external_student_id="402839-2",
            is_primary=True,
        ),
        Student(full_name="Ana Martins", class_name="Senior year", external_student_id="402839-3"),
        Student(full_name="Bruno Costa", class_name="Senior year", external_student_id="402839-4"),
        Student(full_name="Carla Souza", class_name="Senior year", external_student_id="402839-5"),
    ]
    db.add_all(students)
    db.flush()

    subjects = [
        Subject(name="Mathematics", teacher_name="Prof. Alan Turing", accent="primary"),
        Subject(name="Physics", teacher_name="Dr. Marie Curie", accent="tertiary"),
        Subject(name="Biology", teacher_name="Dr. Rosalind Franklin", accent="primary"),
        Subject(name="Literature", teacher_name="Dr. Maya Angelou", accent="tertiary"),
        Subject(name="Chemistry", teacher_name="Dr. Katherine Johnson", accent="primary"),
        Subject(name="History", teacher_name="Prof. Howard Zinn", accent="primary"),
    ]
    db.add_all(subjects)
    db.flush()

    subject_by_name = {subject.name: subject for subject in subjects}
    primary_student = students[0]

    db.add_all(
        [
            MobileEvent(
                student_id=primary_student.id,
                subject_id=subject_by_name["Chemistry"].id,
                title="Chemistry Mid-term Test",
                place="Room 402",
                detail="90 mins",
                priority="high",
                progress_percent=None,
                event_at=_dt(2024, 10, 10, 9, 0),
            ),
            MobileEvent(
                student_id=primary_student.id,
                subject_id=subject_by_name["Literature"].id,
                title="Literature Essay Due",
                place="Online Portal",
                detail="2,500 words",
                priority="normal",
                progress_percent=66,
                event_at=_dt(2024, 10, 10, 11, 30),
            ),
            MobileEvent(
                student_id=primary_student.id,
                subject_id=subject_by_name["Mathematics"].id,
                title="Math Study Group",
                place="Library B",
                detail="Optional",
                priority="normal",
                progress_percent=25,
                event_at=_dt(2024, 10, 14, 14, 0),
            ),
        ]
    )

    primary_grades = {
        "Mathematics": [8.5, 7.0, 9.0, 8.0],
        "Physics": [6.5, 8.0, 7.5, 6.0],
        "Biology": [9.5, 9.0, 10.0, None],
        "Literature": [8.0, 8.5, 9.0, 8.5],
        "Chemistry": [5.5, 6.0, 7.0, 4.5],
        "History": [9.0, 9.0, 8.5, 9.5],
    }

    for subject_name, scores in primary_grades.items():
        subject = subject_by_name[subject_name]
        for term, score in enumerate(scores, start=1):
            db.add(
                ReportGrade(
                    student_id=primary_student.id,
                    subject_id=subject.id,
                    term=term,
                    score=score,
                    max_score=10.0,
                )
            )

    aux_student_scores = {
        "Ana Martins": [7.5, 8.0, 8.5, 7.0],
        "Bruno Costa": [6.0, 7.0, 7.5, 6.5],
        "Carla Souza": [8.0, 8.5, 9.0, 8.0],
    }

    for student in students[1:]:
        template_scores = aux_student_scores[student.full_name]
        for subject in subjects:
            for term, base_score in enumerate(template_scores, start=1):
                delta = 0.2 if subject.accent == "primary" else -0.1
                score = min(10.0, max(0.0, base_score + delta))
                db.add(
                    ReportGrade(
                        student_id=student.id,
                        subject_id=subject.id,
                        term=term,
                        score=score,
                        max_score=10.0,
                    )
                )

    db.commit()
