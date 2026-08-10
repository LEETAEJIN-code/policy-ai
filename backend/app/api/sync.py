import logging

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from app.models.sync_log import (
    SyncLogResponse,
)
from app.services.service_instances import (
    policy_db_service,
    policy_service,
    sync_log_service,
)


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/policies/sync",
    tags=["Policy Sync"],
)


@router.post("")
async def sync_policies(
) -> dict[str, object]:
    try:
        policies = (
            await policy_service
            .get_all_policies(
                page=1,
                per_page=100,
                force_refresh=True,
            )
        )

        save_result = (
            policy_db_service.save_all(
                policies,
            )
        )

        inserted_count = int(
            save_result.get(
                "inserted_count",
                0,
            )
        )

        updated_count = int(
            save_result.get(
                "updated_count",
                0,
            )
        )

        collected_count = len(
            policies,
        )

        sync_log_service.create_success(
            collected_count=(
                collected_count
            ),
            inserted_count=(
                inserted_count
            ),
            updated_count=(
                updated_count
            ),
        )

        return {
            "message":
                "정책 데이터 동기화 완료",

            "collected_count":
                collected_count,

            "inserted_count":
                inserted_count,

            "updated_count":
                updated_count,
        }

    except Exception as error:
        logger.exception(
            "정책 데이터 동기화 실패",
        )

        try:
            sync_log_service.create_failure(
                error_message=str(error),
            )
        except Exception:
            logger.exception(
                "동기화 실패 기록 저장 실패",
            )

        raise HTTPException(
            status_code=500,
            detail=(
                "정책 데이터 동기화 중 "
                "오류가 발생했습니다."
            ),
        ) from error


@router.get(
    "/latest",
    response_model=(
        SyncLogResponse | None
    ),
)
def get_latest_sync() -> SyncLogResponse | None:
    return sync_log_service.get_latest()

@router.get(
    "/history",
    response_model=list[
        SyncLogResponse
    ],
)
def get_sync_history(
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
) -> list[SyncLogResponse]:
    return sync_log_service.get_history(
        limit=limit,
    )