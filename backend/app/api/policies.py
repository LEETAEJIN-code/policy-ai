from datetime import date
from math import ceil

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
)

from app.models.policy import Policy
from app.models.policy_search import (
    PolicySearchResponse,
)
from app.schemas.policy_statistics import (
    PolicyStatisticsResponse,
)
from app.services.policy_db_service import (
    PolicyDbService,
)


router = APIRouter(
    prefix="/policies",
    tags=["Policies"],
)


policy_db_service = PolicyDbService()


@router.get(
    "/search",
    response_model=PolicySearchResponse,
)
async def search_policies(
    keyword: str | None = None,
    region: str | None = None,
    target: str | None = None,
    support_type: str | None = None,
    source: str | None = None,
    organization: str | None = None,
    include_closed: bool = False,
    page: int = Query(
        default=1,
        ge=1,
    ),
    per_page: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
) -> PolicySearchResponse:
    items, total = policy_db_service.search(
        keyword=keyword,
        region=region,
        target=target,
        support_type=support_type,
        source=source,
        organization=organization,
        include_closed=include_closed,
        today=date.today().isoformat(),
        page=page,
        per_page=per_page,
    )

    return PolicySearchResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=(
            ceil(total / per_page)
            if total > 0
            else 0
        ),
    )


@router.get(
    "/statistics",
    response_model=PolicyStatisticsResponse,
)
async def get_policy_statistics(
) -> PolicyStatisticsResponse:
    statistics = (
        policy_db_service
        .get_statistics(
            today=date.today(),
        )
    )

    return PolicyStatisticsResponse(
        total=statistics["total"],
        available=statistics["available"],
        deadline_approaching=(
            statistics[
                "deadline_approaching"
            ]
        ),
        closed=statistics["closed"],
        date_unknown=(
            statistics["date_unknown"]
        ),
    )


# 고정 경로인 /statistics는
# 반드시 /{policy_id}보다 위에 있어야 한다.
@router.get(
    "/{policy_id}",
    response_model=Policy,
)
async def get_policy(
    policy_id: str,
) -> Policy:
    policy = policy_db_service.get_by_id(
        policy_id,
    )

    if policy is None:
        raise HTTPException(
            status_code=404,
            detail="정책을 찾을 수 없습니다.",
        )

    return policy