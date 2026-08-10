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
from app.models.recommendation import Recommendation
from app.models.user_profile import UserProfile
from datetime import (
    date,
    datetime,
    timedelta,
    timezone,
)
class PolicyService:
    
    def __init__(self) -> None:
        self.bizinfo_collector = (
            BizInfoCollector(
                service_key=BIZINFO_API_KEY,
            )
        )

        self.bizinfo_adapter = (
            BizInfoAdapter()
        )

        self.kstartup_collector = (
            KStartupCollector(
                service_key=KSTARTUP_API_KEY,
            )
        )

        self.kstartup_adapter = (
            KStartupAdapter()
        )

        self.policy_cache: list[Policy] = []
        self.cache_updated_at: datetime | None = None

        self.cache_duration = timedelta(
            minutes=10,
        )
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
        force_refresh: bool = False,
        update_cache: bool = True,
    ) -> list[Policy]:

        if (
            update_cache
            and not force_refresh
            and self.is_cache_valid()
        ):
            print(
                "캐시된 정책 데이터를 반환합니다."
            )

            return self.policy_cache

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
            if isinstance(
                result,
                Exception,
            ):
                print(
                    "정책 데이터 수집 실패:",
                    repr(result),
                )

                continue

            all_policies.extend(
                result
            )

        unique_policies: dict[
            str,
            Policy,
        ] = {}

        for policy in all_policies:
            unique_key = (
                f"{policy.source}:"
                f"{policy.id}"
            )

            unique_policies[
                unique_key
            ] = policy

        policies = list(
            unique_policies.values()
        )

        policies.sort(
            key=lambda policy:
                policy.start_date or "",
            reverse=True,
        )

        # 일반 정책 조회에서만 캐시 갱신
        # 전체 동기화에서는 페이지마다
        # 캐시를 덮어쓰지 않는다.
        if update_cache:
            self.policy_cache = policies

            self.cache_updated_at = (
                datetime.now(
                    timezone.utc,
                )
            )

            print(
                "정책 캐시 갱신 완료:",
                self.cache_updated_at,
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
    
    def calculate_policy_statistics(
        self,
        policies: list[Policy],
    ) -> dict[str, int]:
        total = len(policies)

        available = 0
        deadline_approaching = 0
        closed = 0
        date_unknown = 0

        for policy in policies:
            _, deadline_status = (
                self.calculate_days_left(
                    policy.end_date,
                )
            )

            if deadline_status == "접수 마감":
                closed += 1
                continue

            if deadline_status in {
                "마감일 확인 필요",
                "마감일 형식 확인 필요",
            }:
                date_unknown += 1
                continue

            available += 1

            if deadline_status in {
                "오늘 마감",
                "마감 임박",
                "일주일 이내 마감",
            }:
                deadline_approaching += 1

        return {
            "total": total,
            "available": available,
            "deadline_approaching":
                deadline_approaching,
            "closed": closed,
            "date_unknown": date_unknown,
        }
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
    def calculate_score(
        self,
        policy: Policy,
        user: UserProfile,
    ) -> tuple[int, list[str]]:
        score = 0
        reasons: list[str] = []

        # =========================
        # 사용자 정보 정규화
        # =========================

        user_region = (
            user.region.strip().lower()
            if user.region
            else ""
        )

        user_support_type = (
            user.support_type.strip().lower()
            if user.support_type
            else ""
        )

        normalized_user_targets = [
            target.strip().lower()
            for target in (user.targets or [])
            if target.strip()
        ]

        normalized_user_interests = [
            interest.strip().lower()
            for interest in (user.interests or [])
            if interest.strip()
        ]

        # =========================
        # 정책 정보 정규화
        # =========================

        policy_regions = [
            region.strip().lower()
            for region in (policy.regions or [])
            if region.strip()
        ]

        policy_targets = [
            target.strip().lower()
            for target in (policy.targets or [])
            if target.strip()
        ]

        policy_support_types = [
            support_type.strip().lower()
            for support_type in (
                policy.support_types or []
            )
            if support_type.strip()
        ]

        searchable_text = " ".join(
            [
                policy.title or "",
                policy.description or "",
                policy.organization or "",
                policy.original_target_text or "",
                " ".join(policy.keywords or []),
                " ".join(policy.targets or []),
                " ".join(policy.support_types or []),
                " ".join(policy.regions or []),
            ]
        ).lower()

        # =========================
        # 1. 지역 점수
        # 최대 25점
        # =========================

        region_matched = (
            user_region
            and any(
                user_region in region
                or region in user_region
                for region in policy_regions
            )
        )

        if region_matched:
            score += 25

            reasons.append(
                "희망 지역과 지원 가능 지역이 일치합니다."
            )

        elif "전국" in policy_regions:
            score += 15

            reasons.append(
                "전국에서 신청할 수 있는 공고입니다."
            )

        elif policy_regions:
            score -= 5

        # =========================
        # 2. 지원 대상 점수
        # 대상 하나당 15점
        # 최대 30점
        # =========================

        matched_targets: list[str] = []

        for original_target in user.targets or []:
            normalized_target = (
                original_target.strip().lower()
            )

            if not normalized_target:
                continue

            target_matched = any(
                normalized_target in policy_target
                or policy_target in normalized_target
                for policy_target in policy_targets
            )

            if target_matched:
                matched_targets.append(
                    original_target
                )

        matched_targets = list(
            dict.fromkeys(matched_targets)
        )

        if matched_targets:
            target_score = min(
                len(matched_targets) * 15,
                30,
            )

            score += target_score

            reasons.append(
                "현재 상황과 지원 대상이 일치합니다: "
                + ", ".join(matched_targets)
            )

        # =========================
        # 3. 지원 유형 점수
        # 최대 20점
        # =========================

        support_type_matched = (
            user_support_type
            and any(
                user_support_type in support_type
                or support_type in user_support_type
                for support_type
                in policy_support_types
            )
        )

        if support_type_matched:
            score += 20

            reasons.append(
                f"원하는 지원 유형인 "
                f"'{user.support_type}'과 일치합니다."
            )

        # =========================
        # 4. 관심 분야 점수
        # 관심 분야 하나당 5점
        # 최대 15점
        # =========================

        matched_interests: list[str] = []

        for original_interest in (
            user.interests or []
        ):
            normalized_interest = (
                original_interest.strip().lower()
            )

            if not normalized_interest:
                continue

            interest_keywords = [
                keyword
                for keyword
                in normalized_interest.split()
                if keyword
            ]

            interest_matched = any(
                keyword in searchable_text
                for keyword in interest_keywords
            )

            if interest_matched:
                matched_interests.append(
                    original_interest
                )

        matched_interests = list(
            dict.fromkeys(matched_interests)
        )

        if matched_interests:
            interest_score = min(
                len(matched_interests) * 5,
                15,
            )

            score += interest_score

            reasons.append(
                "관심 분야와 관련된 공고입니다: "
                + ", ".join(matched_interests)
            )

        # =========================
        # 5. 연령 점수
        # 최대 10점
        # =========================

        has_age_condition = (
            policy.age_min is not None
            or policy.age_max is not None
        )

        age_matches = True

        if (
            policy.age_min is not None
            and user.age < policy.age_min
        ):
            age_matches = False

        if (
            policy.age_max is not None
            and user.age > policy.age_max
        ):
            age_matches = False

        if has_age_condition and age_matches:
            score += 10

            reasons.append(
                "연령 조건을 충족합니다."
            )

        # =========================
        # 6. 마감일 가중치
        # 최대 5점
        # =========================

        days_left, deadline_status = (
            self.calculate_days_left(
                policy.end_date
            )
        )

        if deadline_status == "오늘 마감":
            score += 5

            reasons.append(
                "오늘 마감되는 공고입니다."
            )

        elif deadline_status == "마감 임박":
            score += 3

            reasons.append(
                "마감이 임박한 공고입니다."
            )

        elif deadline_status == "일주일 이내 마감":
            score += 1

            reasons.append(
                "일주일 이내에 마감되는 공고입니다."
            )

        # =========================
        # 최종 점수 정리
        # =========================

        reasons = list(
            dict.fromkeys(reasons)
        )

        final_score = max(
            0,
            min(score, 100),
        )

        return final_score, reasons
    def calculate_grade(
        self,
        score: int,
    ) -> str:
        if score >= 90:
            return "S"

        if score >= 80:
            return "A"

        if score >= 65:
            return "B"

        if score >= 50:
            return "C"

        return "D"
    def recommend(
        self,
        policies: list[Policy],
        user: UserProfile,
    ) -> list[Recommendation]:
        results: list[Recommendation] = []

        for policy in policies:
            # =========================
            # 추천 점수 계산
            # =========================

            score, recommend_reasons = (
                self.calculate_score(
                    policy=policy,
                    user=user,
                )
            )

            # =========================
            # 신청 가능성 평가
            # =========================

            (
                eligibility,
                matched,
                unknown,
                failed,
            ) = self.evaluate_eligibility(
                policy=policy,
                user=user,
            )

            # 연령 등 필수 조건이 맞지 않는 경우 제외
            if eligibility == "신청 어려움":
                continue

            # 추천 점수가 너무 낮은 경우 제외
            if score < 25:
                continue

            # =========================
            # 마감일 계산
            # =========================

            days_left, deadline_status = (
                self.calculate_days_left(
                    policy.end_date
                )
            )

            # 사용자가 마감 공고 제외를 선택한 경우
            if (
                user.exclude_closed
                and deadline_status == "접수 마감"
            ):
                continue

            # =========================
            # 준비 체크리스트 생성
            # =========================

            checklist = (
                self.create_preparation_checklist(
                    policy
                )
            )

            # =========================
            # 추천 결과 생성
            # =========================

            grade = self.calculate_grade(score)

            results.append(
                Recommendation(
                    score=score,
                    grade=grade,
            summary=self.summarize_policy(
                    policy,
                ),
                    eligibility=eligibility,

                    recommend_reasons=list(
                        dict.fromkeys(
                            recommend_reasons
                        )
                    ),

                    matched_conditions=list(
                        dict.fromkeys(matched)
                    ),

                    unknown_conditions=list(
                        dict.fromkeys(unknown)
                    ),

                    failed_conditions=list(
                        dict.fromkeys(failed)
                    ),

                    days_left=days_left,
                    deadline_status=deadline_status,

                    preparation_checklist=checklist,

                    policy=policy,
                )
            )

        # =========================
        # 신청 가능성 우선순위
        # =========================

        status_priority = {
            "신청 가능성 높음": 3,
            "조건 확인 필요": 2,
            "신청 어려움": 1,
        }

        # =========================
        # 결과 정렬
        #
        # 1. 접수 마감 정책을 아래로
        # 2. 신청 가능성이 높은 정책 우선
        # 3. 추천 점수가 높은 정책 우선
        # 4. 마감일이 가까운 정책 우선
        # =========================

        results.sort(
            key=lambda result: (
                0
                if result.eligibility
                == "신청 가능성 높음"
                else 1,

                -result.score,
            )
        )

        return results
    
    def is_cache_valid(self) -> bool:
        if not self.policy_cache:
            return False

        if self.cache_updated_at is None:
            return False

        updated_at = self.cache_updated_at

        if updated_at.tzinfo is None:
            updated_at = updated_at.replace(
                tzinfo=timezone.utc,
            )

        current_time = datetime.now(
            timezone.utc,
        )

        return (
            current_time - updated_at
            < self.cache_duration
        )
    def evaluate_eligibility(
        self,
        policy: Policy,
        user: UserProfile,
    ) -> tuple[
        str,
        list[str],
        list[str],
        list[str],
    ]:
        matched: list[str] = []
        unknown: list[str] = []
        failed: list[str] = []

        # =========================
        # 연령 조건
        # =========================

        has_age_condition = (
            policy.age_min is not None
            or policy.age_max is not None
        )

        if has_age_condition:
            age_matches = True

            if (
                policy.age_min is not None
                and user.age < policy.age_min
            ):
                age_matches = False

            if (
                policy.age_max is not None
                and user.age > policy.age_max
            ):
                age_matches = False

            if age_matches:
                matched.append(
                    "연령 조건을 충족합니다."
                )
            else:
                failed.append(
                    "연령 조건을 충족하지 않습니다."
                )
        else:
            unknown.append(
                "연령 조건을 확인해야 합니다."
            )

        # =========================
        # 지역 조건
        # =========================

        user_region = (
            user.region.strip().lower()
        )

        policy_regions = [
            region.strip().lower()
            for region in (
                policy.regions or []
            )
            if region.strip()
        ]

        if not policy_regions:
            unknown.append(
                "지원 가능 지역을 확인해야 합니다."
            )

        elif "전국" in policy_regions:
            matched.append(
                "전국에서 신청할 수 있습니다."
            )

        elif user_region and any(
            user_region in region
            or region in user_region
            for region in policy_regions
        ):
            matched.append(
                "희망 지역과 일치합니다."
            )

        else:
            unknown.append(
                "희망 지역과 다를 수 있으므로 "
                "지원 가능 지역을 확인해야 합니다."
            )

        # =========================
        # 지원 대상 조건
        # =========================

        policy_targets = [
            target.strip().lower()
            for target in (
                policy.targets or []
            )
            if target.strip()
        ]

        normalized_user_targets = [
            target.strip().lower()
            for target in user.targets
            if target.strip()
        ]

        if not policy_targets:
            unknown.append(
                "지원 대상 조건을 확인해야 합니다."
            )

        elif not normalized_user_targets:
            unknown.append(
                "사용자의 현재 상황 정보가 부족합니다."
            )

        else:
            matched_targets: list[str] = []

            for user_target in normalized_user_targets:
                if any(
                    user_target in policy_target
                    or policy_target in user_target
                    for policy_target in policy_targets
                ):
                    matched_targets.append(
                        user_target
                    )

            if matched_targets:
                matched.append(
                    "현재 상황과 지원 대상이 일치합니다."
                )
            else:
                unknown.append(
                    "지원 대상에 해당하는지 "
                    "세부 조건을 확인해야 합니다."
                )

        # =========================
        # 최종 신청 가능성 판정
        # =========================

        if failed:
            eligibility = "신청 어려움"

        elif unknown:
            eligibility = "조건 확인 필요"

        else:
            eligibility = "신청 가능성 높음"

        return (
            eligibility,
            matched,
            unknown,
            failed,
        )
    def calculate_days_left(
        self,
        end_date: str | None,
    ) -> tuple[int | None, str]:
        if not end_date:
            return None, "마감일 확인 필요"

        try:
            deadline = datetime.strptime(
                end_date,
                "%Y-%m-%d",
            ).date()
        except ValueError:
            return None, "마감일 형식 확인 필요"

        today = date.today()
        days_left = (deadline - today).days

        if days_left < 0:
            return days_left, "접수 마감"

        if days_left == 0:
            return 0, "오늘 마감"

        if days_left <= 3:
            return days_left, "마감 임박"

        if days_left <= 7:
            return days_left, "일주일 이내 마감"

        if days_left <= 14:
            return days_left, "2주 이내 마감"

        return days_left, "접수 가능"
    def create_preparation_checklist(
        self,
        policy: Policy,
    ) -> list[str]:
        checklist: list[str] = []

        if policy.required_documents:
            for document in policy.required_documents:
                checklist.append(
                    f"{document} 준비"
                )
        else:
            checklist.append(
                "공고 원문에서 제출서류 확인"
            )

        if not policy.original_target_text:
            checklist.append(
                "신청 대상 세부 조건 확인"
            )

        if (
            policy.age_min is None
            and policy.age_max is None
        ):
            checklist.append(
                "연령 제한 여부 확인"
            )

        if not policy.regions:
            checklist.append(
                "지역 제한 여부 확인"
            )

        checklist.extend(
            [
                "신청서 작성",
                "개인정보 제공 동의서 확인",
                "제출 전 원문 공고 최종 확인",
            ]
        )

        return list(dict.fromkeys(checklist))
    def summarize_policy(
        self,
        policy: Policy,
    ) -> str:

        description = (
            policy.description
            or ""
        ).strip()

        if not description:

            return "정책 내용을 확인해 주세요."

        description = (
            description
            .replace("\n", " ")
            .replace("\r", " ")
        )

        while "  " in description:
            description = description.replace(
                "  ",
                " ",
            )

        if len(description) <= 90:
            return description

        return (
            description[:90].rstrip()
            + "..."
        )
    @property
    def cache_minutes(self) -> int:
        return int(
            self.cache_duration
            .total_seconds()
            / 60
        )
    def clear_cache(self) -> None:
        self.policy_cache.clear()
        self.cache_updated_at = None
        def get_cache_status(
        self,
        ) -> dict[str, object]:
            return {
                "cached_count": len(
                    self.policy_cache,
                ),
                "updated_at": (
                    self.cache_updated_at
                    .isoformat()
                    if self.cache_updated_at
                    else None
                ),
                "is_valid": (
                    self.is_cache_valid()
                ),
                "cache_minutes": (
                    self.cache_minutes
                ),
            }