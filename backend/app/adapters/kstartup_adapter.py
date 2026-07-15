import html
import re
from datetime import datetime
from typing import Any

from app.models.policy import Policy


class KStartupAdapter:
    SOURCE_NAME = "K-Startup"

    def normalize(
        self,
        item: dict[str, Any],
    ) -> Policy:
        title = self.clean_text(
            item.get("biz_pbanc_nm")
            or item.get("intg_pbanc_biz_nm")
            or ""
        )

        description = self.clean_text(
            item.get("pbanc_ctnt", "")
        )

        target_text = self.clean_text(
            " ".join(
                [
                    str(item.get("aply_trgt", "")),
                    str(item.get("aply_trgt_ctnt", "")),
                    str(item.get("biz_trgt_age", "")),
                    str(item.get("biz_enyy", "")),
                ]
            )
        )

        region_text = self.clean_text(
            item.get("suprt_regin", "")
        )

        support_text = self.clean_text(
            " ".join(
                [
                    str(item.get("suprt_biz_clsfc", "")),
                    title,
                    description,
                ]
            )
        )

        age_min, age_max = self.extract_age(
            item.get("biz_trgt_age", "")
        )

        return Policy(
            id=str(
                item.get("pbanc_sn")
                or item.get("id")
                or ""
            ),
            source=self.SOURCE_NAME,
            title=title,
            organization=self.clean_text(
                item.get("pbanc_ntrp_nm", "")
            ),
            description=description,
            detail_url=self.clean_text(
                item.get("detl_pg_url")
                or item.get("biz_aply_url")
                or ""
            ),
            regions=self.extract_regions(
                region_text
            ),
            targets=self.extract_targets(
                target_text
            ),
            support_types=self.extract_support_types(
                support_text
            ),
            keywords=self.extract_keywords(
                " ".join(
                    [
                        title,
                        region_text,
                        self.clean_text(
                            item.get(
                                "suprt_biz_clsfc",
                                "",
                            )
                        ),
                    ]
                )
            ),
            age_min=age_min,
            age_max=age_max,
            start_date=self.parse_date(
                item.get(
                    "pbanc_rcpt_bgng_dt",
                    "",
                )
            ),
            end_date=self.parse_date(
                item.get(
                    "pbanc_rcpt_end_dt",
                    "",
                )
            ),
            required_documents=[],
            original_target_text=target_text,
            original_period_text=self.make_period_text(
                item
            ),
        )

    def clean_text(self, value: Any) -> str:
        if value is None:
            return ""

        text = html.unescape(str(value))
        text = re.sub(r"<[^>]+>", " ", text)
        text = re.sub(r"\s+", " ", text)

        return text.strip()

    def parse_date(
        self,
        value: Any,
    ) -> str | None:
        text = re.sub(
            r"[^0-9]",
            "",
            str(value or ""),
        )

        if len(text) != 8:
            return None

        try:
            parsed = datetime.strptime(
                text,
                "%Y%m%d",
            )
        except ValueError:
            return None

        return parsed.strftime("%Y-%m-%d")

    def make_period_text(
        self,
        item: dict[str, Any],
    ) -> str:
        start_date = self.parse_date(
            item.get("pbanc_rcpt_bgng_dt", "")
        )

        end_date = self.parse_date(
            item.get("pbanc_rcpt_end_dt", "")
        )

        if start_date and end_date:
            return f"{start_date} ~ {end_date}"

        return start_date or end_date or ""

    def extract_age(
        self,
        value: Any,
    ) -> tuple[int | None, int | None]:
        text = self.clean_text(value)

        ages = [
            int(age)
            for age in re.findall(
                r"만\s*(\d+)\s*세",
                text,
            )
        ]

        if not ages:
            return None, None

        # API가 복수 연령 구간을 쉼표로 제공하는 경우,
        # 가장 낮은 값과 높은 값을 우선 사용한다.
        return min(ages), max(ages)

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
                "재학생",
                "휴학생",
            ],
            "예비창업자": [
                "예비창업자",
                "예비 창업자",
                "사업자 미등록",
            ],
            "초기창업자": [
                "초기창업자",
                "창업 3년 이내",
            ],
            "일반기업": ["일반기업"],
            "중소기업": [
                "중소기업",
                "중소벤처기업",
            ],
            "소상공인": ["소상공인"],
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
                "사업화",
                "융자",
                "보조금",
                "지원금",
            ],
            "교육": [
                "교육",
                "아카데미",
                "역량강화",
            ],
            "멘토링": [
                "멘토링",
                "컨설팅",
            ],
            "기술개발": [
                "기술개발",
                "연구개발",
                "R&D",
            ],
            "판로": [
                "판로",
                "마케팅",
                "수출",
            ],
            "시설·공간": [
                "시설",
                "공간",
                "입주",
            ],
        }

        lowered_text = text.lower()
        results: list[str] = []

        for support_name, keywords in support_map.items():
            if any(
                keyword.lower() in lowered_text
                for keyword in keywords
            ):
                results.append(support_name)

        return results

    def extract_keywords(
        self,
        text: str,
    ) -> list[str]:
        keywords = re.split(
            r"[,#|/·\s]+",
            text,
        )

        return list(
            dict.fromkeys(
                keyword.strip()
                for keyword in keywords
                if len(keyword.strip()) >= 2
            )
        )