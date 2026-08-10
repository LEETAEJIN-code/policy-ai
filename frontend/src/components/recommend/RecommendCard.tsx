import { Link } from "react-router-dom";

import BookmarkButton from "../common/BookmarkButton";

import RecommendCompareButton from "./RecommendCompareButton";

import type {
    Recommendation,
} from "../../types/recommendation";

import {
    saveRecommendationScrollTarget,
} from "../../utils/recommendStorage";

interface RecommendCardProps {
    recommendation: Recommendation;

    selected: boolean;
    isCompareFull: boolean;

    onToggleCompare: (
        recommendation: Recommendation,
    ) => void;
}

const SCORE_CIRCLE_RADIUS = 38;
const SCORE_CIRCLE_LENGTH =
    2 * Math.PI * SCORE_CIRCLE_RADIUS;

const getDeadlineClass = (
    deadlineStatus: string,
): string => {
    if (deadlineStatus === "오늘 마감") {
        return "deadline-today";
    }

    if (
        deadlineStatus === "마감 임박"
        || deadlineStatus === "3일 이내 마감"
    ) {
        return "deadline-urgent";
    }

    if (
        deadlineStatus === "일주일 이내 마감"
        || deadlineStatus === "7일 이내 마감"
    ) {
        return "deadline-soon";
    }

    if (
        deadlineStatus === "접수 마감"
        || deadlineStatus === "마감"
    ) {
        return "deadline-closed";
    }

    if (
        deadlineStatus === "마감일 확인 필요"
        || deadlineStatus === "상시 접수"
    ) {
        return "deadline-unknown";
    }

    return "deadline-open";
};

const getEligibilityClass = (
    eligibility: string,
): string => {
    if (
        eligibility.includes("신청 가능")
        || eligibility.includes("지원 가능")
    ) {
        return "eligibility-available";
    }

    if (
        eligibility.includes("확인")
        || eligibility.includes("검토")
    ) {
        return "eligibility-check";
    }

    if (
        eligibility.includes("불가")
        || eligibility.includes("마감")
    ) {
        return "eligibility-unavailable";
    }

    return "eligibility-default";
};

const normalizeScore = (
    score: number,
): number => {
    if (!Number.isFinite(score)) {
        return 0;
    }

    return Math.min(
        100,
        Math.max(0, Math.round(score)),
    );
};

