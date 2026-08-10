import type {
    RecommendationSortOption,
} from "../types/recommendationSort";

export const RECOMMEND_SORT_OPTIONS:
    RecommendationSortOption[] = [
        {
            value: "score_desc",
            label: "추천 점수 높은 순",
        },
        {
            value: "available_first",
            label: "신청 가능 우선",
        },
        {
            value: "deadline_first",
            label: "마감 임박 순",
        },
        {
            value: "title_asc",
            label: "정책명 가나다순",
        },
    ];