import type {
    Recommendation,
} from "../../types/recommendation";

import RecommendCard from "./RecommendCard";

interface RecommendListProps {
    recommendations: Recommendation[];

    isCompareFull: boolean;

    isCompareSelected: (
        policyId: string,
    ) => boolean;

    onToggleCompare: (
        recommendation: Recommendation,
    ) => void;
}

function RecommendList({
    recommendations,
    isCompareFull,
    isCompareSelected,
    onToggleCompare,
}: RecommendListProps) {
    return (
        <section
            className="recommend-list"
            aria-label="추천 정책 목록"
        >
            {recommendations.map(
                (recommendation) => {
                    const policyId =
                        recommendation.policy.id;

                    const selected =
                        isCompareSelected(policyId);

                    return (
                        <div
                            key={policyId}
                            className={
                                selected
                                    ? "recommend-list-item recommend-list-item--compare-selected"
                                    : "recommend-list-item"
                            }
                        >
                            <RecommendCard
                                recommendation={
                                    recommendation
                                }
                                selected={
                                    selected
                                }
                                isCompareFull={
                                    isCompareFull
                                }
                                onToggleCompare={
                                    onToggleCompare
                                }
                            />
                        </div>
                    );
                },
            )}
        </section>
    );
}

export default RecommendList;