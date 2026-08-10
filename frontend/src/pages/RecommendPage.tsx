import {
    useCallback,
    useState,
    useEffect,
    useRef,
} from "react";

import ConfirmModal from
    "../components/common/ConfirmModal";

import {
    useToast,
} from "../components/common/toast/useToast";

import RecommendEmpty from
    "../components/recommend/RecommendEmpty";

import RecommendError from
    "../components/recommend/RecommendError";

import RecommendForm from
    "../components/recommend/RecommendForm";

import RecommendHero from
    "../components/recommend/RecommendHero";

import RecommendList from
    "../components/recommend/RecommendList";

import RecommendPagination from
    "../components/recommend/RecommendPagination";

import RecommendSkeleton from
    "../components/recommend/RecommendSkeleton";

import RecommendSummary from
    "../components/recommend/RecommendSummary";

import {
    INTEREST_OPTIONS,
    REGION_OPTIONS,
    SUPPORT_OPTIONS,
    TARGET_OPTIONS,
} from "../constants/recommendOptions";

import {
    useRecommendation,
} from "../hooks/useRecommendation";

import {
    clearRecommendationScrollTarget,
    loadRecommendationScrollTarget,
} from "../utils/recommendStorage";

import RecommendCompareBar from
    "../components/recommend/RecommendCompareBar";

import RecommendCompareModal from
    "../components/recommend/RecommendCompareModal";

import {
    useRecommendationCompare,
} from "../hooks/useRecommendationCompare";

