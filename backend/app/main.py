import httpx
from fastapi import FastAPI, HTTPException, Query
from app.collectors.kstartup_collector import (
    KStartupCollector
)
from app.core.config import (
    BIZINFO_API_KEY,
    KSTARTUP_API_KEY,
)
from app.collectors.bizinfo_collector import BizInfoCollector
from app.core.config import BIZINFO_API_KEY
from app.models.policy import Policy
from app.services.policy_service import PolicyService


app = FastAPI(
    title="PolicyAI API",
    description=(
        "공공지원사업 데이터를 수집하고 "
        "공통 형식으로 표준화하는 API"
    ),
    version="0.2.0",
)

bizinfo_collector = BizInfoCollector(
    service_key=BIZINFO_API_KEY
)
kstartup_collector = KStartupCollector(
    service_key=KSTARTUP_API_KEY
)
policy_service = PolicyService()


@app.get("/")
def root() -> dict[str, str]:
    return {
        "message": "PolicyAI API가 실행 중입니다."
    }


@app.get("/raw/bizinfo")
async def get_raw_bizinfo(
    page_index: int = Query(
        default=1,
        ge=1,
    ),
    page_unit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
):
    try:
        return await bizinfo_collector.fetch(
            page_index=page_index,
            page_unit=page_unit,
        )

    except httpx.HTTPStatusError as error:
        raise HTTPException(
            status_code=502,
            detail=(
                "기업마당 API 호출에 실패했습니다. "
                f"응답 코드: {error.response.status_code}"
            ),
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


@app.get(
    "/policies/bizinfo",
    response_model=list[Policy],
)
async def get_bizinfo_policies(
    page_index: int = Query(
        default=1,
        ge=1,
    ),
    page_unit: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
) -> list[Policy]:
    try:
        return await policy_service.get_bizinfo_policies(
            page_index=page_index,
            page_unit=page_unit,
        )

    except httpx.HTTPStatusError as error:
        raise HTTPException(
            status_code=502,
            detail=(
                "기업마당 API 호출에 실패했습니다. "
                f"응답 코드: {error.response.status_code}"
            ),
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error
@app.get("/raw/kstartup")
async def get_raw_kstartup(
    page: int = Query(
        default=1,
        ge=1,
    ),
    per_page: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
):
    try:
        return await kstartup_collector.fetch(
            page=page,
            per_page=per_page,
        )

    except httpx.HTTPStatusError as error:
        raise HTTPException(
            status_code=502,
            detail=(
                "K-Startup API 호출에 실패했습니다. "
                f"응답 코드: "
                f"{error.response.status_code}"
            ),
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error


@app.get(
    "/policies/kstartup",
    response_model=list[Policy],
)
async def get_kstartup_policies(
    page: int = Query(
        default=1,
        ge=1,
    ),
    per_page: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
) -> list[Policy]:
    try:
        return await policy_service.get_kstartup_policies(
            page=page,
            per_page=per_page,
        )

    except httpx.HTTPStatusError as error:
        raise HTTPException(
            status_code=502,
            detail=(
                "K-Startup API 호출에 실패했습니다. "
                f"응답 코드: "
                f"{error.response.status_code}"
            ),
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error
@app.get(
    "/policies",
    response_model=list[Policy],
)
async def get_all_policies(
    page: int = Query(
        default=1,
        ge=1,
    ),
    per_page: int = Query(
        default=20,
        ge=1,
        le=100,
    ),
    keyword: str | None = Query(
        default=None,
        description="제목, 설명, 기관, 키워드 통합 검색",
    ),
    region: str | None = Query(
        default=None,
        description="지원 지역 검색",
    ),
    target: str | None = Query(
        default=None,
        description="지원 대상 검색",
    ),
    support: str | None = Query(
        default=None,
        description="지원 유형 검색",
    ),
    source: str | None = Query(
        default=None,
        description="기업마당 또는 K-Startup",
    ),
) -> list[Policy]:
    try:
        policies = await policy_service.get_all_policies(
            page=page,
            per_page=per_page,
        )

        return policy_service.filter_policies(
            policies=policies,
            keyword=keyword,
            region=region,
            target=target,
            support=support,
            source=source,
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error