from pydantic import BaseModel


class CacheStatusResponse(BaseModel):
    cached_count: int
    updated_at: str | None
    is_valid: bool
    cache_minutes: int