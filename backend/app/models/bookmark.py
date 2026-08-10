from pydantic import BaseModel


class BookmarkCreate(BaseModel):
    user: str
    policy_id: str


class BookmarkResponse(BaseModel):
    id: int
    user: str
    policy_id: str

    model_config = {
        "from_attributes": True,
    }