from sqlalchemy import select

from app.database.db import SessionLocal
from app.database.policy_entity import (
    PolicySyncLog,
)


class SyncLogService:
    def create_success(
        self,
        *,
        collected_count: int,
        inserted_count: int,
        updated_count: int,
    ) -> None:
        with SessionLocal() as session:
            log = PolicySyncLog(
                status="SUCCESS",
                collected_count=collected_count,
                inserted_count=inserted_count,
                updated_count=updated_count,
            )

            session.add(log)
            session.commit()

    def create_failure(
        self,
        error_message: str,
    ) -> None:
        with SessionLocal() as session:
            log = PolicySyncLog(
                status="FAILED",
                collected_count=0,
                inserted_count=0,
                updated_count=0,
                error_message=error_message,
            )

            session.add(log)
            session.commit()

    def get_latest(self) -> PolicySyncLog | None:
        with SessionLocal() as session:
            statement = (
                select(PolicySyncLog)
                .order_by(
                    PolicySyncLog.created_at.desc()
                )
                .limit(1)
            )

            return session.scalar(statement)

    def get_history(
        self,
        limit: int = 20,
    ) -> list[PolicySyncLog]:
        with SessionLocal() as session:
            statement = (
                select(PolicySyncLog)
                .order_by(
                    PolicySyncLog.created_at.desc()
                )
                .limit(limit)
            )

            return list(
                session.scalars(statement).all()
            )