export interface RecommendationPolicy {
    id: string;
    title: string;
    source: string;
    organization: string | null;
    summary?: string | null;
    target?: string | null;
    support_content?: string | null;
    application_period?: string | null;
    detail_url?: string | null;
}

export interface Recommendation {
    policy: RecommendationPolicy;

    score: number;
    grade: string;
    eligibility: string;
    deadline_status: string;
    summary: string;

    recommend_reasons: string[];
    matched_conditions: string[];
    unknown_conditions: string[];
    failed_conditions: string[];
    preparation_checklist: string[];
}

export interface RecommendationResponse {
    total: number;
    recommendations: Recommendation[];
}

/**
 * 리팩토링 과정에서 사용했던 이름과의 호환성을 위한 별칭.
 * 기존 RecommendCard는 Recommendation을 사용하고,
 * 추천 훅에서는 PolicyRecommendation을 사용할 수 있다.
 */
export type PolicyRecommendation = Recommendation;