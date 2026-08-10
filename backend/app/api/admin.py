from datetime import (
    datetime,
    timezone,
)

from fastapi import APIRouter

from app.models.admin import (
    DashboardResponse,
)
from app.models.cache_status import (
    CacheStatusResponse,
)
from app.services.service_instances import (
    policy_db_service,
    policy_service,
    sync_log_service,
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.post("/cache/clear")
def clear_cache() -> dict[str, object]:
    policy_service.policy_cache.clear()
    policy_service.cache_updated_at = None

    return {
        "message": "정책 캐시를 비웠습니다.",
        "cache_count": 0,
    }


@router.get(
    "/cache/status",
    response_model=CacheStatusResponse,
)
def get_cache_status() -> CacheStatusResponse:
    cached_count = len(
        policy_service.policy_cache,
    )

    updated_at = (
        policy_service.cache_updated_at
    )

    cache_duration = (
        policy_service.cache_duration
    )

    cache_minutes = int(
        cache_duration.total_seconds()
        / 60
    )

    is_valid = False

    if (
        cached_count > 0
        and updated_at is not None
    ):
        normalized_updated_at = (
            updated_at
        )

        if (
            normalized_updated_at.tzinfo
            is None
        ):
            normalized_updated_at = (
                normalized_updated_at.replace(
                    tzinfo=timezone.utc,
                )
            )

        current_time = datetime.now(
            timezone.utc,
        )

        is_valid = (
            current_time
            - normalized_updated_at
            < cache_duration
        )

    return CacheStatusResponse(
        cached_count=cached_count,
        updated_at=(
            updated_at.isoformat()
            if updated_at
            else None
        ),
        is_valid=is_valid,
        cache_minutes=cache_minutes,
    )


@router.get(
    "/dashboard",
    response_model=DashboardResponse,
)
def get_dashboard() -> DashboardResponse:
    latest = (
        sync_log_service.get_latest()
    )

    return DashboardResponse(
        policy_count=(
            policy_db_service.count()
        ),
        latest_sync=(
            latest.created_at.isoformat()
            if latest
            else None
        ),
        collected_count=(
            latest.collected_count
            if latest
            else 0
        ),
        inserted_count=(
            latest.inserted_count
            if latest
            else 0
        ),
        updated_count=(
            latest.updated_count
            if latest
            else 0
        ),
        cache_count=len(
            policy_service.policy_cache,
        ),
    )