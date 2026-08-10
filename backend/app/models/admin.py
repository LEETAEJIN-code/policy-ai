from pydantic import BaseModel


class DashboardResponse(BaseModel):
    policy_count: int
    latest_sync: str | None
    collected_count: int
    inserted_count: int
    updated_count: int
    cache_count: int