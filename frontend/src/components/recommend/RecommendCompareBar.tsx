import type {
    Recommendation,
} from "../../types/recommendation";

import {
    MAX_COMPARE_COUNT,
} from "../../types/recommendationCompare";

interface RecommendCompareBarProps {
    recommendations:
        Recommendation[];

    onRemove: (
        policyId: string,
    ) => void;

    onClear: () => void;
    onCompare: () => void;
}

function RecommendCompareBar({
    recommendations,
    onRemove,
    onClear,
    onCompare,
}: RecommendCompareBarProps) {
    if (recommendations.length === 0) {
        return null;
    }

    const canCompare =
        recommendations.length >= 2;

    return (
        <aside
            className="recommend-compare-bar"
            aria-label="정책 비교 목록"
        >
            <div className="recommend-compare-bar__inner">
                <div className="recommend-compare-bar__heading">
                    <strong>
                        정책 비교
                    </strong>

                    <span>
                        {recommendations.length}
                        /{MAX_COMPARE_COUNT}개 선택
                    </span>
                </div>

                <div className="recommend-compare-bar__items">
                    {recommendations.map(
                        (recommendation) => (
                            <div
                                key={
                                    recommendation
                                        .policy.id
                                }
                                className="recommend-compare-bar__item"
                            >
                                <span>
                                    {
                                        recommendation
                                            .policy.title
                                    }
                                </span>

                                <button
                                    type="button"
                                    aria-label={
                                        `${recommendation.policy.title} 비교 목록에서 제거`
                                    }
                                    onClick={() =>
                                        onRemove(
                                            recommendation
                                                .policy.id,
                                        )
                                    }
                                >
                                    ×
                                </button>
                            </div>
                        ),
                    )}
                </div>

                <div className="recommend-compare-bar__actions">
                    <button
                        type="button"
                        className="recommend-compare-clear"
                        onClick={onClear}
                    >
                        전체 비우기
                    </button>

                    <button
                        type="button"
                        className="recommend-compare-open"
                        disabled={!canCompare}
                        onClick={onCompare}
                    >
                        {canCompare
                            ? "선택 정책 비교하기"
                            : "2개 이상 선택하세요"}
                    </button>
                </div>
            </div>
        </aside>
    );
}

export default RecommendCompareBar;