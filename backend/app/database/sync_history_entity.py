from datetime import datetime
from sqlalchemy import DateTime
from sqlalchemy import Float
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.sql import func

from app.database.db import Base


class SyncHistoryEntity(Base):
    __tablename__ = "sync_history"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        server_default=func.now(),
    )

    collected_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    inserted_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    updated_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    duration: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    message: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )