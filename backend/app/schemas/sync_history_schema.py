from datetime import datetime

from pydantic import BaseModel
from pydantic import ConfigDict


class SyncHistoryResponse(BaseModel):
    id: int
    created_at: datetime
    collected_count: int
    inserted_count: int
    updated_count: int
    duration: float
    status: str
    message: str | None

    model_config = ConfigDict(
        from_attributes=True
    )