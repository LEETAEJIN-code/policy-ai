import {
    RECOMMEND_SORT_OPTIONS,
} from "../../constants/recommendSortOptions";

import type {
    RecommendationFilter,
    RecommendationFilterCount,
} from "../../types/recommendationFilter";

import type {
    RecommendationSort,
} from "../../types/recommendationSort";

interface RecommendSummaryProps {
    selectedFilter: RecommendationFilter;
    selectedSort: RecommendationSort;

    count: RecommendationFilterCount;

    onFilterChange: (
        filter: RecommendationFilter,
    ) => void;

    onSortChange: (
        sort: RecommendationSort,
    ) => void;
}

interface FilterOption {
    value: RecommendationFilter;
    label: string;
    countKey:
        keyof RecommendationFilterCount;
}

const FILTER_OPTIONS: FilterOption[] = [
    {
        value: "all",
        label: "전체",
        countKey: "all",
    },
    {
        value: "available",
        label: "신청 가능",
        countKey: "available",
    },
    {
        value: "check_required",
        label: "조건 확인",
        countKey: "checkRequired",
    },
    {
        value: "deadline_approaching",
        label: "마감 임박",
        countKey: "deadlineApproaching",
    },
];

function RecommendSummary({
    selectedFilter,
    selectedSort,
    count,
    onFilterChange,
    onSortChange,
}: RecommendSummaryProps) {
    return (
        <section
            className="recommend-summary-section"
            aria-label="추천 결과 설정"
        >
            <div className="recommend-summary-toolbar">
                <div>
                    <h2>추천 결과</h2>

                    <p>
                        총 {count.all}개의 정책을
                        분석했습니다.
                    </p>
                </div>

                <label className="recommend-sort-field">
                    <span>정렬</span>

                    <select
                        value={selectedSort}
                        onChange={(event) =>
                            onSortChange(
                                event.target.value as RecommendationSort,
                            )
                        }
                    >
                        {
                            RECOMMEND_SORT_OPTIONS
                                .map((option) => (
                                    <option
                                        key={
                                            option.value
                                        }
                                        value={
                                            option.value
                                        }
                                    >
                                        {option.label}
                                    </option>
                                ))
                        }
                    </select>
                </label>
            </div>

            <div className="recommend-summary">
                <div
                    className="recommend-summary__filters"
                    role="group"
                    aria-label="정책 상태별 필터"
                >
                    {
                        FILTER_OPTIONS.map(
                            (option) => {
                                const isSelected =
                                    selectedFilter
                                    === option.value;

                                return (
                                    <button
                                        key={
                                            option.value
                                        }
                                        type="button"
                                        className={
                                            isSelected
                                                ? "recommend-summary__filter recommend-summary__filter--active"
                                                : "recommend-summary__filter"
                                        }
                                        aria-pressed={
                                            isSelected
                                        }
                                        onClick={() =>
                                            onFilterChange(
                                                option.value,
                                            )
                                        }
                                    >
                                        <span>
                                            {
                                                option
                                                    .label
                                            }
                                        </span>

                                        <strong>
                                            {
                                                count[
                                                    option
                                                        .countKey
                                                ]
                                            }
                                        </strong>
                                    </button>
                                );
                            },
                        )
                    }
                </div>
            </div>
        </section>
    );
}

export default RecommendSummary;