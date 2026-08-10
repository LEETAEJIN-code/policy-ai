import type {
    Recommendation,
} from "../types/recommendation";

import type {
    RecommendationSort,
} from "../types/recommendationSort";

const DEADLINE_PRIORITY:
    Record<string, number> = {
        "오늘 마감": 1,
        "마감 임박": 2,
        "3일 이내 마감": 3,
        "일주일 이내 마감": 4,
        "7일 이내 마감": 5,
        "접수 중": 6,
        "상시 접수": 7,
        "마감일 확인 필요": 8,
        "접수 마감": 9,
        "마감": 10,
    };

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

    return (
        DEADLINE_PRIORITY[
            deadlineStatus
        ] ?? 99
    );
}

export function sortRecommendations(
    recommendations: Recommendation[],
    sort: RecommendationSort,
): Recommendation[] {
    const sortedRecommendations = [
        ...recommendations,
    ];

    switch (sort) {
        case "available_first":
            return sortedRecommendations.sort(
                (first, second) => {
                    const priorityDifference =
                        getEligibilityPriority(first)
                        - getEligibilityPriority(second);

                    if (
                        priorityDifference !== 0
                    ) {
                        return priorityDifference;
                    }

                    return (
                        second.score
                        - first.score
                    );
                },
            );

        case "deadline_first":
            return sortedRecommendations.sort(
                (first, second) => {
                    const priorityDifference =
                        getDeadlinePriority(first)
                        - getDeadlinePriority(second);

                    if (
                        priorityDifference !== 0
                    ) {
                        return priorityDifference;
                    }

                    return (
                        second.score
                        - first.score
                    );
                },
            );

        case "title_asc":
            return sortedRecommendations.sort(
                (first, second) =>
                    first.policy.title.localeCompare(
                        second.policy.title,
                        "ko",
                    ),
            );

        case "score_desc":
        default:
            return sortedRecommendations.sort(
                (first, second) =>
                    second.score - first.score,
            );
    }
}