import html
import re
from typing import Any

from app.models.policy import Policy


class BizInfoAdapter:
    SOURCE_NAME = "기업마당"

    def normalize(self, item: dict[str, Any]) -> Policy:
        target_text = self.clean_text(
            item.get("trgetNm", "")
        )

        summary_text = self.clean_text(
            item.get("bsnsSumryCn", "")
        )

        hashtag_text = self.clean_text(
            item.get("hashtags", "")
        )

        period_text = self.clean_text(
            item.get("reqstBeginEndDe", "")
        )

        start_date, end_date = self.extract_period(
            period_text
        )

        age_min, age_max = self.extract_age(
            target_text
        )

        detail_url = (
            item.get("pblancUrl")
            or item.get("detailUrl")
            or ""
        )

        return Policy(
            id=str(
                item.get("pblancId")
                or item.get("id")
                or ""
            ),
            source=self.SOURCE_NAME,
            title=self.clean_text(
                item.get("pblancNm", "제목 없음")
            ),
            organization=self.clean_text(
                item.get("jrsdInsttNm", "")
            ),
            description=summary_text,
            detail_url=detail_url,
            regions=self.extract_regions(
                f"{target_text} {hashtag_text} {summary_text}"
            ),
            targets=self.extract_targets(
                f"{target_text} {hashtag_text}"
            ),
            support_types=self.extract_support_types(
                f"{summary_text} {hashtag_text}"
            ),
            keywords=self.extract_keywords(
                hashtag_text
            ),
            age_min=age_min,
            age_max=age_max,
            start_date=start_date,
            end_date=end_date,
            required_documents=self.extract_documents(
                item
            ),
            original_target_text=target_text,
            original_period_text=period_text,
        )

    def clean_text(self, value: Any) -> str:
        if value is None:
            return ""

        text = str(value)

        # HTML 특수문자 변환
        text = html.unescape(text)

        # HTML 태그 제거
        text = re.sub(
            r"<[^>]+>",
            " ",
            text,
        )

        # 줄바꿈과 여러 공백 정리
        text = re.sub(
            r"\s+",
            " ",
            text,
        )

        return text.strip()

    def extract_period(
        self,
        text: str,
    ) -> tuple[str | None, str | None]:
        dates = re.findall(
            r"\d{4}-\d{2}-\d{2}",
            text,
        )

        if len(dates) >= 2:
            return dates[0], dates[1]

        if len(dates) == 1:
            return dates[0], dates[0]

        return None, None

    def extract_age(
        self,
        text: str,
    ) -> tuple[int | None, int | None]:
        range_pattern = (
            r"만?\s*(\d+)\s*세\s*이상"
            r".*?"
            r"만?\s*(\d+)\s*세\s*이하"
        )

        match = re.search(
            range_pattern,
            text,
        )

        if match:
            return (
                int(match.group(1)),
                int(match.group(2)),
            )

        max_pattern = r"만?\s*(\d+)\s*세\s*이하"
        max_match = re.search(
            max_pattern,
            text,
        )

        if max_match:
            return None, int(max_match.group(1))

        min_pattern = r"만?\s*(\d+)\s*세\s*이상"
        min_match = re.search(
            min_pattern,
            text,
        )

        if min_match:
            return int(min_match.group(1)), None

        return None, None

    def extract_regions(
        self,
        text: str,
    ) -> list[str]:
        if "전국" in text:
            return ["전국"]

        region_map = {
            "서울": ["서울", "서울특별시"],
            "부산": ["부산", "부산광역시"],
            "대구": ["대구", "대구광역시"],
            "인천": ["인천", "인천광역시"],
            "광주": ["광주", "광주광역시"],
            "대전": ["대전", "대전광역시"],
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

        results: list[str] = []

        for standard_name, aliases in region_map.items():
            if any(alias in text for alias in aliases):
                results.append(standard_name)

        return results

    def extract_targets(
        self,
        text: str,
    ) -> list[str]:
        target_map = {
            "청년": ["청년"],
            "대학생": [
                "대학생",
                "대학 재학생",
                "휴학생",
            ],
            "예비창업자": [
                "예비창업자",
                "사업자 미등록",
            ],
            "초기창업자": [
                "초기창업자",
                "창업 3년 이내",
            ],
            "중소기업": [
                "중소기업",
                "중소벤처기업",
            ],
            "소상공인": ["소상공인"],
            "연구기관": ["연구기관"],
        }

        results: list[str] = []

        for target_name, keywords in target_map.items():
            if any(keyword in text for keyword in keywords):
                results.append(target_name)

        return results

    def extract_support_types(
        self,
        text: str,
    ) -> list[str]:
        support_map = {
            "자금": [
                "지원금",
                "사업화 자금",
                "융자",
                "보조금",
            ],
            "교육": [
                "교육",
                "아카데미",
            ],
            "멘토링": [
                "멘토링",
                "컨설팅",
            ],
            "보험료": [
                "보험료",
                "보험",
            ],
            "기술개발": [
                "기술개발",
                "R&D",
                "연구개발",
            ],
            "판로": [
                "판로",
                "수출",
                "마케팅",
            ],
        }

        results: list[str] = []

        for support_name, keywords in support_map.items():
            if any(keyword.lower() in text.lower() for keyword in keywords):
                results.append(support_name)

        return results

    def extract_keywords(
        self,
        text: str,
    ) -> list[str]:
        if not text:
            return []

        keywords = re.split(
            r"[,#|/]+",
            text,
        )

        return list(
            dict.fromkeys(
                keyword.strip()
                for keyword in keywords
                if keyword.strip()
            )
        )

    def extract_documents(
        self,
        item: dict[str, Any],
    ) -> list[str]:
        documents: list[str] = []

        possible_fields = [
            "printFileNm",
            "atchFileNm",
            "fileNm",
        ]

        for field_name in possible_fields:
            value = self.clean_text(
                item.get(field_name, "")
            )

            if value:
                documents.append(value)

        return list(dict.fromkeys(documents))