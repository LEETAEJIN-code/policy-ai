from typing import Any

import httpx


class BizInfoCollector:
    BASE_URL = "https://www.bizinfo.go.kr/uss/rss/bizinfoApi.do"

    def __init__(self, service_key: str) -> None:
        self.service_key = service_key

    async def fetch(
        self,
        page_index: int = 1,
        page_unit: int = 20,
    ) -> Any:
        if not self.service_key:
            raise ValueError("기업마당 인증키가 설정되지 않았습니다.")

        params = {
            "crtfcKey": self.service_key,
            "dataType": "json",
            "pageIndex": page_index,
            "pageUnit": page_unit,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                self.BASE_URL,
                params=params,
            )

            response.raise_for_status()

            try:
                return response.json()
            except ValueError as error:
                raise RuntimeError(
                    "기업마당 응답이 JSON 형식이 아닙니다."
                ) from error