from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    age: int = Field(
        ge=0,
        le=120,
    )

    region: str

    targets: list[str] = Field(
        default_factory=list,
    )

    interests: list[str] = Field(
        default_factory=list,
    )

    support_type: str = ""

    exclude_closed: bool = True

    limit: int = Field(
        default=20,
        ge=1,
        le=100,
    )