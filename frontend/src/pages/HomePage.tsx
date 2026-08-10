import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import {
    ErrorState,
} from "../components/common";

import type {
    RecentPolicyItem,
} from "../types/recentPolicy";

import {
    getRecentPolicies,
} from "../utils/recentPolicyStorage";

import {
    getPolicyStatistics,
} from "../api/policyApi";

import StatSkeleton from
    "../components/common/StatSkeleton";
    
interface PolicyStatisticsResponse {
    total: number;
    available: number;
    deadline_approaching: number;
    closed: number;
    date_unknown: number;
}

const INITIAL_STATISTICS: PolicyStatisticsResponse = {
    total: 0,
    available: 0,
    deadline_approaching: 0,
    closed: 0,
    date_unknown: 0,
};

function formatViewedAt(
    viewedAt: number,
): string {
    const viewedDate =
        new Date(viewedAt);

    if (
        Number.isNaN(
            viewedDate.getTime(),
        )
    ) {
        return "최근 확인";
    }

    const difference =
        Date.now()
        - viewedDate.getTime();

    const minutes =
        Math.floor(
            difference
            / (1000 * 60),
        );

    if (minutes < 1) {
        return "방금 전";
    }

    if (minutes < 60) {
        return `${minutes}분 전`;
    }

    const hours =
        Math.floor(
            minutes / 60,
        );

    if (hours < 24) {
        return `${hours}시간 전`;
    }

    const days =
        Math.floor(
            hours / 24,
        );

    if (days < 7) {
        return `${days}일 전`;
    }

    return new Intl.DateTimeFormat(
        "ko-KR",
        {
            month: "short",
            day: "numeric",
        },
    ).format(viewedDate);
}

