from sqlalchemy import select

from app.database.db import (
    SessionLocal,
)
from app.database.policy_entity import (
    PolicySyncLog,
)
from app.models.sync_log import (
    SyncLogResponse,
)


class SyncLogService:
    def normalize_sources(
        self,
        sources: list[str] | set[str] | None,
    ) -> list[str]:
        if not sources:
            return []

        return sorted({
            str(source).strip()
            for source in sources
            if source
            and str(source).strip()
        })

    def create_success(
        self,
        collected_count: int,
        inserted_count: int,
        updated_count: int,
        raw_collected_count: int = 0,
        closed_skipped_count: int = 0,
        closed_deleted_count: int = 0,
        stale_deleted_count: int = 0,
        observed_sources: (
            list[str]
            | set[str]
            | None
        ) = None,
        duration_seconds: float = 0.0,
    ) -> int:
        with SessionLocal() as session:
            log = PolicySyncLog(
                status="SUCCESS",
                raw_collected_count=(
                    raw_collected_count
                ),
                collected_count=(
                    collected_count
                ),
                inserted_count=(
                    inserted_count
                ),
                updated_count=(
                    updated_count
                ),
                closed_skipped_count=(
                    closed_skipped_count
                ),
                closed_deleted_count=(
                    closed_deleted_count
                ),
                stale_deleted_count=(
                    stale_deleted_count
                ),
                observed_sources=(
                    self.normalize_sources(
                        observed_sources
                    )
                ),
                duration_seconds=max(
                    float(
                        duration_seconds
                    ),
                    0.0,
                ),
                error_message=None,
            )

            session.add(
                log
            )

            session.flush()

            log_id = int(
                log.id
            )

            session.commit()

            return log_id

    def create_failure(
        self,
        error_message: str,
        collected_count: int = 0,
        inserted_count: int = 0,
        updated_count: int = 0,
        raw_collected_count: int = 0,
        closed_skipped_count: int = 0,
        closed_deleted_count: int = 0,
        stale_deleted_count: int = 0,
        observed_sources: (
            list[str]
            | set[str]
            | None
        ) = None,
        duration_seconds: float = 0.0,
    ) -> int:
        with SessionLocal() as session:
            log = PolicySyncLog(
                status="FAILURE",
                raw_collected_count=(
                    raw_collected_count
                ),
                collected_count=(
                    collected_count
                ),
                inserted_count=(
                    inserted_count
                ),
                updated_count=(
                    updated_count
                ),
                closed_skipped_count=(
                    closed_skipped_count
                ),
                closed_deleted_count=(
                    closed_deleted_count
                ),
                stale_deleted_count=(
                    stale_deleted_count
                ),
                observed_sources=(
                    self.normalize_sources(
                        observed_sources
                    )
                ),
                duration_seconds=max(
                    float(
                        duration_seconds
                    ),
                    0.0,
                ),
                error_message=(
                    str(
                        error_message
                    )
                ),
            )

            session.add(
                log
            )

            session.flush()

            log_id = int(
                log.id
            )

            session.commit()

            return log_id

    def get_latest(
        self,
    ) -> SyncLogResponse | None:
        with SessionLocal() as session:
            statement = (
                select(
                    PolicySyncLog
                )
                .order_by(
                    PolicySyncLog
                    .id
                    .desc()
                )
                .limit(1)
            )

            entity = session.scalar(
                statement
            )

            if entity is None:
                return None

            return (
                SyncLogResponse
                .model_validate(
                    entity
                )
            )

    def get_history(
        self,
        limit: int = 20,
    ) -> list[SyncLogResponse]:
        with SessionLocal() as session:
            statement = (
                select(
                    PolicySyncLog
                )
                .order_by(
                    PolicySyncLog
                    .id
                    .desc()
                )
                .limit(
                    limit
                )
            )

            entities = list(
                session
                .scalars(statement)
                .all()
            )

            return [
                SyncLogResponse
                .model_validate(
                    entity
                )
                for entity in entities
            ]