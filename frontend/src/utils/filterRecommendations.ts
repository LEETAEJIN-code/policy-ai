import type {
    Recommendation,
} from "../types/recommendation";

import type {
    RecommendationFilter,
    RecommendationFilterCount,
} from "../types/recommendationFilter";

const DEADLINE_APPROACHING_STATUSES =
    new Set<string>([
        "오늘 마감",
        "마감 임박",
        "3일 이내 마감",
        "일주일 이내 마감",
        "7일 이내 마감",
    ]);

function isAvailable(
    recommendation: Recommendation,
): boolean {
    const eligibility =
        recommendation.eligibility
            .trim()
            .toLowerCase();

    return (
        eligibility === "신청 가능"
        || eligibility === "지원 가능"
        || eligibility === "available"
        || eligibility.includes("신청 가능")
    );
}

function isCheckRequired(
    recommendation: Recommendation,
): boolean {
    const eligibility =
        recommendation.eligibility
            .trim()
            .toLowerCase();

    return (
        recommendation
            .unknown_conditions
            .length > 0
        || recommendation
            .failed_conditions
            .length > 0
        || eligibility.includes("확인")
        || eligibility === "check_required"
    );
}

function isDeadlineApproaching(
    recommendation: Recommendation,
): boolean {
    return DEADLINE_APPROACHING_STATUSES.has(
        recommendation.deadline_status.trim(),
    );
}

export function filterRecommendations(
    recommendations: Recommendation[],
    filter: RecommendationFilter,
): Recommendation[] {
    switch (filter) {
        case "available":
            return recommendations.filter(
                isAvailable,
            );

        case "check_required":
            return recommendations.filter(
                isCheckRequired,
            );

        case "deadline_approaching":
            return recommendations.filter(
                isDeadlineApproaching,
            );

        case "all":
        default:
            return recommendations;
    }
}

export function calculateRecommendationFilterCount(
    recommendations: Recommendation[],
): RecommendationFilterCount {
    return recommendations.reduce<
        RecommendationFilterCount
    >(
        (count, recommendation) => {
            count.all += 1;

            if (isAvailable(recommendation)) {
                count.available += 1;
            }

            if (
                isCheckRequired(recommendation)
            ) {
                count.checkRequired += 1;
            }

            if (
                isDeadlineApproaching(
                    recommendation,
                )
            ) {
                count.deadlineApproaching += 1;
            }

            return count;
        },
        {
            all: 0,
            available: 0,
            checkRequired: 0,
            deadlineApproaching: 0,
        },
    );
}