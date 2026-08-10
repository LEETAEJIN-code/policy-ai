import {
    RECOMMEND_SCROLL_STORAGE_KEY,
    RECOMMEND_STORAGE_KEY,
    RECOMMEND_STORAGE_VERSION,
} from "../constants/recommendStorage";

import type {
    Recommendation,
} from "../types/recommendation";

import type {
    RecommendationFilter,
} from "../types/recommendationFilter";

import type {
    RecommendationFormData,
} from "../types/recommendationForm";

import type {
    RecommendationSort,
} from "../types/recommendationSort";


const RECOMMEND_CACHE_DURATION_MS =
    30 * 60 * 1000;


export interface StoredRecommendationState {
    version: number;
    savedAt: number;

    form: RecommendationFormData;
    recommendations: Recommendation[];

    selectedFilter: RecommendationFilter;
    selectedSort: RecommendationSort;
    currentPage: number;

    hasRequested: boolean;
}


const VALID_FILTERS:
    RecommendationFilter[] = [
        "all",
        "available",
        "check_required",
        "deadline_approaching",
    ];


const VALID_SORTS:
    RecommendationSort[] = [
        "score_desc",
        "available_first",
        "deadline_first",
        "title_asc",
    ];


function isRecord(
    value: unknown,
): value is Record<string, unknown> {
    return (
        typeof value === "object"
        && value !== null
        && !Array.isArray(value)
    );
}


function isStringArray(
    value: unknown,
): value is string[] {
    return (
        Array.isArray(value)
        && value.every(
            (item) =>
                typeof item === "string",
        )
    );
}


function isRecommendationFormData(
    value: unknown,
): value is RecommendationFormData {
    if (!isRecord(value)) {
        return false;
    }

    return (
        typeof value.age === "string"
        && typeof value.region === "string"
        && isStringArray(value.targets)
        && isStringArray(value.interests)
        && typeof value.supportType
            === "string"
    );
}


function isRecommendationFilter(
    value: unknown,
): value is RecommendationFilter {
    return (
        typeof value === "string"
        && VALID_FILTERS.includes(
            value as RecommendationFilter,
        )
    );
}


function isRecommendationSort(
    value: unknown,
): value is RecommendationSort {
    return (
        typeof value === "string"
        && VALID_SORTS.includes(
            value as RecommendationSort,
        )
    );
}


function isRecommendationArray(
    value: unknown,
): value is Recommendation[] {
    if (!Array.isArray(value)) {
        return false;
    }

    return value.every((item) => {
        if (!isRecord(item)) {
            return false;
        }

        return (
            typeof item.score === "number"
            && typeof item.grade === "string"
            && typeof item.eligibility
                === "string"
            && typeof item.deadline_status
                === "string"
            && isRecord(item.policy)
            && typeof item.policy.id
                === "string"
            && typeof item.policy.title
                === "string"
        );
    });
}


function isStoredRecommendationState(
    value: unknown,
): value is StoredRecommendationState {
    if (!isRecord(value)) {
        return false;
    }

    return (
        value.version
            === RECOMMEND_STORAGE_VERSION
        && typeof value.savedAt
            === "number"
        && isRecommendationFormData(
            value.form,
        )
        && isRecommendationArray(
            value.recommendations,
        )
        && isRecommendationFilter(
            value.selectedFilter,
        )
        && isRecommendationSort(
            value.selectedSort,
        )
        && typeof value.currentPage
            === "number"
        && Number.isInteger(
            value.currentPage,
        )
        && value.currentPage >= 1
        && typeof value.hasRequested
            === "boolean"
    );
}


function isExpired(
    savedAt: number,
): boolean {
    return (
        Date.now() - savedAt
        > RECOMMEND_CACHE_DURATION_MS
    );
}


export function loadRecommendationState():
    StoredRecommendationState | null {
    try {
        const storedValue =
            window.sessionStorage.getItem(
                RECOMMEND_STORAGE_KEY,
            );

        if (!storedValue) {
            return null;
        }

        const parsedValue: unknown =
            JSON.parse(storedValue);

        if (
            !isStoredRecommendationState(
                parsedValue,
            )
        ) {
            clearRecommendationState();

            return null;
        }

        if (isExpired(parsedValue.savedAt)) {
            clearRecommendationState();

            return null;
        }

        return parsedValue;
    } catch {
        clearRecommendationState();

        return null;
    }
}


export function saveRecommendationState(
    state: Omit<
        StoredRecommendationState,
        "version" | "savedAt"
    >,
): void {
    try {
        const value:
            StoredRecommendationState = {
                version:
                    RECOMMEND_STORAGE_VERSION,

                savedAt:
                    Date.now(),

                form: {
                    ...state.form,

                    targets: [
                        ...state.form.targets,
                    ],

                    interests: [
                        ...state.form.interests,
                    ],
                },

                recommendations: [
                    ...state.recommendations,
                ],

                selectedFilter:
                    state.selectedFilter,

                selectedSort:
                    state.selectedSort,

                currentPage:
                    state.currentPage,

                hasRequested:
                    state.hasRequested,
            };

        window.sessionStorage.setItem(
            RECOMMEND_STORAGE_KEY,
            JSON.stringify(value),
        );
    } catch {
        /*
         * 저장 공간 부족 또는 브라우저 설정으로
         * 저장할 수 없어도 화면 기능은 유지한다.
         */
    }
}


export function clearRecommendationState():
    void {
    try {
        window.sessionStorage.removeItem(
            RECOMMEND_STORAGE_KEY,
        );
    } catch {
        /*
         * 삭제 실패가 화면 동작을 막지 않게 한다.
         */
    }
}


export function saveRecommendationScrollTarget(
    policyId: string,
): void {
    try {
        window.sessionStorage.setItem(
            RECOMMEND_SCROLL_STORAGE_KEY,
            policyId,
        );
    } catch {
        /*
         * 스크롤 위치 저장 실패는
         * 페이지 기능에 영향을 주지 않는다.
         */
    }
}


export function loadRecommendationScrollTarget():
    string | null {
    try {
        return window.sessionStorage.getItem(
            RECOMMEND_SCROLL_STORAGE_KEY,
        );
    } catch {
        return null;
    }
}


export function clearRecommendationScrollTarget():
    void {
    try {
        window.sessionStorage.removeItem(
            RECOMMEND_SCROLL_STORAGE_KEY,
        );
    } catch {
        /*
         * 삭제 실패는 무시한다.
         */
    }
}