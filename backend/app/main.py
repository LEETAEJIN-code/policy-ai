import httpx

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin import router as admin_router
from app.api.bookmark import router as bookmark_router
from app.api.policies import router as policies_router
from app.api.recommend import router as recommend_router
from app.api.sync import router as sync_router
from app.collectors.bizinfo_collector import BizInfoCollector
from app.collectors.kstartup_collector import KStartupCollector
from app.core.config import BIZINFO_API_KEY, KSTARTUP_API_KEY
from app.database import create_tables


app = FastAPI(
    title="PolicyAI API",
    description=(
        "공공지원사업 데이터를 수집하고 "
        "공통 형식으로 표준화하는 API"
    ),
    version="0.2.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


create_tables()


bizinfo_collector = BizInfoCollector(
    service_key=BIZINFO_API_KEY,
)

kstartup_collector = KStartupCollector(
    service_key=KSTARTUP_API_KEY,
)


app.include_router(policies_router)
app.include_router(recommend_router)
app.include_router(bookmark_router)
app.include_router(sync_router)
app.include_router(admin_router)


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
                f"응답 코드: {error.response.status_code}"
            ),
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error