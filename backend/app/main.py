from typing import List

from fastapi import FastAPI

from app.models.policy import Policy
from app.services.policy_service import PolicyService


app = FastAPI(
    title="PolicyAI API",
    description="AI 기반 공공지원사업 데이터 표준화 API",
    version="0.1.0",
)

policy_service = PolicyService()


@app.get("/")
def root() -> dict:
    return {
        "message": "PolicyAI API가 실행 중입니다."
    }


@app.get(
    "/policies",
    response_model=List[Policy],
)
def get_policies() -> List[Policy]:
    return policy_service.load_bizinfo_sample()