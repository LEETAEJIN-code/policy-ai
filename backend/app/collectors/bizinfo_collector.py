from typing import Any

import httpx


class BizInfoCollector:

    BASE_URL = ""

    def __init__(self, service_key: str):

        self.service_key = service_key

    async def fetch(self) -> list[dict[str, Any]]:

        params = {
            "serviceKey": self.service_key,
            "type": "json"
        }

        async with httpx.AsyncClient(timeout=20) as client:

            response = await client.get(
                self.BASE_URL,
                params=params
            )

            response.raise_for_status()

            data = response.json()

        return data