import asyncio
from typing import Any

from app.adapters.bizinfo_adapter import BizInfoAdapter
from app.adapters.kstartup_adapter import KStartupAdapter
from app.collectors.bizinfo_collector import BizInfoCollector
from app.collectors.kstartup_collector import KStartupCollector
from app.core.config import (
    BIZINFO_API_KEY,
    KSTARTUP_API_KEY,
)
from app.models.policy import Policy


class PolicyService:
    def __init__(self) -> None:
        self.bizinfo_collector = BizInfoCollector(
            service_key=BIZINFO_API_KEY
        )
        self.bizinfo_adapter = BizInfoAdapter()

        self.kstartup_collector = KStartupCollector(
            service_key=KSTARTUP_API_KEY
        )
        self.kstartup_adapter = KStartupAdapter()

    async def get_bizinfo_policies(
        self,
        page_index: int = 1,
        page_unit: int = 20,
    ) -> list[Policy]:
        raw_data = await self.bizinfo_collector.fetch(
            page_index=page_index,
            page_unit=page_unit,
        )

        items = self.extract_items(raw_data)
        policies: list[Policy] = []

        for item in items:
            try:
                policies.append(
                    self.bizinfo_adapter.normalize(item)
                )
            except Exception as error:
                print(
                    "기업마당 데이터 변환 실패:",
                    repr(error),
                )

        return policies

    async def get_kstartup_policies(
        self,
        page: int = 1,
        per_page: int = 20,
    ) -> list[Policy]:
        raw_items = await self.kstartup_collector.fetch(
            page=page,
            per_page=per_page,
        )

        policies: list[Policy] = []

        for item in raw_items:
            try:
                policies.append(
                    self.kstartup_adapter.normalize(item)
                )
            except Exception as error:
                print(
                    "K-Startup 데이터 변환 실패:",
                    repr(error),
                )

        return policies

    async def get_all_policies(
        self,
        page: int = 1,
        per_page: int = 20,
    ) -> list[Policy]:
        results = await asyncio.gather(
            self.get_bizinfo_policies(
                page_index=page,
                page_unit=per_page,
            ),
            self.get_kstartup_policies(
                page=page,
                per_page=per_page,
            ),
            return_exceptions=True,
        )

        all_policies: list[Policy] = []

        for result in results:
            if isinstance(result, Exception):
                print(
                    "정책 데이터 수집 실패:",
                    repr(result),
                )
                continue

            all_policies.extend(result)

        unique_policies: dict[str, Policy] = {}

        for policy in all_policies:
            unique_key = f"{policy.source}:{policy.id}"
            unique_policies[unique_key] = policy

        policies = list(unique_policies.values())

        policies.sort(
            key=lambda policy: policy.start_date or "",
            reverse=True,
        )

        return policies

    def extract_items(
        self,
        raw_data: Any,
    ) -> list[dict[str, Any]]:
        if isinstance(raw_data, list):
            return [
                item
                for item in raw_data
                if isinstance(item, dict)
            ]

        if not isinstance(raw_data, dict):
            return []

        # 기업마당 실제 응답 구조
        json_array = raw_data.get("jsonArray")

        if isinstance(json_array, list):
            return [
                item
                for item in json_array
                if isinstance(item, dict)
            ]

        items = raw_data.get("items")

        if isinstance(items, list):
            return items

        if isinstance(items, dict):
            nested_item = items.get("item")

            if isinstance(nested_item, list):
                return nested_item

            if isinstance(nested_item, dict):
                return [nested_item]

        response = raw_data.get("response", {})

        if isinstance(response, dict):
            body = response.get("body", {})

            if isinstance(body, dict):
                body_items = body.get("items", {})

                if isinstance(body_items, list):
                    return body_items

                if isinstance(body_items, dict):
                    nested_item = body_items.get("item")

                    if isinstance(nested_item, list):
                        return nested_item

                    if isinstance(nested_item, dict):
                        return [nested_item]

        return []
    def filter_policies(
        self,
        policies: list[Policy],
        keyword: str | None = None,
        region: str | None = None,
        target: str | None = None,
        support: str | None = None,
        source: str | None = None,
    ) -> list[Policy]:
        filtered = policies

        if keyword:
            keyword_lower = keyword.strip().lower()

            filtered = [
                policy
                for policy in filtered
                if self.matches_keyword(
                    policy,
                    keyword_lower,
                )
            ]

        if region:
            region_lower = region.strip().lower()

            filtered = [
                policy
                for policy in filtered
                if any(
                    region_lower in policy_region.lower()
                    for policy_region in policy.regions
                )
                or any(
                    policy_region == "전국"
                    for policy_region in policy.regions
                )
            ]

        if target:
            target_lower = target.strip().lower()

            filtered = [
                policy
                for policy in filtered
                if any(
                    target_lower in policy_target.lower()
                    for policy_target in policy.targets
                )
            ]

        if support:
            support_lower = support.strip().lower()

            filtered = [
                policy
                for policy in filtered
                if any(
                    support_lower in support_type.lower()
                    for support_type in policy.support_types
                )
            ]

        if source:
            source_lower = source.strip().lower()

            filtered = [
                policy
                for policy in filtered
                if source_lower in policy.source.lower()
            ]

        return filtered
    def matches_keyword(
        self,
        policy: Policy,
        keyword: str,
    ) -> bool:
        searchable_values = [
            policy.title,
            policy.organization or "",
            policy.description or "",
            policy.original_target_text or "",
            " ".join(policy.regions),
            " ".join(policy.targets),
            " ".join(policy.support_types),
            " ".join(policy.keywords),
        ]

        combined_text = " ".join(
            searchable_values
        ).lower()

        return keyword in combined_text