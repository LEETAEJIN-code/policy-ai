import type {
    Recommendation,
} from "../types/recommendation";

export interface RecommendationCompareAnalysis {
    highestScoreRecommendation:
        Recommendation | null;

    mostEligibleRecommendation:
        Recommendation | null;

    leastCheckRequiredRecommendation:
        Recommendation | null;

    earliestDeadlineRecommendation:
        Recommendation | null;

    summary: string;
}

function getCheckRequiredCount(
    recommendation: Recommendation,
): number {
    return (
        recommendation
            .unknown_conditions
            .length
        + recommendation
            .failed_conditions
            .length
    );
}

function getEligibilityPriority(
    recommendation: Recommendation,
): number {
    const eligibility =
        recommendation.eligibility
            .trim()
            .toLowerCase();

    if (
        eligibility.includes("신청 가능")
        || eligibility.includes("지원 가능")
        || eligibility === "available"
    ) {
        return 1;
    }

    if (
        eligibility.includes("확인")
        || eligibility.includes("검토")
        || eligibility === "check_required"
    ) {
        return 2;
    }

    return 3;
}

function getDeadlinePriority(
    recommendation: Recommendation,
): number {
    const deadlineStatus =
        recommendation.deadline_status
            .trim();

    const priorityMap:
        Record<string, number> = {
            "오늘 마감": 1,
            "마감 임박": 2,
            "3일 이내 마감": 3,
            "일주일 이내 마감": 4,
            "7일 이내 마감": 5,
            "접수 중": 6,
            "상시 접수": 7,
            "마감일 확인 필요": 8,
            "접수 마감": 99,
            "마감": 99,
        };

    return (
        priorityMap[deadlineStatus]
        ?? 50
    );
}

function findHighestScore(
    recommendations: Recommendation[],
): Recommendation | null {
    if (recommendations.length === 0) {
        return null;
    }

    return recommendations.reduce(
        (best, current) =>
            current.score > best.score
                ? current
                : best,
    );
}

function findMostEligible(
    recommendations: Recommendation[],
): Recommendation | null {
    if (recommendations.length === 0) {
        return null;
    }

    return [...recommendations].sort(
        (first, second) => {
            const eligibilityDifference =
                getEligibilityPriority(first)
                - getEligibilityPriority(second);

            if (
                eligibilityDifference !== 0
            ) {
                return eligibilityDifference;
            }

            return (
                second.score
                - first.score
            );
        },
    )[0];
}

function findLeastCheckRequired(
    recommendations: Recommendation[],
): Recommendation | null {
    if (recommendations.length === 0) {
        return null;
    }

    return [...recommendations].sort(
        (first, second) => {
            const checkDifference =
                getCheckRequiredCount(first)
                - getCheckRequiredCount(second);

            if (checkDifference !== 0) {
                return checkDifference;
            }

            return (
                second.score
                - first.score
            );
        },
    )[0];
}

function findEarliestDeadline(
    recommendations: Recommendation[],
): Recommendation | null {
    const activeRecommendations =
        recommendations.filter(
            (recommendation) =>
                getDeadlinePriority(
                    recommendation,
                ) < 99,
        );

    if (
        activeRecommendations.length
        === 0
    ) {
        return null;
    }

    return [
        ...activeRecommendations,
    ].sort(
        (first, second) =>
            getDeadlinePriority(first)
            - getDeadlinePriority(second),
    )[0];
}

function createSummary(
    highestScoreRecommendation:
        Recommendation | null,

    mostEligibleRecommendation:
        Recommendation | null,

    leastCheckRequiredRecommendation:
        Recommendation | null,
): string {
    if (!highestScoreRecommendation) {
        return "비교할 정책이 없습니다.";
    }

    const highestTitle =
        highestScoreRecommendation
            .policy.title;

    const mostEligibleTitle =
        mostEligibleRecommendation
            ?.policy.title;

    const leastCheckTitle =
        leastCheckRequiredRecommendation
            ?.policy.title;

    if (
        highestTitle === mostEligibleTitle
        && highestTitle
            === leastCheckTitle
    ) {
        return (
            `"${highestTitle}"은 추천 점수가 가장 높고, `
            + "신청 가능성과 확인 조건 측면에서도 가장 유리합니다. "
            + "이 정책을 먼저 자세히 확인하는 것을 권장합니다."
        );
    }

    if (
        highestTitle
        === mostEligibleTitle
    ) {
        return (
            `"${highestTitle}"은 추천 점수가 가장 높고 `
            + "신청 가능성도 우수합니다. "
            + "다만 신청 전 확인 필요 조건을 함께 검토하세요."
        );
    }

    return (
        `"${highestTitle}"의 추천 점수가 가장 높습니다. `
        + `신청 가능성은 "${mostEligibleTitle ?? highestTitle}"이 더 유리할 수 있으므로 `
        + "점수뿐 아니라 확인 조건과 마감 상태를 함께 비교하세요."
    );
}

export function analyzeRecommendationCompare(
    recommendations: Recommendation[],
): RecommendationCompareAnalysis {
    const highestScoreRecommendation =
        findHighestScore(
            recommendations,
        );

    const mostEligibleRecommendation =
        findMostEligible(
            recommendations,
        );

    const leastCheckRequiredRecommendation =
        findLeastCheckRequired(
            recommendations,
        );

    const earliestDeadlineRecommendation =
        findEarliestDeadline(
            recommendations,
        );

    return {
        highestScoreRecommendation,
        mostEligibleRecommendation,
        leastCheckRequiredRecommendation,
        earliestDeadlineRecommendation,

        summary: createSummary(
            highestScoreRecommendation,
            mostEligibleRecommendation,
            leastCheckRequiredRecommendation,
        ),
    };
}

export function getRecommendationCheckCount(
    recommendation: Recommendation,
): number {
    return getCheckRequiredCount(
        recommendation,
    );
}