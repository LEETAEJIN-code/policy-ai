import json
from pathlib import Path
from typing import List

from app.adapters.bizinfo_adapter import BizInfoAdapter
from app.models.policy import Policy


class PolicyService:
    def __init__(self) -> None:
        self.adapter = BizInfoAdapter()

    def load_bizinfo_sample(self) -> List[Policy]:
        file_path = (
            Path(__file__).resolve().parent.parent
            / "data"
            / "bizinfo_sample.json"
        )

        with file_path.open(
            "r",
            encoding="utf-8",
        ) as file:
            raw_items = json.load(file)

        return [
            self.adapter.normalize(raw_item)
            for raw_item in raw_items
        ]