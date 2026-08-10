import type {
    CSSProperties,
} from "react";

import type {
    Recommendation,
} from "../../types/recommendation";

import {
    analyzeRecommendationCompare,
    getRecommendationCheckCount,
} from "../../utils/analyzeRecommendationCompare";

interface RecommendComparePrintReportProps {
    recommendations: Recommendation[];
}

function renderItems(
    items: string[],
    emptyMessage: string,
) {
    if (items.length === 0) {
        return (
            <p className="compare-report-empty">
                {emptyMessage}
            </p>
        );
    }

    return (
        <ul className="compare-report-list">
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

function RecommendComparePrintReport({
    recommendations,
}: RecommendComparePrintReportProps) {
    const analysis =
        analyzeRecommendationCompare(
            recommendations,
        );

    const reportStyle = {
        "--compare-column-count":
            recommendations.length,
    } as CSSProperties;

    const createdAt =
        new Intl.DateTimeFormat(
            "ko-KR",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
            },
        ).format(new Date());

    return (
        <article
            className="compare-print-report"
            style={reportStyle}
        >
            <header className="compare-report-header">
                <div className="compare-report-brand">
                    <span className="compare-report-logo">
                        P
                    </span>

                    <div>
                        <strong>
                            PolicyAI
                        </strong>

                        <span>
                            AI 정책 추천 플랫폼
                        </span>
                    </div>
                </div>

                <div className="compare-report-meta">
                    <span>
                        생성일
                    </span>

                    <strong>
                        {createdAt}
                    </strong>

                    <span>
                        비교 정책
                    </span>

                    <strong>
                        {
                            recommendations.length
                        }
                        개
                    </strong>
                </div>
            </header>

            <section className="compare-report-title">
                <span>
                    POLICY COMPARISON REPORT
                </span>

                <h1>
                    정책 비교 보고서
                </h1>

                <p>
                    입력한 조건을 기준으로 추천된
                    정책의 점수와 신청 조건을
                    비교한 결과입니다.
                </p>
            </section>

            <section className="compare-report-overview">
                <div className="compare-report-section-heading">
                    <span>
                        AI
                    </span>

                    <div>
                        <h2>
                            AI 비교 분석
                        </h2>

                        <p>
                            추천 점수, 신청 가능성,
                            확인 조건과 마감 상태를
                            분석했습니다.
                        </p>
                    </div>
                </div>

                <div className="compare-report-analysis-grid">
                    {
                        analysis
                            .highestScoreRecommendation
                        && (
                            <div className="compare-report-analysis-card">
                                <span>
                                    최고 추천 점수
                                </span>

                                <strong>
                                    {
                                        analysis
                                            .highestScoreRecommendation
                                            .policy
                                            .title
                                    }
                                </strong>

                                <p>
                                    {
                                        analysis
                                            .highestScoreRecommendation
                                            .score
                                    }
                                    점 ·{" "}
                                    {
                                        analysis
                                            .highestScoreRecommendation
                                            .grade
                                    }
                                    등급
                                </p>
                            </div>
                        )
                    }

                    {
                        analysis
                            .mostEligibleRecommendation
                        && (
                            <div className="compare-report-analysis-card compare-report-analysis-card--success">
                                <span>
                                    신청 가능성 우선
                                </span>

                                <strong>
                                    {
                                        analysis
                                            .mostEligibleRecommendation
                                            .policy
                                            .title
                                    }
                                </strong>

                                <p>
                                    {
                                        analysis
                                            .mostEligibleRecommendation
                                            .eligibility
                                    }
                                </p>
                            </div>
                        )
                    }

                    {
                        analysis
                            .leastCheckRequiredRecommendation
                        && (
                            <div className="compare-report-analysis-card compare-report-analysis-card--warning">
                                <span>
                                    확인 조건 최소
                                </span>

                                <strong>
                                    {
                                        analysis
                                            .leastCheckRequiredRecommendation
                                            .policy
                                            .title
                                    }
                                </strong>

                                <p>
                                    확인 필요{" "}
                                    {
                                        getRecommendationCheckCount(
                                            analysis
                                                .leastCheckRequiredRecommendation,
                                        )
                                    }
                                    개
                                </p>
                            </div>
                        )
                    }

                    {
                        analysis
                            .earliestDeadlineRecommendation
                        && (
                            <div className="compare-report-analysis-card compare-report-analysis-card--danger">
                                <span>
                                    먼저 확인할 마감
                                </span>

                                <strong>
                                    {
                                        analysis
                                            .earliestDeadlineRecommendation
                                            .policy
                                            .title
                                    }
                                </strong>

                                <p>
                                    {
                                        analysis
                                            .earliestDeadlineRecommendation
                                            .deadline_status
                                    }
                                </p>
                            </div>
                        )
                    }
                </div>

                <div className="compare-report-summary">
                    <strong>
                        종합 의견
                    </strong>

                    <p>
                        {analysis.summary}
                    </p>
                </div>
            </section>

            <section className="compare-report-policy-cards">
                <h2>
                    비교 정책 요약
                </h2>

                <div className="compare-report-policy-grid">
                    {recommendations.map(
                        (
                            recommendation,
                            index,
                        ) => (
                            <article
                                key={
                                    recommendation
                                        .policy
                                        .id
                                }
                                className="compare-report-policy-card"
                            >
                                <div className="compare-report-policy-number">
                                    {index + 1}
                                </div>

                                <span className="compare-report-policy-source">
                                    {
                                        recommendation
                                            .policy
                                            .source
                                    }
                                </span>

                                <h3>
                                    {
                                        recommendation
                                            .policy
                                            .title
                                    }
                                </h3>

                                <dl>
                                    <div>
                                        <dt>
                                            추천 점수
                                        </dt>

                                        <dd>
                                            {
                                                recommendation
                                                    .score
                                            }
                                            점
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>
                                            추천 등급
                                        </dt>

                                        <dd>
                                            {
                                                recommendation
                                                    .grade
                                            }
                                            등급
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>
                                            신청 상태
                                        </dt>

                                        <dd>
                                            {
                                                recommendation
                                                    .eligibility
                                            }
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>
                                            마감 상태
                                        </dt>

                                        <dd>
                                            {
                                                recommendation
                                                    .deadline_status
                                            }
                                        </dd>
                                    </div>

                                    <div>
                                        <dt>
                                            확인 필요
                                        </dt>

                                        <dd>
                                            {
                                                getRecommendationCheckCount(
                                                    recommendation,
                                                )
                                            }
                                            개
                                        </dd>
                                    </div>
                                </dl>
                            </article>
                        ),
                    )}
                </div>
            </section>

            <section className="compare-report-table-section">
                <h2>
                    정책 항목 비교
                </h2>

                <table className="compare-report-table">
                    <thead>
                        <tr>
                            <th>
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
                                    >
                                        {
                                            recommendation
                                                .policy
                                                .title
                                        }
                                    </th>
                                ),
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <th>
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
                                        {
                                            recommendation
                                                .score
                                        }
                                        점
                                    </td>
                                ),
                            )}
                        </tr>

                        <tr>
                            <th>
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
                                        {
                                            recommendation
                                                .grade
                                        }
                                        등급
                                    </td>
                                ),
                            )}
                        </tr>

                        <tr>
                            <th>
                                신청 상태
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
                            <th>
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
                            <th>
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
                            <th>
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
                            <th>
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
                                        {renderItems(
                                            recommendation
                                                .recommend_reasons,
                                            "추천 이유가 없습니다.",
                                        )}
                                    </td>
                                ),
                            )}
                        </tr>

                        <tr>
                            <th>
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
                                        {renderItems(
                                            recommendation
                                                .matched_conditions,
                                            "충족 조건이 없습니다.",
                                        )}
                                    </td>
                                ),
                            )}
                        </tr>

                        <tr>
                            <th>
                                확인 필요
                            </th>

                            {recommendations.map(
                                (
                                    recommendation,
                                ) => {
                                    const items = [
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
                                            {renderItems(
                                                items,
                                                "추가 확인 조건이 없습니다.",
                                            )}
                                        </td>
                                    );
                                },
                            )}
                        </tr>
                    </tbody>
                </table>
            </section>

            <footer className="compare-report-footer">
                <p>
                    본 비교 결과는 참고용입니다.
                    실제 신청 전 각 지원사업의
                    최신 공고 원문과 자격 조건을
                    반드시 확인해 주세요.
                </p>

                <span>
                    PolicyAI
                </span>
            </footer>
        </article>
    );
}

export default RecommendComparePrintReport;