from pydantic import BaseModel
from typing import List
from typing import Optional


class Policy(BaseModel):

    id: str

    source: str

    title: str

    organization: str

    description: str

    detail_url: str

    region: List[str]

    target: List[str]

    support_types: List[str]

    age_min: Optional[int]

    age_max: Optional[int]

    start_date: Optional[str]

    end_date: Optional[str]

    required_documents: List[str]

    keywords: List[str]