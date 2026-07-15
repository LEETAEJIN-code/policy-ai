from typing import Any
from xml.etree import ElementTree

import httpx


class KStartupCollector:
    BASE_URL = (
        "https://apis.data.go.kr/"
        "B552735/kisedKstartupService01/"
        "getAnnouncementInformation01"
    )

    def __init__(self, service_key: str) -> None:
        self.service_key = service_key

    async def fetch(
        self,
        page: int = 1,
        per_page: int = 20,
    ) -> list[dict[str, Any]]:
        if not self.service_key:
            raise ValueError(
                "K-Startup 인증키가 설정되지 않았습니다."
            )

        params = {
            "serviceKey": self.service_key,
            "page": page,
            "perPage": per_page,
        }

        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:
            response = await client.get(
                self.BASE_URL,
                params=params,
                headers={
                    "Accept": "application/xml",
                },
            )

            response.raise_for_status()

        return self.parse_xml(response.text)

    def parse_xml(
        self,
        xml_text: str,
    ) -> list[dict[str, Any]]:
        try:
            root = ElementTree.fromstring(xml_text)
        except ElementTree.ParseError as error:
            raise RuntimeError(
                "K-Startup XML 응답을 해석하지 못했습니다."
            ) from error

        items: list[dict[str, Any]] = []

        for item_element in root.findall(".//item"):
            item: dict[str, Any] = {}

            for column in item_element.findall("col"):
                field_name = column.attrib.get("name", "")
                field_value = "".join(
                    column.itertext()
                ).strip()

                if field_name:
                    item[field_name] = field_value

            if item:
                items.append(item)

        return items