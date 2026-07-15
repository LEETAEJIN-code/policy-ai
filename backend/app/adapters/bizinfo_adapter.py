import re
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.models.policy import (
    AgeCondition,
    ApplicationPeriod,
    Policy,
    SupportInformation,
)


class BizInfoAdapter:
    SOURCE_NAME = "기업마당"

    def normalize(self, raw: Dict[str, Any]) -> Policy:
        target_text = raw.get("trgetNm", "")

        return Policy(
            id=f"bizinfo-{raw.get('pblancId')}",
            title=raw.get("pblancNm", "제목 없음"),
            summary=raw.get("bsnsSumryCn"),
            organization=raw.get("jrsdInsttNm"),
            source=self.SOURCE_NAME,
            source_id=raw.get("pblancId"),
            source_url=raw.get("detailUrl"),
            application_period=self.parse_period(
                raw.get("reqstBeginEndDe")
            ),
            regions=self.extract_regions(target_text),
            target_groups=self.extract_target_groups(target_text),
            categories=self.extract_categories(
                raw.get("pblancNm", ""),
                raw.get("bsnsSumryCn", ""),
            ),
            age_condition=self.extract_age(target_text),
            support=SupportInformation(
                types=self.extract_support_types(
                    raw.get("bsnsSumryCn", "")
                ),
                amount_text=raw.get("supportAmount"),
            ),
            original_target_text=target_text,
        )

    def parse_period(
        self,
        period_text: Optional[str],
    ) -> ApplicationPeriod:
        if not period_text:
            return ApplicationPeriod()

        dates = re.findall(r"\d{8}", period_text)

        if len(dates) < 2:
            return ApplicationPeriod()

        return ApplicationPeriod(
            start=datetime.strptime(
                dates[0],
                "%Y%m%d",
            ).date(),
            end=datetime.strptime(
                dates[1],
                "%Y%m%d",
            ).date(),
        )

    def extract_age(self, text: str) -> AgeCondition:
        pattern = r"만\s*(\d+)세\s*이상\s*(\d+)세\s*이하"
        match = re.search(pattern, text)

        if not match:
            return AgeCondition(status="unknown")

        return AgeCondition(
            min_age=int(match.group(1)),
            max_age=int(match.group(2)),
            status="extracted",
        )

    def extract_regions(self, text: str) -> List[str]:
        region_aliases = {
            "서울": ["서울", "서울특별시"],
            "부산": ["부산", "부산광역시"],
            "대전": ["대전", "대전광역시"],
            "대구": ["대구", "대구광역시"],
            "광주": ["광주", "광주광역시"],
            "인천": ["인천", "인천광역시"],
            "울산": ["울산", "울산광역시"],
            "세종": ["세종", "세종특별자치시"],
            "경기": ["경기", "경기도"],
            "강원": ["강원", "강원특별자치도"],
            "충북": ["충북", "충청북도"],
            "충남": ["충남", "충청남도"],
            "전북": ["전북", "전북특별자치도"],
            "전남": ["전남", "전라남도"],
            "경북": ["경북", "경상북도"],
            "경남": ["경남", "경상남도"],
            "제주": ["제주", "제주특별자치도"],
        }

        results: List[str] = []

        for standard_name, aliases in region_aliases.items():
            if any(alias in text for alias in aliases):
                results.append(standard_name)

        if "전국" in text:
            return ["전국"]

        return results

    def extract_target_groups(self, text: str) -> List[str]:
        keyword_map = {
            "대학생": ["대학생", "대학 재학생", "재학생", "휴학생"],
            "예비창업자": ["예비창업자", "사업자 미등록자"],
            "초기창업자": ["초기창업자", "창업 3년 이내"],
            "청년": ["청년"],
        }

        results: List[str] = []

        for group, keywords in keyword_map.items():
            if any(keyword in text for keyword in keywords):
                results.append(group)

        return results

    def extract_categories(
        self,
        title: str,
        summary: str,
    ) -> List[str]:
        combined = f"{title} {summary}"

        keyword_map = {
            "인공지능": ["AI", "인공지능"],
            "창업": ["창업", "사업화"],
            "교육": ["교육", "멘토링"],
            "디지털": ["디지털", "소프트웨어", "SW"],
        }

        results: List[str] = []

        for category, keywords in keyword_map.items():
            if any(keyword.lower() in combined.lower() for keyword in keywords):
                results.append(category)

        return results

    def extract_support_types(self, summary: str) -> List[str]:
        keyword_map = {
            "사업화 자금": ["사업화 자금", "지원금"],
            "교육": ["교육"],
            "멘토링": ["멘토링"],
        }

        results: List[str] = []

        for support_type, keywords in keyword_map.items():
            if any(keyword in summary for keyword in keywords):
                results.append(support_type)

        return results