from datetime import datetime

from pydantic import BaseModel


class SyncLogResponse(BaseModel):
    id: int
    status: str
    collected_count: int
    inserted_count: int
    updated_count: int
    error_message: str | None
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }