import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    RECOMMEND_COMPARE_EXPIRE_MS,
    RECOMMEND_COMPARE_STORAGE_KEY,
    RECOMMEND_COMPARE_STORAGE_VERSION,
} from "../constants/recommendCompareStorage";

import type {
    Recommendation,
} from "../types/recommendation";

import {
    MAX_COMPARE_COUNT,
} from "../types/recommendationCompare";

interface ToggleRecommendationResult {
    selected: boolean;
    limitReached: boolean;
}

interface StoredCompareState {
    version: number;
    savedAt: number;
    recommendations: Recommendation[];
}

interface UseRecommendationCompareReturn {
    selectedRecommendations:
        Recommendation[];

    selectedCount: number;
    isCompareFull: boolean;

    toggleRecommendation: (
        recommendation: Recommendation,
    ) => ToggleRecommendationResult;

    removeRecommendation: (
        policyId: string,
    ) => void;

    clearRecommendations: () => void;

    isSelected: (
        policyId: string,
    ) => boolean;
}

function isRecord(
    value: unknown,
): value is Record<string, unknown> {
    return (
        typeof value === "object"
        && value !== null
        && !Array.isArray(value)
    );
}

function isStoredRecommendation(
    value: unknown,
): value is Recommendation {
    if (!isRecord(value)) {
        return false;
    }

    if (!isRecord(value.policy)) {
        return false;
    }

    return (
        typeof value.score === "number"
        && typeof value.grade === "string"
        && typeof value.eligibility === "string"
        && typeof value.deadline_status
            === "string"
        && typeof value.policy.id
            === "string"
        && typeof value.policy.title
            === "string"
    );
}

function isStoredCompareState(
    value: unknown,
): value is StoredCompareState {
    if (!isRecord(value)) {
        return false;
    }

    return (
        value.version
            === RECOMMEND_COMPARE_STORAGE_VERSION
        && typeof value.savedAt === "number"
        && Array.isArray(
            value.recommendations,
        )
        && value.recommendations.every(
            isStoredRecommendation,
        )
    );
}

function loadStoredRecommendations():
    Recommendation[] {
    try {
        const storedValue =
            window.sessionStorage.getItem(
                RECOMMEND_COMPARE_STORAGE_KEY,
            );

        if (!storedValue) {
            return [];
        }

        const parsedValue: unknown =
            JSON.parse(storedValue);

        if (
            !isStoredCompareState(
                parsedValue,
            )
        ) {
            window.sessionStorage.removeItem(
                RECOMMEND_COMPARE_STORAGE_KEY,
            );

            return [];
        }

        const isExpired =
            Date.now() - parsedValue.savedAt
            > RECOMMEND_COMPARE_EXPIRE_MS;

        if (isExpired) {
            window.sessionStorage.removeItem(
                RECOMMEND_COMPARE_STORAGE_KEY,
            );

            return [];
        }

        return parsedValue.recommendations
            .slice(0, MAX_COMPARE_COUNT);
    } catch {
        return [];
    }
}

function saveStoredRecommendations(
    recommendations: Recommendation[],
): void {
    try {
        if (recommendations.length === 0) {
            window.sessionStorage.removeItem(
                RECOMMEND_COMPARE_STORAGE_KEY,
            );

            return;
        }

        const storedState:
            StoredCompareState = {
                version:
                    RECOMMEND_COMPARE_STORAGE_VERSION,

                savedAt: Date.now(),

                recommendations:
                    recommendations.slice(
                        0,
                        MAX_COMPARE_COUNT,
                    ),
            };

        window.sessionStorage.setItem(
            RECOMMEND_COMPARE_STORAGE_KEY,
            JSON.stringify(storedState),
        );
    } catch {
        /*
         * sessionStorage 사용이 불가능해도
         * 비교 기능은 그대로 동작하게 한다.
         */
    }
}

export function clearStoredCompareState():
    void {
    try {
        window.sessionStorage.removeItem(
            RECOMMEND_COMPARE_STORAGE_KEY,
        );
    } catch {
        /*
         * 삭제 실패는 화면 동작에
         * 영향을 주지 않는다.
         */
    }
}

export function useRecommendationCompare():
    UseRecommendationCompareReturn {
    const [
        selectedRecommendations,
        setSelectedRecommendations,
    ] = useState<Recommendation[]>(
        loadStoredRecommendations,
    );

    const selectedCount =
        selectedRecommendations.length;

    const isCompareFull =
        selectedCount >= MAX_COMPARE_COUNT;

    const isSelected = useCallback(
        (policyId: string): boolean => {
            return selectedRecommendations.some(
                (recommendation) =>
                    recommendation.policy.id
                    === policyId,
            );
        },
        [selectedRecommendations],
    );

    const toggleRecommendation =
        useCallback(
            (
                recommendation:
                    Recommendation,
            ): ToggleRecommendationResult => {
                const policyId =
                    recommendation.policy.id;

                const alreadySelected =
                    selectedRecommendations.some(
                        (item) =>
                            item.policy.id
                            === policyId,
                    );

                if (alreadySelected) {
                    setSelectedRecommendations(
                        (current) =>
                            current.filter(
                                (item) =>
                                    item.policy.id
                                    !== policyId,
                            ),
                    );

                    return {
                        selected: false,
                        limitReached: false,
                    };
                }

                if (
                    selectedRecommendations.length
                    >= MAX_COMPARE_COUNT
                ) {
                    return {
                        selected: false,
                        limitReached: true,
                    };
                }

                setSelectedRecommendations(
                    (current) => [
                        ...current,
                        recommendation,
                    ],
                );

                return {
                    selected: true,
                    limitReached: false,
                };
            },
            [selectedRecommendations],
        );

    const removeRecommendation =
        useCallback(
            (policyId: string): void => {
                setSelectedRecommendations(
                    (current) =>
                        current.filter(
                            (recommendation) =>
                                recommendation
                                    .policy.id
                                !== policyId,
                        ),
                );
            },
            [],
        );

    const clearRecommendations =
        useCallback((): void => {
            setSelectedRecommendations([]);
            clearStoredCompareState();
        }, []);

    useEffect(() => {
        saveStoredRecommendations(
            selectedRecommendations,
        );
    }, [
        selectedRecommendations,
    ]);

    return useMemo(
        () => ({
            selectedRecommendations,
            selectedCount,
            isCompareFull,

            toggleRecommendation,
            removeRecommendation,
            clearRecommendations,
            isSelected,
        }),
        [
            selectedRecommendations,
            selectedCount,
            isCompareFull,

            toggleRecommendation,
            removeRecommendation,
            clearRecommendations,
            isSelected,
        ],
    );
}