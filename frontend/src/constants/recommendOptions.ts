import type {
    InterestOption,
} from "../types/recommendationForm";

export const REGION_OPTIONS: string[] = [
    "전국",
    "서울",
    "부산",
    "대구",
    "인천",
    "광주",
    "대전",
    "울산",
    "세종",
    "경기",
    "강원",
    "충북",
    "충남",
    "전북",
    "전남",
    "경북",
    "경남",
    "제주",
];

export const TARGET_OPTIONS: string[] = [
    "청년",
    "대학생",
    "취업준비생",
    "재직자",
    "예비창업자",
    "창업자",
    "소상공인",
    "프리랜서",
];

export const INTEREST_OPTIONS: InterestOption[] = [
    {
        value: "employment",
        label: "취업",
    },
    {
        value: "startup",
        label: "창업",
    },
    {
        value: "housing",
        label: "주거",
    },
    {
        value: "education",
        label: "교육",
    },
    {
        value: "finance",
        label: "금융",
    },
    {
        value: "welfare",
        label: "복지",
    },
    {
        value: "culture",
        label: "문화",
    },
];

export const SUPPORT_OPTIONS: string[] = [
    "현금 지원",
    "융자 지원",
    "교육 지원",
    "상담·컨설팅",
    "공간 지원",
    "취업 연계",
];