export default function HomePage() {
    const [
        statistics,
        setStatistics,
    ] = useState<PolicyStatisticsResponse>(
        INITIAL_STATISTICS,
    );

    const [
        recentPolicies,
        setRecentPolicies,
    ] = useState<RecentPolicyItem[]>(
        () => getRecentPolicies(),
    );

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState("");

    useEffect(() => {
        let isMounted = true;

        const loadDashboard =
            async (): Promise<void> => {
                setIsLoading(true);
                setErrorMessage("");

                try {
                    const data =
                        await getPolicyStatistics();

                    if (!isMounted) {
                        return;
                    }

                    setStatistics(data);
                } catch (
                    requestError
                ) {
                    if (!isMounted) {
                        return;
                    }

                    setStatistics({
                        total: 0,
                        available: 0,
                        deadline_approaching: 0,
                        closed: 0,
                        date_unknown: 0,
                    });

                    setErrorMessage(
                        requestError
                            instanceof Error
                            ? requestError.message
                            : "대시보드 정보를 불러오는 중 오류가 발생했습니다.",
                    );
                } finally {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                }
            };

        void loadDashboard();

        return () => {
            isMounted = false;
        };
    }, []);
    const refreshRecentPolicies =
        useCallback((): void => {
            setRecentPolicies(
                getRecentPolicies(),
            );
        }, []);

    useEffect(() => {
        const handleVisibilityChange =
            (): void => {
                if (
                    document.visibilityState
                    === "visible"
                ) {
                    refreshRecentPolicies();
                }
            };

        window.addEventListener(
            "focus",
            refreshRecentPolicies,
        );

        window.addEventListener(
            "storage",
            refreshRecentPolicies,
        );

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange,
        );

        return () => {
            window.removeEventListener(
                "focus",
                refreshRecentPolicies,
            );

            window.removeEventListener(
                "storage",
                refreshRecentPolicies,
            );

            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
        };
    }, [refreshRecentPolicies]);

    const displayedRecentPolicies =
        useMemo(
            () =>
                [...recentPolicies]
                    .sort(
                        (
                            first,
                            second,
                        ) =>
                            second.viewedAt
                            - first.viewedAt,
                    )
                    .slice(0, 3),
            [recentPolicies],
        );

    return (
        <main className="home-dashboard">
            <section className="home-hero">
                <div className="home-hero__content">
                    <span className="home-hero__eyebrow">
                        AI POLICY DISCOVERY
                    </span>

                    <h1>
                        나에게 필요한 지원정책을
                        <br />
                        더 빠르게 찾아보세요
                    </h1>

                    <p>
                        여러 기관의 지원사업을 한곳에서
                        조회하고, 입력한 조건을 기반으로
                        적합한 정책을 추천받을 수 있습니다.
                    </p>

                    <div className="home-hero__actions">
                        <Link
                            to="/recommend"
                            className="ui-button ui-button--primary home-primary-button"
                        >
                            맞춤 추천 시작하기
                        </Link>

                        <Link
                            to="/policies"
                            className="ui-button ui-button--secondary home-secondary-button"
                        >
                            전체 정책 조회
                        </Link>
                    </div>
                </div>

                <div
                    className="home-hero__visual"
                    aria-hidden="true"
                >
                    <div className="home-ai-orbit">
                        <div className="home-ai-orbit__center">
                            AI
                        </div>

                        <span className="home-ai-orbit__item home-ai-orbit__item--one">
                            정책
                        </span>

                        <span className="home-ai-orbit__item home-ai-orbit__item--two">
                            분석
                        </span>

                        <span className="home-ai-orbit__item home-ai-orbit__item--three">
                            추천
                        </span>
                    </div>
                </div>
            </section>

            <section
                className="home-statistics"
                aria-label="정책 통계"
            >
                <article className="home-stat-card">
                    <span className="home-stat-card__label">
                        전체 정책
                    </span>

                    <strong>
                        {isLoading ? (
                            <StatSkeleton />
                        ) : (
                            statistics.total.toLocaleString()
                        )}
                    </strong>

                    <p>
                        현재 등록된 지원사업
                    </p>
                </article>

                <article className="home-stat-card home-stat-card--available">
                    <span className="home-stat-card__label">
                        신청 가능
                    </span>

                    <strong>
                        {isLoading ? (
                            <StatSkeleton />
                        ) : (
                            statistics.available.toLocaleString()
                        )}
                    </strong>

                    <p>
                        마감되지 않은 정책
                    </p>
                </article>

                <article className="home-stat-card home-stat-card--deadline">
                    <span className="home-stat-card__label">
                        마감 임박
                    </span>

                    <strong>
                        {isLoading ? (
                            <StatSkeleton />
                        ) : (
                            statistics.deadline_approaching.toLocaleString()
                        )}
                    </strong>
                    <p>
                        7일 이내 마감 예정
                    </p>
                </article>

                <article className="home-stat-card home-stat-card--recent">
                    <span className="home-stat-card__label">
                        최근 본 정책
                    </span>

                    <strong>
                        {isLoading ? (
                            <StatSkeleton />
                        ) : (
                            recentPolicies.length.toLocaleString()
                        )}
                    </strong>

                    <p>
                        최근 7일간 확인한 정책
                    </p>
                </article>
            </section>

            {errorMessage && (
                <ErrorState
                    title="일부 정보를 표시하지 못했습니다."
                    message={errorMessage}
                    compact
                    className="home-dashboard-error"
                />
            )}

            <section className="home-dashboard-grid">
                <div className="home-recent-section">
                    <header className="home-section-heading">
                        <div>
                            <span>
                                RECENT POLICIES
                            </span>

                            <h2>
                                최근 본 정책
                            </h2>

                            <p>
                                최근 확인한 정책을
                                빠르게 다시 열어보세요.
                            </p>
                        </div>

                        <Link
                            to="/recent"
                            className="home-section-more-link"
                        >
                            전체 보기
                        </Link>
                    </header>

                    {displayedRecentPolicies.length
                        === 0
                        ? (
                            <div className="home-recent-empty">
                                <div
                                    className="home-recent-empty__icon"
                                    aria-hidden="true"
                                >
                                    ◷
                                </div>

                                <div>
                                    <strong>
                                        아직 확인한 정책이 없습니다
                                    </strong>

                                    <p>
                                        정책 상세페이지를 열면
                                        최근 본 정책으로 자동
                                        저장됩니다.
                                    </p>
                                </div>

                                <Link
                                    to="/policies"
                                >
                                    정책 둘러보기
                                </Link>
                            </div>
                        )
                        : (
                            <div className="home-recent-list">
                                {
                                    displayedRecentPolicies
                                        .map(
                                            (
                                                policy,
                                            ) => (
                                                <article
                                                    key={
                                                        policy
                                                            .policyId
                                                    }
                                                    className="home-recent-card"
                                                >
                                                    <div className="home-recent-card__meta">
                                                        <span>
                                                            {
                                                                policy
                                                                    .source
                                                            }
                                                        </span>

                                                        <small>
                                                            {
                                                                formatViewedAt(
                                                                    policy
                                                                        .viewedAt,
                                                                )
                                                            }
                                                        </small>
                                                    </div>

                                                    <h3>
                                                        {
                                                            policy
                                                                .title
                                                        }
                                                    </h3>

                                                    <p>
                                                        {
                                                            policy
                                                                .organization
                                                        }
                                                    </p>

                                                    <Link
                                                        to={
                                                            `/policies/${encodeURIComponent(
                                                                policy
                                                                    .policyId,
                                                            )}`
                                                        }
                                                    >
                                                        다시 보기
                                                    </Link>
                                                </article>
                                            ),
                                        )
                                }
                            </div>
                        )}
                </div>

                <aside className="home-quick-section">
                    <header className="home-section-heading">
                        <div>
                            <span>
                                QUICK START
                            </span>

                            <h2>
                                빠른 시작
                            </h2>

                            <p>
                                원하는 기능으로 바로
                                이동하세요.
                            </p>
                        </div>
                    </header>

                    <nav
                        className="home-quick-menu"
                        aria-label="빠른 메뉴"
                    >
                        <Link
                            to="/recommend"
                            className="home-quick-card home-quick-card--primary"
                        >
                            <span className="home-quick-card__icon">
                                AI
                            </span>

                            <div>
                                <strong>
                                    맞춤 정책 추천
                                </strong>

                                <p>
                                    나이, 지역과 관심 분야를
                                    입력해 추천받기
                                </p>
                            </div>

                            <span
                                className="home-quick-card__arrow"
                                aria-hidden="true"
                            >
                                →
                            </span>
                        </Link>

                        <Link
                            to="/policies"
                            className="home-quick-card"
                        >
                            <span className="home-quick-card__icon">
                                ⌕
                            </span>

                            <div>
                                <strong>
                                    정책 조회
                                </strong>

                                <p>
                                    키워드와 조건으로
                                    지원사업 검색하기
                                </p>
                            </div>

                            <span
                                className="home-quick-card__arrow"
                                aria-hidden="true"
                            >
                                →
                            </span>
                        </Link>

                        <Link
                            to="/bookmarks"
                            className="home-quick-card"
                        >
                            <span className="home-quick-card__icon">
                                ☆
                            </span>

                            <div>
                                <strong>
                                    북마크
                                </strong>

                                <p>
                                    저장해둔 정책을
                                    한곳에서 다시 보기
                                </p>
                            </div>

                            <span
                                className="home-quick-card__arrow"
                                aria-hidden="true"
                            >
                                →
                            </span>
                        </Link>
                    </nav>
                </aside>
            </section>
        </main>
    );
}