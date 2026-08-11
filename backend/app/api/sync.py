import asyncio
import logging
import secrets

from datetime import date, datetime
from typing import Any

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Header,
    HTTPException,
    Query,
    status,
)

from app.core.config import SYNC_API_TOKEN
from app.models.sync_log import SyncLogResponse
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
    if isinstance(policy, dict):
        source = str(
            policy.get(
                "source",
                "",
            )
        )

        policy_id = str(
            policy.get(
                "id",
                "",
            )
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

    return f"{source}:{policy_id}"


def is_policy_active(
    policy: Any,
) -> bool:
    """
    이미 종료된 정책은 False.

    종료일을 알 수 없거나 날짜 형식이 이상한 경우에는
    함부로 제거하지 않고 True.
    """

    if isinstance(policy, dict):
        end_date = policy.get(
            "end_date"
        )

    else:
        end_date = getattr(
            policy,
            "end_date",
            None,
        )

    if not end_date:
        return True

    try:
        deadline = datetime.strptime(
            str(end_date),
            "%Y-%m-%d",
        ).date()

    except ValueError:
        return True

    return deadline >= date.today()


async def run_full_sync() -> None:
    async with sync_lock:
        collected_count = 0
        active_count = 0

        inserted_count = 0
        updated_count = 0

        skipped_closed_count = 0

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

                if not policies:
                    logger.info(
                        "빈 페이지 도달 - page=%s",
                        page,
                    )
                    break

                collected_count += len(
                    policies
                )

                new_policies: list[Any] = []

                for policy in policies:
                    # 이미 마감된 정책은
                    # DB에 저장하지 않는다.
                    if not is_policy_active(
                        policy
                    ):
                        skipped_closed_count += 1
                        continue

                    policy_key = get_policy_key(
                        policy
                    )

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

                active_count += len(
                    new_policies
                )

                # 이번 페이지에 저장할 정책이 없어도
                # 다음 페이지는 계속 확인한다.
                if new_policies:
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

                    inserted_count += (
                        page_inserted_count
                    )

                    updated_count += (
                        page_updated_count
                    )

                logger.info(
                    (
                        "page=%s 완료 / "
                        "raw=%s / "
                        "active=%s / "
                        "누적 collected=%s / "
                        "skipped_closed=%s"
                    ),
                    page,
                    len(policies),
                    len(new_policies),
                    collected_count,
                    skipped_closed_count,
                )

                page += 1

                await asyncio.sleep(
                    0.15
                )

            if collected_count == 0:
                raise RuntimeError(
                    "수집된 정책 데이터가 없습니다."
                )

            # 기존 DB에 남아 있던
            # 과거 마감 정책 정리
            deleted_closed_count = (
                policy_db_service
                .delete_closed()
            )

            policy_service.clear_cache()

            sync_log_service.create_success(
                collected_count=active_count,
                inserted_count=inserted_count,
                updated_count=updated_count,
            )

            logger.info(
                (
                    "전체 정책 동기화 완료 / "
                    "pages=%s / "
                    "raw_collected=%s / "
                    "active=%s / "
                    "closed_skipped=%s / "
                    "closed_deleted=%s / "
                    "inserted=%s / "
                    "updated=%s"
                ),
                page - 1,
                collected_count,
                active_count,
                skipped_closed_count,
                deleted_closed_count,
                inserted_count,
                updated_count,
            )

        except Exception as error:
            logger.exception(
                "정책 전체 동기화 실패"
            )

            try:
                sync_log_service.create_failure(
                    error_message=str(error),
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
    x_sync_token: str | None = Header(
        default=None,
        alias="X-Sync-Token",
    ),
) -> dict[str, object]:
    if not SYNC_API_TOKEN:
        raise HTTPException(
            status_code=(
                status.HTTP_503_SERVICE_UNAVAILABLE
            ),
            detail=(
                "SYNC_API_TOKEN 설정이 필요합니다."
            ),
        )

    if (
        not x_sync_token
        or not secrets.compare_digest(
            x_sync_token,
            SYNC_API_TOKEN,
        )
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "유효하지 않은 동기화 토큰입니다."
            ),
        )

    if sync_lock.locked():
        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=(
                "이미 정책 데이터 "
                "동기화가 진행 중입니다."
            ),
        )

    background_tasks.add_task(
        run_full_sync
    )

    return {
        "message": (
            "신청 가능한 전체 정책 "
            "동기화를 시작했습니다."
        ),
        "status": "started",
        "per_page": PER_PAGE,
    }


@router.get(
    "/latest",
    response_model=SyncLogResponse | None,
)
def get_latest_sync(
) -> SyncLogResponse | None:
    return (
        sync_log_service
        .get_latest()
    )


@router.get(
    "/history",
    response_model=list[SyncLogResponse],
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
            limit=limit
        )
    )