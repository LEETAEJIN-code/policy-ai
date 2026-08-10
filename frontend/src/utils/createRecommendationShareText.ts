import type {
    Recommendation,
} from "../types/recommendation";

import {
    analyzeRecommendationCompare,
    getRecommendationCheckCount,
} from "./analyzeRecommendationCompare";

function getPolicyDetailUrl(
    policyId: string,
): string {
    const encodedPolicyId =
        encodeURIComponent(policyId);

    return (
        `${window.location.origin}`
        + `/policies/${encodedPolicyId}`
    );
}

function createPolicyText(
    recommendation: Recommendation,
    index: number,
): string {
    const policy =
        recommendation.policy;

    const organization =
        policy.organization
        ?? "주관기관 확인 필요";

    const detailUrl =
        getPolicyDetailUrl(
            policy.id,
        );

    const originalUrl =
        policy.detail_url
        ?? "";

    const lines = [
        `${index + 1}. ${policy.title}`,
        `- 추천 점수: ${recommendation.score}점`,
        `- 추천 등급: ${recommendation.grade}등급`,
        `- 신청 상태: ${recommendation.eligibility}`,
        `- 마감 상태: ${recommendation.deadline_status}`,
        `- 주관 기관: ${organization}`,
        `- 확인 필요: ${getRecommendationCheckCount(
            recommendation,
        )}개`,
        `- 상세보기: ${detailUrl}`,
    ];

    if (originalUrl) {
        lines.push(
            `- 공고 원문: ${originalUrl}`,
        );
    }

    return lines.join("\n");
}

export function createRecommendationShareText(
    recommendations: Recommendation[],
): string {
    if (recommendations.length === 0) {
        return "";
    }

    const analysis =
        analyzeRecommendationCompare(
            recommendations,
        );

    const policyTexts =
        recommendations.map(
            createPolicyText,
        );

    return [
        "[PolicyAI 정책 비교]",
        "",
        `비교 정책 ${recommendations.length}개`,
        "",
        "AI 종합 의견",
        analysis.summary,
        "",
        ...policyTexts.flatMap(
            (policyText, index) => {
                if (
                    index
                    === policyTexts.length - 1
                ) {
                    return [policyText];
                }

                return [
                    policyText,
                    "",
                ];
            },
        ),
        "",
        "※ 본 비교 결과는 참고용입니다.",
        "실제 신청 전 최신 공고 원문과 자격 조건을 확인해 주세요.",
    ].join("\n");
}