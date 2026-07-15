from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


class ApplicationPeriod(BaseModel):
    start: Optional[date] = None
    end: Optional[date] = None
    always_open: bool = False


class AgeCondition(BaseModel):
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    status: str = "unknown"


class SupportInformation(BaseModel):
    types: List[str] = Field(default_factory=list)
    amount_text: Optional[str] = None


class Policy(BaseModel):
    id: str
    title: str
    summary: Optional[str] = None

    organization: Optional[str] = None

    source: str
    source_id: Optional[str] = None
    source_url: Optional[str] = None

    application_period: ApplicationPeriod = Field(
        default_factory=ApplicationPeriod
    )

    regions: List[str] = Field(default_factory=list)
    target_groups: List[str] = Field(default_factory=list)
    categories: List[str] = Field(default_factory=list)

    age_condition: AgeCondition = Field(
        default_factory=AgeCondition
    )

    support: SupportInformation = Field(
        default_factory=SupportInformation
    )

    required_documents: List[str] = Field(default_factory=list)

    original_target_text: Optional[str] = None