from pydantic import BaseModel


class PolicyStatisticsResponse(BaseModel):
    total: int
    available: int
    deadline_approaching: int
    closed: int
    date_unknown: int