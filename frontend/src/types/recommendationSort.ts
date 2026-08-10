export type RecommendationSort =
    | "score_desc"
    | "available_first"
    | "deadline_first"
    | "title_asc";

export interface RecommendationSortOption {
    value: RecommendationSort;
    label: string;
}