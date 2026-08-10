import logging
from typing import Any

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


PER_PAGE = 100


def get_policy_id(
    policy: Any,
) -> str:
    """
    페이지를 넘기면서 같은 정책이 반복될 경우
    무한 루프를 막기 위한 정책 ID 추출 함수.
    """

    if isinstance(policy, dict):
        return str(
            policy.get("id", "")
        )

    policy_id = getattr(
        policy,
        "id",
        "",
    )

    return str(policy_id)


@router.post("")
async def sync_policies(
) -> dict[str, object]:
    try:
        all_policies: list[Any] = []

        seen_policy_ids: set[str] = set()

        page = 1

        while True:
            logger.info(
                "정책 데이터 수집 중 - page=%s",
                page,
            )

            policies = (
                await policy_service
                .get_all_policies(
                    page=page,
                    per_page=PER_PAGE,
                    force_refresh=True,
                )
            )

            # 더 이상 데이터가 없으면 종료
            if not policies:
                logger.info(
                    "정책 데이터 수집 종료 - "
                    "빈 페이지 도달: page=%s",
                    page,
                )
                break

            new_policies: list[Any] = []

            for policy in policies:
                policy_id = get_policy_id(
                    policy,
                )

                # ID가 없는 경우에도
                # 데이터 자체는 저장 대상으로 유지
                if not policy_id:
                    new_policies.append(
                        policy
                    )
                    continue

                if (
                    policy_id
                    in seen_policy_ids
                ):
                    continue

                seen_policy_ids.add(
                    policy_id
                )

                new_policies.append(
                    policy
                )

            # 같은 페이지가 반복되는 API의
            # 무한 루프 방지
            if not new_policies:
                logger.info(
                    "새 정책이 없어 수집 종료 - "
                    "page=%s",
                    page,
                )
                break

            all_policies.extend(
                new_policies
            )

            logger.info(
                "page=%s 수집 완료 / "
                "현재 누적=%s",
                page,
                len(all_policies),
            )

            page += 1

        collected_count = len(
            all_policies
        )

        if collected_count == 0:
            raise RuntimeError(
                "수집된 정책 데이터가 없습니다."
            )

        save_result = (
            policy_db_service.save_all(
                all_policies,
            )
        )

        policy_service.clear_cache()

        inserted_count = int(
            save_result.get(
                "inserted_count",
                0,
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
                "전체 정책 데이터 동기화 완료",

            "collected_count":
                collected_count,

            "inserted_count":
                inserted_count,

            "updated_count":
                updated_count,

            "pages_processed":
                page - 1,
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
def get_latest_sync(
) -> SyncLogResponse | None:
    return (
        sync_log_service
        .get_latest()
    )


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
    return (
        sync_log_service
        .get_history(
            limit=limit,
        )
    )