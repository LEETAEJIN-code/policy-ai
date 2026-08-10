import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import type {
    RecentPolicyItem,
} from "../types/recentPolicy";

import {
    clearRecentPolicies,
    getRecentPolicies,
    removeRecentPolicy,
} from "../utils/recentPolicyStorage";

function formatViewedAt(
    viewedAt: number,
): string {
    const date = new Date(viewedAt);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return "확인 시간 없음";
    }

    return new Intl.DateTimeFormat(
        "ko-KR",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    ).format(date);
}

function RecentPolicyPage() {
    const [
        recentPolicies,
        setRecentPolicies,
    ] = useState<RecentPolicyItem[]>([]);

    useEffect(() => {
        setRecentPolicies(
            getRecentPolicies(),
        );
    }, []);

    const recentPolicyCount =
        recentPolicies.length;

    const sortedRecentPolicies =
        useMemo(
            () =>
                [...recentPolicies].sort(
                    (
                        first,
                        second,
                    ) =>
                        second.viewedAt
                        - first.viewedAt,
                ),
            [recentPolicies],
        );

    const handleRemove =
        useCallback(
            (
                policyId: string,
            ): void => {
                removeRecentPolicy(
                    policyId,
                );

                setRecentPolicies(
                    (current) =>
                        current.filter(
                            (policy) =>
                                policy.policyId
                                !== policyId,
                        ),
                );
            },
            [],
        );

    const handleClear =
        useCallback((): void => {
            clearRecentPolicies();
            setRecentPolicies([]);
        }, []);

    return (
        <main className="recent-policy-page">
            <header className="recent-policy-header">
                <div>
                    <span className="recent-policy-eyebrow">
                        RECENTLY VIEWED
                    </span>

                    <h1>
                        최근 본 정책
                    </h1>

                    <p>
                        최근 확인한 지원사업을
                        다시 살펴볼 수 있습니다.
                    </p>
                </div>

                {recentPolicyCount > 0 && (
                    <button
                        type="button"
                        className="recent-policy-clear-button"
                        onClick={
                            handleClear
                        }
                    >
                        전체 삭제
                    </button>
                )}
            </header>

            <section className="recent-policy-summary">
                <div>
                    <span>
                        최근 본 정책
                    </span>

                    <strong>
                        {
                            recentPolicyCount
                        }
                    </strong>

                    <small>
                        최대 10개까지 저장됩니다.
                    </small>
                </div>

                <p>
                    최근 7일 동안 확인한 정책만
                    표시됩니다.
                </p>
            </section>

            {recentPolicyCount === 0
                ? (
                    <section className="recent-policy-empty">
                        <div
                            className="recent-policy-empty__icon"
                            aria-hidden="true"
                        >
                            ◷
                        </div>

                        <h2>
                            최근 본 정책이 없습니다
                        </h2>

                        <p>
                            정책 조회 또는 맞춤 추천에서
                            상세페이지를 열면 이곳에
                            자동으로 저장됩니다.
                        </p>

                        <div className="recent-policy-empty__actions">
                            <Link
                                to="/policies"
                                className="recent-policy-primary-link"
                            >
                                정책 조회하기
                            </Link>

                            <Link
                                to="/recommend"
                                className="recent-policy-secondary-link"
                            >
                                맞춤 추천받기
                            </Link>
                        </div>
                    </section>
                )
                : (
                    <section
                        className="recent-policy-list"
                        aria-label="최근 본 정책 목록"
                    >
                        {sortedRecentPolicies.map(
                            (
                                policy,
                                index,
                            ) => (
                                <article
                                    key={
                                        policy.policyId
                                    }
                                    className="recent-policy-card"
                                >
                                    <div className="recent-policy-card__number">
                                        {
                                            index + 1
                                        }
                                    </div>

                                    <div className="recent-policy-card__content">
                                        <div className="recent-policy-card__meta">
                                            <span className="recent-policy-source">
                                                {
                                                    policy.source
                                                }
                                            </span>

                                            <span>
                                                {
                                                    policy.organization
                                                }
                                            </span>
                                        </div>

                                        <h2>
                                            {
                                                policy.title
                                            }
                                        </h2>

                                        <p className="recent-policy-viewed-at">
                                            마지막 확인:{" "}
                                            {
                                                formatViewedAt(
                                                    policy.viewedAt,
                                                )
                                            }
                                        </p>
                                    </div>

                                    <div className="recent-policy-card__actions">
                                        <Link
                                            to={
                                                `/policies/${encodeURIComponent(
                                                    policy.policyId,
                                                )}`
                                            }
                                            className="recent-policy-detail-button"
                                        >
                                            상세보기
                                        </Link>

                                        {policy.detailUrl
                                            && (
                                                <a
                                                    href={
                                                        policy.detailUrl
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="recent-policy-original-button"
                                                >
                                                    원문보기
                                                </a>
                                            )}

                                        <button
                                            type="button"
                                            className="recent-policy-remove-button"
                                            onClick={() =>
                                                handleRemove(
                                                    policy.policyId,
                                                )
                                            }
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </article>
                            ),
                        )}
                    </section>
                )}
        </main>
    );
}

export default RecentPolicyPage;