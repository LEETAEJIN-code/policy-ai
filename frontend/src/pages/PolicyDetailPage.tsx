import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useParams,
} from "react-router-dom";

import BookmarkButton from
    "../components/common/BookmarkButton";

import {
    ErrorState,
    LoadingSpinner,
} from "../components/common";

import {
    addRecentPolicy,
} from "../utils/recentPolicyStorage";

import {
    getPolicy,
} from "../api/policyApi";

import type {
    Policy as BasePolicy,
} from "../types/policy";

type Policy = BasePolicy & {
    keywords?: string[];
    required_documents?: string[];
    original_target_text?: string | null;
    original_period_text?: string | null;
    original_url?: string | null;
};

function PolicyDetailPage() {
    const {
        policyId,
    } = useParams<{
        policyId: string;
    }>();

    const [
        policy,
        setPolicy,
    ] = useState<Policy | null>(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    /*
     * 정책 상세 정보 불러오기
     */
    useEffect(() => {
        const loadPolicy =
            async (): Promise<void> => {
                if (!policyId) {
                    setError(
                        "정책 번호가 올바르지 않습니다.",
                    );

                    setPolicy(null);
                    setLoading(false);

                    return;
                }

                setLoading(true);
                setError("");

                try {
                    const data =
                        await getPolicy(
                            policyId,
                        );

                    setPolicy(data);

                    addRecentPolicy({
                        policyId:
                            String(data.id),

                        title:
                            data.title,

                        organization:
                            data.organization
                            ?? "주관기관 확인 필요",

                        source:
                            data.source
                            || "출처 확인 필요",

                        detailUrl:
                            data.original_url
                            ?? data.detail_url
                            ?? null,
                    });
                } catch (
                    requestError
                ) {
                    const message =
                        requestError
                            instanceof Error
                            ? requestError.message
                            : "정책 정보를 불러오는 중 오류가 발생했습니다.";

                    setError(message);
                    setPolicy(null);
                } finally {
                    setLoading(false);
                }
            };

        void loadPolicy();
    }, [policyId]);

    if (loading) {
        return (
            <main className="policy-detail-page">
                <LoadingSpinner
                    message="정책 정보를 불러오고 있습니다."
                    fullPage
                />
            </main>
        );
    }

    if (
        error
        || !policy
    ) {
        return (
            <main className="policy-detail-page">
                <ErrorState
                    title="정책을 찾을 수 없습니다."
                    message={
                        error
                        || "삭제되었거나 존재하지 않는 정책입니다."
                    }
                />

                <div className="policy-detail-state-action">
                    <Link
                        to="/policies"
                        className="ui-button ui-button--primary"
                    >
                        정책 목록으로
                    </Link>
                </div>
            </main>
        );
    }

    const originalUrl =
        policy.original_url
        ?? policy.detail_url
        ?? null;

    const regions =
        (policy.regions?.length ?? 0) > 0
            ? policy.regions?.join(", ")
            : "확인 필요";

    const targets =
        (policy.targets?.length ?? 0) > 0
            ? policy.targets?.join(", ")
            : "확인 필요";

    const supportTypes =
        (policy.support_types?.length ?? 0) > 0
            ? policy.support_types?.join(
                ", ",
            )
            : "확인 필요";

    const applicationPeriod =
        policy.start_date
        || policy.end_date
            ? `${policy.start_date ?? "확인 필요"} ~ ${
                policy.end_date
                ?? "확인 필요"
            }`
            : "확인 필요";

    return (
        <main className="policy-detail-page">
            <section className="policy-detail-card">
                <header className="policy-detail-header">
                    <div>
                        <span className="policy-detail-source">
                            {policy.source}
                        </span>

                        <h1>
                            {policy.title}
                        </h1>

                        <p className="policy-detail-organization">
                            {
                                policy.organization
                                ?? "주관기관 확인 필요"
                            }
                        </p>
                    </div>

                    <BookmarkButton
                        policyId={policy.id}
                    />
                </header>

                <div className="policy-detail-grid">
                    <div>
                        <strong>
                            지원 지역
                        </strong>

                        <p>
                            {regions}
                        </p>
                    </div>

                    <div>
                        <strong>
                            지원 대상
                        </strong>

                        <p>
                            {targets}
                        </p>
                    </div>

                    <div>
                        <strong>
                            지원 유형
                        </strong>

                        <p>
                            {supportTypes}
                        </p>
                    </div>

                    <div>
                        <strong>
                            신청 기간
                        </strong>

                        <p>
                            {applicationPeriod}
                        </p>
                    </div>
                </div>

                <section className="policy-detail-section">
                    <h2>
                        사업 내용
                    </h2>

                    <p>
                        {
                            policy.description
                            ?? "상세 설명은 원문 공고에서 확인해 주세요."
                        }
                    </p>
                </section>

                {policy.original_target_text
                    && (
                        <section className="policy-detail-section">
                            <h2>
                                지원 대상 상세
                            </h2>

                            <p>
                                {
                                    policy
                                        .original_target_text
                                }
                            </p>
                        </section>
                    )}

                {(policy.required_documents?.length ?? 0) > 0
                    && (
                        <section className="policy-detail-section">
                            <h2>
                                제출 서류
                            </h2>

                            <ul className="policy-detail-document-list">
                                {policy.required_documents?.map(
                                    (
                                        document,
                                        index,
                                    ) => (
                                        <li
                                            key={`${document}-${index}`}
                                        >
                                            {document}
                                        </li>
                                    ),
                                )}
                            </ul>
                        </section>
                    )}

                {(policy.keywords?.length ?? 0) > 0
                    && (
                        <section className="policy-detail-section">
                            <h2>
                                관련 키워드
                            </h2>

                            <div className="policy-detail-keywords">
                                {policy.keywords?.map(
                                    (
                                        keyword,
                                    ) => (
                                        <span
                                            key={keyword}
                                        >
                                            {keyword}
                                        </span>
                                    ),
                                )}
                            </div>
                        </section>
                    )}

                <div className="policy-detail-actions">
                    <Link
                        to="/policies"
                        className="ui-button ui-button--secondary policy-detail-back-button"
                    >
                        목록으로
                    </Link>

                    {originalUrl && (
                        <a
                            className="ui-button ui-button--primary policy-detail-original-button"
                            href={originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            원문보기
                        </a>
                    )}
                </div>
            </section>
        </main>
    );
}

export default PolicyDetailPage;