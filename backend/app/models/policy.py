from typing import Optional

from pydantic import BaseModel, Field


class Policy(BaseModel):
    id: str
    source: str

    title: str
    organization: Optional[str] = None
    description: Optional[str] = None
    detail_url: Optional[str] = None

    regions: list[str] = Field(default_factory=list)
    targets: list[str] = Field(default_factory=list)
    support_types: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)

    age_min: Optional[int] = None
    age_max: Optional[int] = None

    start_date: Optional[str] = None
    end_date: Optional[str] = None

    required_documents: list[str] = Field(default_factory=list)

    original_target_text: Optional[str] = None
    original_period_text: Optional[str] = None