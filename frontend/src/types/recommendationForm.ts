export interface InterestOption {
    value: string;
    label: string;
}

export interface RecommendationFormData {
    age: string;
    region: string;
    targets: string[];
    interests: string[];
    supportType: string;
}

export const initialRecommendationFormData: RecommendationFormData = {
    age: "",
    region: "",
    targets: [],
    interests: [],
    supportType: "",
};

/**
 * 새 추천 API 코드와 호환하기 위한 타입 별칭.
 * 현재 화면 컴포넌트에서는 RecommendationFormData를 기준으로 사용한다.
 */
export type RecommendationFormValues =
    RecommendationFormData;