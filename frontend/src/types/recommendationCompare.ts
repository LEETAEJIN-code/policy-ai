import type {
    Recommendation,
} from "./recommendation";

export const MAX_COMPARE_COUNT = 3;

export interface RecommendationCompareState {
    selectedRecommendations:
        Recommendation[];
}

export interface RecommendationCompareActions {
    addRecommendation: (
        recommendation: Recommendation,
    ) => boolean;

    removeRecommendation: (
        policyId: string,
    ) => void;

    toggleRecommendation: (
        recommendation: Recommendation,
    ) => boolean;

    clearRecommendations: () => void;

    isSelected: (
        policyId: string,
    ) => boolean;
}