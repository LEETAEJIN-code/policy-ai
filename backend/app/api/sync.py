import asyncio
import logging
from typing import Any

from fastapi import (
    APIRouter,
    BackgroundTasks,
    HTTPException,
    Query,
    status,
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

sync_lock = asyncio.Lock()


def get_policy_key(
    policy: Any,
) -> str:
    """
    정책 출처 + ID를 이용해서
    페이지 간 중복 정책을 구분한다.
    """

    if isinstance(policy, dict):
        source = str(
            policy.get("source", "")
        )

        policy_id = str(
            policy.get("id", "")
        )

    else:
        source = str(
            getattr(
                policy,
                "source",
                "",
            )
        )

        policy_id = str(
            getattr(
                policy,
                "id",
                "",
            )
        )

    if not policy_id:
        return ""

    return (
        f"{source}:{policy_id}"
    )


async def run_full_sync() -> None:
    async with sync_lock:
        collected_count = 0
        inserted_count = 0
        updated_count = 0

        seen_policy_keys: set[str] = set()

        page = 1

        try:
            logger.info(
                "전체 정책 동기화 시작"
            )

            while True:
                logger.info(
                    "정책 수집 시작 - page=%s",
                    page,
                )

                policies = (
                    await policy_service
                    .get_all_policies(
                        page=page,
                        per_page=PER_PAGE,
                        force_refresh=True,
                        update_cache=False,
                    )
                )

                # 두 API 모두 더 이상
                # 데이터를 반환하지 않으면 종료
                if not policies:
                    logger.info(
                        "빈 페이지 도달 - "
                        "동기화 종료 page=%s",
                        page,
                    )

                    break

                new_policies: list[Any] = []

                for policy in policies:
                    policy_key = (
                        get_policy_key(
                            policy
                        )
                    )

                    # ID 없는 데이터는 일단 저장
                    if not policy_key:
                        new_policies.append(
                            policy
                        )

                        continue

                    if (
                        policy_key
                        in seen_policy_keys
                    ):
                        continue

                    seen_policy_keys.add(
                        policy_key
                    )

                    new_policies.append(
                        policy
                    )

                # 같은 페이지가 계속 반복될 경우
                # 무한 루프 방지
                if not new_policies:
                    logger.info(
                        "새로운 정책 없음 - "
                        "동기화 종료 page=%s",
                        page,
                    )

                    break

                #
                # 핵심:
                # 전체를 메모리에 모으지 않고
                # 페이지마다 즉시 DB 저장
                #
                save_result = (
                    policy_db_service
                    .save_all(
                        new_policies
                    )
                )

                page_inserted_count = int(
                    save_result.get(
                        "inserted_count",
                        0,
                    )
                )

                page_updated_count = int(
                    save_result.get(
                        "updated_count",
                        0,
                    )
                )

                collected_count += len(
                    new_policies
                )

                inserted_count += (
                    page_inserted_count
                )

                updated_count += (
                    page_updated_count
                )

                logger.info(
                    (
                        "page=%s 저장 완료 / "
                        "page_count=%s / "
                        "누적 collected=%s / "
                        "inserted=%s / "
                        "updated=%s"
                    ),
                    page,
                    len(new_policies),
                    collected_count,
                    inserted_count,
                    updated_count,
                )

                page += 1

                #
                # 외부 API와 Render에
                # 부담을 너무 많이 주지 않도록
                # 아주 짧게 양보
                #
                await asyncio.sleep(
                    0.15
                )

            if collected_count == 0:
                raise RuntimeError(
                    "수집된 정책 데이터가 없습니다."
                )

            policy_service.clear_cache()

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

            logger.info(
                (
                    "전체 정책 동기화 완료 / "
                    "pages=%s / "
                    "collected=%s / "
                    "inserted=%s / "
                    "updated=%s"
                ),
                page - 1,
                collected_count,
                inserted_count,
                updated_count,
            )

        except Exception as error:
            logger.exception(
                "정책 전체 동기화 실패"
            )

            try:
                sync_log_service.create_failure(
                    error_message=str(
                        error
                    ),
                )

            except Exception:
                logger.exception(
                    "동기화 실패 로그 저장 실패"
                )


@router.post(
    "",
    status_code=status.HTTP_202_ACCEPTED,
)
async def sync_policies(
    background_tasks: BackgroundTasks,
) -> dict[str, object]:

    if sync_lock.locked():
        raise HTTPException(
            status_code=409,
            detail=(
                "이미 정책 데이터 "
                "동기화가 진행 중입니다."
            ),
        )

    background_tasks.add_task(
        run_full_sync
    )

    return {
        "message":
            "전체 정책 데이터 동기화를 시작했습니다.",

        "status":
            "started",

        "per_page":
            PER_PAGE,
    }


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