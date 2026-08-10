import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import type {
    MouseEvent,
} from "react";

import type {
    Recommendation,
} from "../../types/recommendation";

import {
    analyzeRecommendationCompare,
    getRecommendationCheckCount,
} from "../../utils/analyzeRecommendationCompare";

import RecommendComparePrintReport from
    "./RecommendComparePrintReport";

import {
    createRecommendationShareText,
} from "../../utils/createRecommendationShareText";

interface RecommendCompareModalProps {
    isOpen: boolean;

    recommendations: Recommendation[];

    onClose: () => void;

    onRemove: (
        policyId: string,
    ) => void;
}

function renderList(
    items: string[],
    emptyMessage: string,
) {
    if (items.length === 0) {
        return (
            <p className="recommend-compare-empty">
                {emptyMessage}
            </p>
        );
    }

    return (
        <ul className="recommend-compare-list">
            {items.map(
                (
                    item,
                    index,
                ) => (
                    <li
                        key={`${item}-${index}`}
                    >
                        {item}
                    </li>
                ),
            )}
        </ul>
    );
}

function RecommendCompareModal({
    isOpen,
    recommendations,
    onClose,
    onRemove,
}: RecommendCompareModalProps) {
    const closeButtonRef =
        useRef<HTMLButtonElement | null>(
            null,
        );
    const [
        copyStatus,
        setCopyStatus,
    ] = useState<
        "idle" | "success" | "error"
    >("idle");

    const analysis = useMemo(
        () =>
            analyzeRecommendationCompare(
                recommendations,
            ),
        [recommendations],
    );

    const highestScore =
        analysis.highestScoreRecommendation;

    const mostEligible =
        analysis.mostEligibleRecommendation;

    const leastCheckRequired =
        analysis.leastCheckRequiredRecommendation;

    const earliestDeadline =
        analysis.earliestDeadlineRecommendation;

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        closeButtonRef.current?.focus();

        const handleKeyDown = (
            event: KeyboardEvent,
        ): void => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            "hidden";

        document.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            document.body.style.overflow =
                previousOverflow;

            document.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [
        isOpen,
        onClose,
    ]);

    useEffect(() => {
        if (
            isOpen
            && recommendations.length < 2
        ) {
            onClose();
        }
    }, [
        isOpen,
        recommendations.length,
        onClose,
    ]);

    useEffect(() => {
        if (!isOpen) {
            setCopyStatus("idle");
        }
    }, [isOpen]);

    if (
        !isOpen
        || recommendations.length < 2
    ) {
        return null;
    }
    const handleBackdropClick = (
        event: MouseEvent<HTMLDivElement>,
    ): void => {
        if (
            event.target
            === event.currentTarget
        ) {
            onClose();
        }
    };

    const handleCopyCompare =
        async (): Promise<void> => {
        const shareText =
            createRecommendationShareText(
                recommendations,
            );

        if (!shareText) {
            setCopyStatus("error");
            return;
        }

        try {
            await navigator.clipboard.writeText(
                shareText,
            );

            setCopyStatus("success");

            window.setTimeout(() => {
                setCopyStatus("idle");
            }, 2200);
        } catch {
            try {
                const textArea =
                    document.createElement(
                        "textarea",
                    );

                textArea.value =
                    shareText;

                textArea.style.position =
                    "fixed";

                textArea.style.opacity =
                    "0";

                textArea.setAttribute(
                    "readonly",
                    "",
                );

                document.body.appendChild(
                    textArea,
                );

                textArea.select();

                const copied =
                    document.execCommand(
                        "copy",
                    );

                textArea.remove();

                if (!copied) {
                    throw new Error(
                        "Copy failed",
                    );
                }

                setCopyStatus("success");

                window.setTimeout(() => {
                    setCopyStatus("idle");
                }, 2200);
            } catch {
                setCopyStatus("error");

                window.setTimeout(() => {
                    setCopyStatus("idle");
                }, 2200);
            }
        }
    };
    
    const handlePrintCompare = (): void => {
        const originalTitle =
            document.title;

        const printTitle =
            `PolicyAI_정책비교_${new Date()
                .toISOString()
                .slice(0, 10)}`;

        document.title = printTitle;

        document.body.classList.add(
            "recommend-compare-printing",
        );

        const restorePrintState =
            (): void => {
                document.body.classList.remove(
                    "recommend-compare-printing",
                );

                document.title =
                    originalTitle;

                window.removeEventListener(
                    "afterprint",
                    restorePrintState,
                );
            };

        window.addEventListener(
            "afterprint",
            restorePrintState,
        );

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                window.print();
            });
        });
    };

    return (
        <div
            className="recommend-compare-modal-backdrop"
            role="presentation"
            onMouseDown={
                handleBackdropClick
            }
        >
            <section
                className="recommend-compare-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="recommend-compare-title"
            >
                <header className="recommend-compare-modal__header">
                    <div>
                        <span>
                            POLICY COMPARISON
                        </span>

                        <h2 id="recommend-compare-title">
                            정책 비교
                        </h2>

                        <p>
                            추천 점수와 신청 조건을
                            한눈에 비교해보세요.
                        </p>
                    </div>

                    <button
                        ref={closeButtonRef}
                        type="button"
                        className="recommend-compare-modal__close"
                        aria-label="비교 창 닫기"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </header>

                <div className="recommend-compare-modal__body">
                    <section
                        className="recommend-compare-analysis"
                        aria-labelledby="recommend-compare-analysis-title"
                    >
                        <div className="recommend-compare-analysis__heading">
                            <span
                                className="recommend-compare-analysis__icon"
                                aria-hidden="true"
                            >
                                AI
                            </span>

                            <div>
                                <h3 id="recommend-compare-analysis-title">
                                    AI 비교 분석
                                </h3>

                                <p>
                                    추천 결과의 점수와
                                    조건을 자동으로
                                    비교했습니다.
                                </p>
                            </div>
                        </div>

                        <div className="recommend-compare-analysis__grid">
                            {highestScore && (
                                <article className="recommend-compare-analysis-card">
                                    <span>
                                        최고 추천 점수
                                    </span>

                                    <strong>
                                        {
                                            highestScore
                                                .policy
                                                .title
                                        }
                                    </strong>

                                    <p>
                                        {
                                            highestScore
                                                .score
                                        }
                                        점 ·{" "}
                                        {
                                            highestScore
                                                .grade
                                        }
                                        등급
                                    </p>
                                </article>
                            )}

                            {mostEligible && (
                                <article className="recommend-compare-analysis-card recommend-compare-analysis-card--success">
                                    <span>
                                        신청 가능성 우선
                                    </span>

                                    <strong>
                                        {
                                            mostEligible
                                                .policy
                                                .title
                                        }
                                    </strong>

                                    <p>
                                        {
                                            mostEligible
                                                .eligibility
                                        }
                                    </p>
                                </article>
                            )}

                            {leastCheckRequired && (
                                <article className="recommend-compare-analysis-card recommend-compare-analysis-card--check">
                                    <span>
                                        확인 조건 최소
                                    </span>

                                    <strong>
                                        {
                                            leastCheckRequired
                                                .policy
                                                .title
                                        }
                                    </strong>

                                    <p>
                                        확인 필요{" "}
                                        {
                                            getRecommendationCheckCount(
                                                leastCheckRequired,
                                            )
                                        }
                                        개
                                    </p>
                                </article>
                            )}

                            {earliestDeadline && (
                                <article className="recommend-compare-analysis-card recommend-compare-analysis-card--deadline">
                                    <span>
                                        먼저 확인할 마감
                                    </span>

                                    <strong>
                                        {
                                            earliestDeadline
                                                .policy
                                                .title
                                        }
                                    </strong>

                                    <p>
                                        {
                                            earliestDeadline
                                                .deadline_status
                                        }
                                    </p>
                                </article>
                            )}
                        </div>

                        <div className="recommend-compare-analysis__summary">
                            <strong>
                                종합 의견
                            </strong>

                            <p>
                                {analysis.summary}
                            </p>
                        </div>
                    </section>

                    <div className="recommend-compare-table-wrap">
                        <table className="recommend-compare-table">
                            <thead>
                                <tr>
                                    <th scope="col">
                                        비교 항목
                                    </th>

                                    {recommendations.map(
                                        (
                                            recommendation,
                                        ) => (
                                            <th
                                                key={
                                                    recommendation
                                                        .policy
                                                        .id
                                                }
                                                scope="col"
                                            >
                                                <button
                                                    type="button"
                                                    className="recommend-compare-column-remove"
                                                    aria-label={
                                                        `${recommendation.policy.title} 비교에서 제거`
                                                    }
                                                    onClick={() =>
                                                        onRemove(
                                                            recommendation
                                                                .policy
                                                                .id,
                                                        )
                                                    }
                                                >
                                                    ×
                                                </button>

                                                <span className="recommend-compare-source">
                                                    {
                                                        recommendation
                                                            .policy
                                                            .source
                                                    }
                                                </span>

                                                <strong>
                                                    {
                                                        recommendation
                                                            .policy
                                                            .title
                                                    }
                                                </strong>
                                            </th>
                                        ),
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <th scope="row">
                                        추천 점수
                                    </th>

                                    {recommendations.map(
                                        (
                                            recommendation,
                                        ) => (
                                            <td
                                                key={
                                                    recommendation
                                                        .policy
                                                        .id
                                                }
                                            >
                                                <strong className="recommend-compare-score">
                                                    {
                                                        recommendation
                                                            .score
                                                    }
                                                </strong>

                                                <span>
                                                    / 100점
                                                </span>
                                            </td>
                                        ),
                                    )}
                                </tr>

                                <tr>
                                    <th scope="row">
                                        추천 등급
                                    </th>

                                    {recommendations.map(
                                        (
                                            recommendation,
                                        ) => (
                                            <td
                                                key={
                                                    recommendation
                                                        .policy
                                                        .id
                                                }
                                            >
                                                <span className="recommend-compare-grade">
                                                    {
                                                        recommendation
                                                            .grade
                                                    }
                                                    등급
                                                </span>
                                            </td>
                                        ),
                                    )}
                                </tr>

                                <tr>
                                    <th scope="row">
                                        신청 가능 여부
                                    </th>

                                    {recommendations.map(
                                        (
                                            recommendation,
                                        ) => (
                                            <td
                                                key={
                                                    recommendation
                                                        .policy
                                                        .id
                                                }
                                            >
                                                {
                                                    recommendation
                                                        .eligibility
                                                }
                                            </td>
                                        ),
                                    )}
                                </tr>

                                <tr>
                                    <th scope="row">
                                        마감 상태
                                    </th>

                                    {recommendations.map(
                                        (
                                            recommendation,
                                        ) => (
                                            <td
                                                key={
                                                    recommendation
                                                        .policy
                                                        .id
                                                }
                                            >
                                                {
                                                    recommendation
                                                        .deadline_status
                                                }
                                            </td>
                                        ),
                                    )}
                                </tr>

                                <tr>
                                    <th scope="row">
                                        주관 기관
                                    </th>

                                    {recommendations.map(
                                        (
                                            recommendation,
                                        ) => (
                                            <td
                                                key={
                                                    recommendation
                                                        .policy
                                                        .id
                                                }
                                            >
                                                {
                                                    recommendation
                                                        .policy
                                                        .organization
                                                    ?? "확인 필요"
                                                }
                                            </td>
                                        ),
                                    )}
                                </tr>

                                <tr>
                                    <th scope="row">
                                        정책 요약
                                    </th>

                                    {recommendations.map(
                                        (
                                            recommendation,
                                        ) => (
                                            <td
                                                key={
                                                    recommendation
                                                        .policy
                                                        .id
                                                }
                                            >
                                                {
                                                    recommendation
                                                        .summary
                                                    || "정책 설명을 확인해 주세요."
                                                }
                                            </td>
                                        ),
                                    )}
                                </tr>

                                <tr>
                                    <th scope="row">
                                        추천 이유
                                    </th>

                                    {recommendations.map(
                                        (
                                            recommendation,
                                        ) => (
                                            <td
                                                key={
                                                    recommendation
                                                        .policy
                                                        .id
                                                }
                                            >
                                                {renderList(
                                                    recommendation
                                                        .recommend_reasons,
                                                    "추천 이유를 확인할 수 없습니다.",
                                                )}
                                            </td>
                                        ),
                                    )}
                                </tr>

                                <tr>
                                    <th scope="row">
                                        충족 조건
                                    </th>

                                    {recommendations.map(
                                        (
                                            recommendation,
                                        ) => (
                                            <td
                                                key={
                                                    recommendation
                                                        .policy
                                                        .id
                                                }
                                            >
                                                {renderList(
                                                    recommendation
                                                        .matched_conditions,
                                                    "확인된 충족 조건이 없습니다.",
                                                )}
                                            </td>
                                        ),
                                    )}
                                </tr>

                                <tr>
                                    <th scope="row">
                                        확인 필요
                                    </th>

                                    {recommendations.map(
                                        (
                                            recommendation,
                                        ) => {
                                            const checkItems = [
                                                ...recommendation
                                                    .unknown_conditions,

                                                ...recommendation
                                                    .failed_conditions,
                                            ];

                                            return (
                                                <td
                                                    key={
                                                        recommendation
                                                            .policy
                                                            .id
                                                    }
                                                >
                                                    {renderList(
                                                        checkItems,
                                                        "추가 확인 조건이 없습니다.",
                                                    )}
                                                </td>
                                            );
                                        },
                                    )}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <footer className="recommend-compare-modal__footer">
                    <div>
                        <p>
                            비교 결과는 참고용이며,
                            실제 신청 전 공고 원문을
                            확인해 주세요.
                        </p>

                        {copyStatus === "error" && (
                            <p
                                className="recommend-compare-copy-error"
                                role="alert"
                            >
                                공유 내용을 복사하지 못했습니다.
                                브라우저의 클립보드 권한을
                                확인해 주세요.
                            </p>
                        )}
                    </div>

                    <div className="recommend-compare-modal__footer-actions">
                        <button
                            type="button"
                            className={
                                copyStatus === "success"
                                    ? "recommend-compare-copy-button recommend-compare-copy-button--success"
                                    : "recommend-compare-copy-button"
                            }
                            onClick={() => {
                                void handleCopyCompare();
                            }}
                        >
                            <span aria-hidden="true">
                                {copyStatus === "success"
                                    ? "✓"
                                    : "⧉"}
                            </span>

                            {copyStatus === "success"
                                ? "복사 완료"
                                : "공유 내용 복사"}
                        </button>

                        <button
                            type="button"
                            className="recommend-compare-print-button"
                            onClick={handlePrintCompare}
                        >
                            <span aria-hidden="true">
                                ↓
                            </span>

                            PDF 저장
                        </button>

                        <button
                            type="button"
                            className="recommend-compare-close-button"
                            onClick={onClose}
                        >
                            비교 닫기
                        </button>
                    </div>
                </footer>
            </section>

            <RecommendComparePrintReport
                recommendations={
                    recommendations
                }
            />
        </div>
    );
}

export default RecommendCompareModal;