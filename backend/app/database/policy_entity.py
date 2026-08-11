from datetime import (
    datetime,
    timezone,
)

from sqlalchemy import (
    Column,
    DateTime,
    Integer,
    JSON,
    String,
    Text,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from app.database.db import Base


def utc_now() -> datetime:
    return datetime.now(
        timezone.utc
    )


class PolicyEntity(Base):
    __tablename__ = "policies"

    unique_id: Mapped[str] = mapped_column(
        String(300),
        primary_key=True,
    )

    source_id: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    source: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    organization: Mapped[str | None] = mapped_column(
        String(300),
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    detail_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    regions: Mapped[list] = mapped_column(
        JSON,
        default=list,
    )

    targets: Mapped[list] = mapped_column(
        JSON,
        default=list,
    )

    support_types: Mapped[list] = mapped_column(
        JSON,
        default=list,
    )

    keywords: Mapped[list] = mapped_column(
        JSON,
        default=list,
    )

    age_min: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    age_max: Mapped[int | None] = mapped_column(
        nullable=True,
    )

    start_date: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    end_date: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    required_documents: Mapped[list] = mapped_column(
        JSON,
        default=list,
    )

    original_target_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    original_period_text: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(
            timezone=True
        ),
        default=utc_now,
        nullable=False,
        index=True,
    )


class Bookmark(Base):
    __tablename__ = "bookmarks"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    user = Column(
        String,
        nullable=False,
    )

    policy_id = Column(
        String,
        nullable=False,
    )


class PolicySyncLog(Base):
    __tablename__ = "policy_sync_logs"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    status = Column(
        String(20),
        nullable=False,
    )

    collected_count = Column(
        Integer,
        default=0,
        nullable=False,
    )

    inserted_count = Column(
        Integer,
        default=0,
        nullable=False,
    )

    updated_count = Column(
        Integer,
        default=0,
        nullable=False,
    )

    error_message = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.now,
        nullable=False,
    )