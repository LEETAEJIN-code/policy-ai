from sqlalchemy import desc
from sqlalchemy import select

from app.database.db import SessionLocal
from app.database.sync_history_entity import SyncHistoryEntity


class SyncHistoryDbService:
    def save(
        self,
        collected_count: int,
        inserted_count: int,
        updated_count: int,
        duration: float,
        status: str,
        message: str | None = None,
    ) -> SyncHistoryEntity:
        with SessionLocal() as session:
            history = SyncHistoryEntity(
                collected_count=collected_count,
                inserted_count=inserted_count,
                updated_count=updated_count,
                duration=duration,
                status=status,
                message=message,
            )

            session.add(history)
            session.commit()
            session.refresh(history)

            return history

    def find_latest(
        self,
        limit: int = 10,
    ) -> list[SyncHistoryEntity]:
        with SessionLocal() as session:
            statement = (
                select(SyncHistoryEntity)
                .order_by(
                    desc(SyncHistoryEntity.created_at)
                )
                .limit(limit)
            )

            histories = session.scalars(
                statement
            ).all()

            return list(histories)