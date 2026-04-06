import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def utcnow() -> datetime:
    return datetime.now(UTC)


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True, index=True)
    teacher_name: Mapped[str] = mapped_column(String(120), nullable=False)
    accent: Mapped[str] = mapped_column(String(20), nullable=False, default="primary")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utcnow,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utcnow,
        onupdate=utcnow,
    )

    events = relationship("MobileEvent", back_populates="subject", cascade="all, delete-orphan")
    grades = relationship("ReportGrade", back_populates="subject", cascade="all, delete-orphan")