function RecommendCard({
    recommendation,
    selected,
    isCompareFull,
    onToggleCompare,
}: RecommendCardProps) {
    const policy = recommendation.policy;

    const normalizedScore =
        normalizeScore(recommendation.score);

    const scoreOffset =
        SCORE_CIRCLE_LENGTH
        - (
            normalizedScore / 100
        ) * SCORE_CIRCLE_LENGTH;

    const gradeClassName =
        recommendation.grade
            .trim()
            .toLowerCase();

    const deadlineClassName =
        getDeadlineClass(
            recommendation.deadline_status,
        );

    const eligibilityClassName =
        getEligibilityClass(
            recommendation.eligibility,
        );

    const checkRequiredConditions = [
        ...recommendation.unknown_conditions,
        ...recommendation.failed_conditions,
    ];

    return (
            <article
                id={
                    `recommend-policy-${encodeURIComponent(
                        policy.id,
                    )}`
                }
                className="recommend-result-card"
            >
            <header className="recommend-card-top">
                <div className="recommend-score-area">
                    <div
                        className="recommend-score-ring"
                        role="img"
                        aria-label={`추천 점수 ${normalizedScore}점`}
                    >
                        <svg
                            viewBox="0 0 96 96"
                            aria-hidden="true"
                        >
                            <circle
                                className="recommend-score-ring__track"
                                cx="48"
                                cy="48"
                                r={SCORE_CIRCLE_RADIUS}
                            />

                            <circle
                                className="recommend-score-ring__value"
                                cx="48"
                                cy="48"
                                r={SCORE_CIRCLE_RADIUS}
                                strokeDasharray={
                                    SCORE_CIRCLE_LENGTH
                                }
                                strokeDashoffset={
                                    scoreOffset
                                }
                            />
                        </svg>

                        <div className="recommend-score-ring__text">
                            <strong>
                                {normalizedScore}
                            </strong>

                            <span>/ 100</span>
                        </div>
                    </div>

                    <div className="recommend-score-meta">
                        <span
                            className={
                                `recommend-grade grade-${gradeClassName}`
                            }
                        >
                            {recommendation.grade}등급
                        </span>

                        <p>
                            입력한 조건과 정책 대상의
                            일치도를 분석한 결과입니다.
                        </p>
                    </div>
                </div>

                <div
                    className="recommend-badges"
                    aria-label="추천 상태"
                >
                    <span
                        className={
                            `recommend-eligibility ${eligibilityClassName}`
                        }
                    >
                        {recommendation.eligibility}
                    </span>

                    <span
                        className={
                            `recommend-deadline ${deadlineClassName}`
                        }
                    >
                        {
                            recommendation
                                .deadline_status
                        }
                    </span>
                </div>
            </header>

            <section className="recommend-policy-info">
                <div className="recommend-policy-meta">
                    <span className="recommend-source">
                        {policy.source}
                    </span>

                    <span className="recommend-organization">
                        {
                            policy.organization
                            ?? "주관기관 확인 필요"
                        }
                    </span>
                </div>

                <h3>{policy.title}</h3>

                <div className="recommend-ai-summary">
                    <span
                        className="recommend-ai-summary__icon"
                        aria-hidden="true"
                    >
                        AI
                    </span>

                    <div>
                        <strong>한눈에 보는 정책 요약</strong>

                        <p>
                            {
                                recommendation.summary
                                || "현재 입력한 조건을 기준으로 추천된 정책입니다. 상세 지원 조건은 공고 원문에서 확인해 주세요."
                            }
                        </p>
                    </div>
                </div>
            </section>

            <section className="recommend-reason-box">
                <div className="recommend-card-section-title">
                    <span
                        className="recommend-section-icon"
                        aria-hidden="true"
                    >
                        ✦
                    </span>

                    <div>
                        <h4>AI 추천 근거</h4>

                        <p className="recommend-section-description">
                            입력한 정보와 정책 조건이 일치한 항목입니다.
                        </p>
                    </div>
                </div>

                {
                    recommendation
                        .recommend_reasons
                        .length > 0
                        ? (
                            <ul className="recommend-reason-chip-list">
                                {
                                    recommendation
                                        .recommend_reasons
                                        .map(
                                            (
                                                reason,
                                                index,
                                            ) => (
                                                <li
                                                    key={
                                                        `${reason}-${index}`
                                                    }
                                                >
                                                    <span
                                                        aria-hidden="true"
                                                    >
                                                        ✓
                                                    </span>

                                                    {reason}
                                                </li>
                                            ),
                                        )
                                }
                            </ul>
                        )
                        : (
                            <p className="recommend-empty-description">
                                추천 조건의 세부 내용을 확인해 주세요.
                            </p>
                        )
                }
            </section>

            <div className="recommend-condition-grid">
                <section className="recommend-condition-card recommend-condition-card--matched">
                    <div className="recommend-card-section-title">
                        <span
                            className="recommend-section-icon"
                            aria-hidden="true"
                        >
                            ✓
                        </span>

                        <h4>충족 조건</h4>
                    </div>

                    {
                        recommendation
                            .matched_conditions
                            .length > 0
                            ? (
                                <ul>
                                    {
                                        recommendation
                                            .matched_conditions
                                            .map(
                                                (
                                                    condition,
                                                    index,
                                                ) => (
                                                    <li
                                                        key={
                                                            `matched-${condition}-${index}`
                                                        }
                                                    >
                                                        {condition}
                                                    </li>
                                                ),
                                            )
                                    }
                                </ul>
                            )
                            : (
                                <p>
                                    확인된 충족 조건이
                                    없습니다.
                                </p>
                            )
                    }
                </section>

                <section className="recommend-condition-card recommend-condition-card--check">
                    <div className="recommend-card-section-title">
                        <span
                            className="recommend-section-icon"
                            aria-hidden="true"
                        >
                            ?
                        </span>

                        <h4>확인 필요</h4>
                    </div>

                    {
                        checkRequiredConditions.length
                        === 0
                            ? (
                                <p>
                                    추가로 확인할 조건이
                                    없습니다.
                                </p>
                            )
                            : (
                                <ul>
                                    {
                                        checkRequiredConditions
                                            .map(
                                                (
                                                    condition,
                                                    index,
                                                ) => (
                                                    <li
                                                        key={
                                                            `check-${condition}-${index}`
                                                        }
                                                    >
                                                        {condition}
                                                    </li>
                                                ),
                                            )
                                    }
                                </ul>
                            )
                    }
                </section>
            </div>

            <details className="recommend-checklist">
                <summary>
                    <span>신청 준비사항</span>
                    <span
                        className="recommend-checklist-arrow"
                        aria-hidden="true"
                    >
                        ▾
                    </span>
                </summary>

                <div className="recommend-checklist-content">
                    {
                        recommendation
                            .preparation_checklist
                            .length > 0
                            ? (
                                <ul>
                                    {
                                        recommendation
                                            .preparation_checklist
                                            .map(
                                                (
                                                    item,
                                                    index,
                                                ) => (
                                                    <li
                                                        key={
                                                            `${item}-${index}`
                                                        }
                                                    >
                                                        {item}
                                                    </li>
                                                ),
                                            )
                                    }
                                </ul>
                            )
                            : (
                                <p>
                                    공고 원문에서 준비사항을
                                    확인해 주세요.
                                </p>
                            )
                    }
                </div>
            </details>

            <footer className="recommend-card-actions">
                <Link
                    className="recommend-detail-button"
                    to={
                        `/policies/${encodeURIComponent(
                            policy.id,
                        )}`
                    }
                    onClick={() => {
                        saveRecommendationScrollTarget(
                            policy.id,
                        );
                    }}
                >
                    상세보기
                </Link>
                {
                    policy.detail_url && (
                        <a
                            className="recommend-original-button"
                            href={policy.detail_url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            원문보기
                        </a>
                    )
                }

                <BookmarkButton
                    policyId={policy.id}
                />

                <RecommendCompareButton
                    selected={selected}
                    disabled={isCompareFull}
                    onClick={() =>
                        onToggleCompare(
                            recommendation,
                        )
                    }
                />
            </footer>
        </article>
    );
}

export default RecommendCard;