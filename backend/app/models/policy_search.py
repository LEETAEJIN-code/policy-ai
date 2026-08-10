from pydantic import BaseModel

from app.models.policy import Policy


class PolicySearchResponse(BaseModel):
    items: list[Policy]
    total: int
    page: int
    per_page: int
    total_pages: int