export default function RecommendPage() {
    const toast = useToast();

    const [
        isResetModalOpen,
        setIsResetModalOpen,
    ] = useState(false);

    const [
        isCompareModalOpen,
        setIsCompareModalOpen,
    ] = useState(false);

    const resultSectionRef =
    useRef<HTMLDivElement | null>(null);

    const previousLoadingRef =
    useRef(false);

    const hasRestoredScrollRef =
    useRef(false);

    const {
        form,

        visibleRecommendations,
        paginatedRecommendations,

        selectedFilter,
        filterCount,
        selectedSort,

        currentPage,
        totalPages,
        paginationRange,

        isLoading,
        hasRequested,
        formError,
        errorMessage,

        handleAgeChange,
        handleRegionChange,
        handleToggleTarget,
        handleToggleInterest,
        handleSupportTypeChange,
        handleSubmit,

        handleFilterChange,
        handleSortChange,
        handlePageChange,
        handleResetRecommendation,

        retry,
    } = useRecommendation();
    
    const {
        selectedRecommendations,
        selectedCount,
        isCompareFull,

        toggleRecommendation,
        removeRecommendation,
        clearRecommendations,
        isSelected,

    } = useRecommendationCompare();
    
    const hasRecommendations =
        visibleRecommendations.length > 0;

    const isFiltered =
        selectedFilter !== "all";

    const openResetModal =
        useCallback(() => {
            setIsResetModalOpen(true);
        }, []);

    const closeResetModal =
        useCallback(() => {
            setIsResetModalOpen(false);
        }, []);

   const confirmReset =
        useCallback(() => {
            clearRecommendationScrollTarget();

            clearRecommendations();

            handleResetRecommendation();

            setIsCompareModalOpen(false);
            setIsResetModalOpen(false);
        }, [
            clearRecommendations,
            handleResetRecommendation,
        ]);
        const handleToggleCompare =
    useCallback(
        (
            recommendation:
                Parameters<
                    typeof toggleRecommendation
                >[0],
        ) => {
            const result =
                toggleRecommendation(
                    recommendation,
                );

            if (result.limitReached) {
                toast.warning(
                    "정책은 최대 3개까지 비교할 수 있습니다.",
                );

                return;
            }
        },
        [
            toggleRecommendation,
            toast,
        ],
    );

    const openCompareModal =
        useCallback(() => {
            if (selectedCount < 2) {
                return;
            }

            setIsCompareModalOpen(true);
        }, [
            selectedCount,
        ]);

    const closeCompareModal =
        useCallback(() => {
            setIsCompareModalOpen(false);
        }, []);

    const handleClearCompare =
        useCallback(() => {
            clearRecommendations();
            setIsCompareModalOpen(false);
        }, [
            clearRecommendations,
        ]);
        useEffect(() => {
        const wasLoading =
            previousLoadingRef.current;

        previousLoadingRef.current =
            isLoading;

        if (
            !wasLoading
            || isLoading
            || !hasRequested
            || errorMessage
        ) {
            return;
        }

        if (
            visibleRecommendations.length > 0
        ) {
            toast.success(
                `${visibleRecommendations.length}개의 맞춤 정책을 찾았습니다.`,
            );
        } else {
            toast.info(
                "조건에 맞는 정책을 찾지 못했습니다.",
            );
        }

        const animationFrameId =
            window.requestAnimationFrame(() => {
                resultSectionRef.current
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });
            });

        return () => {
            window.cancelAnimationFrame(
                animationFrameId,
            );
        };
    }, [
        isLoading,
        hasRequested,
        errorMessage,
        toast,
        visibleRecommendations.length,
    ]);

    useEffect(() => {
        if (
            hasRestoredScrollRef.current
            || isLoading
            || !hasRequested
            || paginatedRecommendations.length
                === 0
        ) {
            return;
        }

        const policyId =
            loadRecommendationScrollTarget();

        if (!policyId) {
            hasRestoredScrollRef.current = true;
            return;
        }

        const animationFrameId =
            window.requestAnimationFrame(() => {
                const targetElement =
                    document.getElementById(
                        `recommend-policy-${encodeURIComponent(
                            policyId,
                        )}`,
                    );

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: "auto",
                        block: "center",
                    });

                    targetElement.classList.add(
                        "recommend-result-card--restored",
                    );

                    window.setTimeout(() => {
                        targetElement.classList.remove(
                            "recommend-result-card--restored",
                        );
                    }, 1800);
                }

                clearRecommendationScrollTarget();

                hasRestoredScrollRef.current = true;
            });

        return () => {
            window.cancelAnimationFrame(
                animationFrameId,
            );
        };
    }, [
        isLoading,
        hasRequested,
        paginatedRecommendations,
    ]);
    return (
        <>
            <main className="recommend-page">
<RecommendHero />

                <RecommendForm
                    form={form}
                    loading={isLoading}
                    error={formError}
                    regionOptions={
                        REGION_OPTIONS
                    }
                    targetOptions={
                        TARGET_OPTIONS
                    }
                    interestOptions={
                        INTEREST_OPTIONS
                    }
                    supportOptions={
                        SUPPORT_OPTIONS
                    }
                    onAgeChange={
                        handleAgeChange
                    }
                    onRegionChange={
                        handleRegionChange
                    }
                    onToggleTarget={
                        handleToggleTarget
                    }
                    onToggleInterest={
                        handleToggleInterest
                    }
                    onSupportTypeChange={
                        handleSupportTypeChange
                    }
                    onSubmit={
                        handleSubmit
                    }
                    onReset={
                        openResetModal
                    }
                />

                {hasRequested
                    && !isLoading
                    && !errorMessage
                    && filterCount.all > 0 && (
                        <RecommendSummary
                            selectedFilter={
                                selectedFilter
                            }
                            selectedSort={
                                selectedSort
                            }
                            count={
                                filterCount
                            }
                            onFilterChange={
                                handleFilterChange
                            }
                            onSortChange={
                                handleSortChange
                            }
                        />
                    )}

                <div
                    ref={resultSectionRef}
                    className="recommend-page__content"
                    aria-live="polite"
                >
{isLoading && (
                        <RecommendSkeleton
                            count={3}
                        />
                    )}

                    {!isLoading
                        && errorMessage && (
                            <RecommendError
                                message={
                                    errorMessage
                                }
                                onRetry={retry}
                            />
                        )}

                    {!isLoading
                        && !errorMessage
                        && hasRecommendations && (
                            <>
                                <div className="recommend-list-info">
                                    <p>
                                        총{" "}
                                        <strong>
                                            {
                                                visibleRecommendations
                                                    .length
                                            }
                                        </strong>
                                        개 중{" "}
                                        <strong>
                                            {
                                                paginationRange
                                                    .start
                                            }
                                            –
                                            {
                                                paginationRange
                                                    .end
                                            }
                                        </strong>
                                        번째 정책을 표시하고
                                        있습니다.
                                    </p>

                                    <span>
                                        {currentPage} /{" "}
                                        {totalPages} 페이지
                                    </span>
                                </div>

                                <RecommendList
                                    recommendations={
                                        paginatedRecommendations
                                    }
                                    isCompareFull={
                                        isCompareFull
                                    }
                                    isCompareSelected={
                                        isSelected
                                    }
                                    onToggleCompare={
                                        handleToggleCompare
                                    }
                                />

                                <RecommendPagination
                                    currentPage={
                                        currentPage
                                    }
                                    totalPages={
                                        totalPages
                                    }
                                    onPageChange={
                                        handlePageChange
                                    }
                                />
                            </>
                        )}

                    {!isLoading
                        && !errorMessage
                        && !hasRecommendations && (
                            <RecommendEmpty
                                hasRequested={
                                    hasRequested
                                }
                                isFiltered={
                                    isFiltered
                                }
                                onResetFilter={() =>
                                    handleFilterChange(
                                        "all",
                                    )
                                }
                            />
                        )}
                </div>
            </main>

            <ConfirmModal
                isOpen={isResetModalOpen}
                title="추천 조건을 초기화할까요?"
                description="입력한 나이, 지역, 현재 상황, 관심 분야와 추천 결과가 모두 삭제됩니다."
                cancelLabel="취소"
                confirmLabel="초기화"
                isDanger
                onCancel={closeResetModal}
                onConfirm={confirmReset}
            />
            <RecommendCompareBar
                recommendations={
                    selectedRecommendations
                }
                onRemove={
                    removeRecommendation
                }
                onClear={
                    handleClearCompare
                }
                onCompare={
                    openCompareModal
                }
            />

            <RecommendCompareModal
                isOpen={
                    isCompareModalOpen
                }
                recommendations={
                    selectedRecommendations
                }
                onClose={
                    closeCompareModal
                }
                onRemove={
                    removeRecommendation
                }
            />
        </>
    );
    
}