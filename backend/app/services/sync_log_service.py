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
    ) -> int:
        with SessionLocal() as session:
            log = PolicySyncLog(
                status="SUCCESS",
                collected_count=collected_count,
                inserted_count=inserted_count,
                updated_count=updated_count,
                error_message=None,
            )

            session.add(log)

            # INSERT를 즉시 실행해서
            # 오류가 있으면 여기서 확인
            session.flush()

            log_id = int(log.id)

            session.commit()

            print(
                "동기화 성공 로그 저장 완료:",
                log_id,
            )

            return log_id

    def create_failure(
        self,
        error_message: str,
    ) -> int:
        with SessionLocal() as session:
            log = PolicySyncLog(
                status="FAILED",
                collected_count=0,
                inserted_count=0,
                updated_count=0,
                error_message=error_message,
            )

            session.add(log)

            session.flush()

            log_id = int(log.id)

            session.commit()

            print(
                "동기화 실패 로그 저장 완료:",
                log_id,
            )

            return log_id

    def get_latest(
        self,
    ) -> PolicySyncLog | None:
        with SessionLocal() as session:
            statement = (
                select(
                    PolicySyncLog
                )
                .order_by(
                    PolicySyncLog
                    .created_at
                    .desc(),

                    PolicySyncLog
                    .id
                    .desc(),
                )
                .limit(1)
            )

            return session.scalar(
                statement
            )

    def get_history(
        self,
        limit: int = 20,
    ) -> list[PolicySyncLog]:
        with SessionLocal() as session:
            statement = (
                select(
                    PolicySyncLog
                )
                .order_by(
                    PolicySyncLog
                    .created_at
                    .desc(),

                    PolicySyncLog
                    .id
                    .desc(),
                )
                .limit(limit)
            )

            return list(
                session
                .scalars(statement)
                .all()
            )