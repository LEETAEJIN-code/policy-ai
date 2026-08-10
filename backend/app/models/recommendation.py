from pydantic import BaseModel

from app.models.policy import Policy


class Recommendation(BaseModel):
    policy: Policy

    score: int
    grade: str
    summary: str

    eligibility: str

    recommend_reasons: list[str]

    matched_conditions: list[str]
    unknown_conditions: list[str]
    failed_conditions: list[str]

    preparation_checklist: list[str]

    deadline_status: str