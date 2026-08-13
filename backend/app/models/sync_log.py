from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


class SyncLogResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    status: str

    raw_collected_count: int = 0
    collected_count: int = 0

    inserted_count: int = 0
    updated_count: int = 0

    closed_skipped_count: int = 0
    closed_deleted_count: int = 0
    stale_deleted_count: int = 0

    observed_sources: list[str] = (
        Field(
            default_factory=list
        )
    )

    duration_seconds: float = 0.0

    error_message: str | None = None
    created_at: datetime