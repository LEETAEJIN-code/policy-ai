from app.collectors.bizinfo_collector import (
    BizInfoCollector
)

from app.adapters.bizinfo_adapter import (
    BizInfoAdapter
)

from app.core.config import (
    BIZINFO_API_KEY
)


class PolicyService:

    def __init__(self):

        self.collector = BizInfoCollector(
            BIZINFO_API_KEY
        )

        self.adapter = BizInfoAdapter()