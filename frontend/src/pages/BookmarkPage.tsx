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
    getBookmarks,
    removeBookmark,
    removeBookmarks,
} from "../api/bookmarkApi";

import PolicyCard from
    "../components/policy/PolicyCard";

import ConfirmModal from
    "../components/common/ConfirmModal";

import {
    EmptyState,
    ErrorState,
    LoadingSpinner,
} from "../components/common";

import type {
    Policy,
} from "../types/policy";

type BookmarkSort =
    | "default"
    | "title"
    | "organization"
    | "source"
    | "deadline";

function normalizeText(
    value?: string | null,
): string {
    return (
        value
        ?? ""
    )
        .trim()
        .toLocaleLowerCase(
            "ko-KR",
        );
}

function compareText(
    first?: string | null,
    second?: string | null,
): number {
    return (
        first
        ?? ""
    ).localeCompare(
        second
        ?? "",
        "ko-KR",
    );
}

function getPolicyKey(
    policy: Policy,
): string {
    return (
        `${policy.source}-${policy.id}`
    );
}

function getPolicySearchText(
    policy: Policy,
): string {
    return [
        policy.title,
        policy.organization,
        policy.source,
        ...(policy.regions ?? []),
        ...(policy.targets ?? []),
        ...(policy.support_types ?? []),
    ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase(
            "ko-KR",
        );
}

function sortPolicies(
    policies: Policy[],
    sort: BookmarkSort,
): Policy[] {
    const copiedPolicies = [
        ...policies,
    ];

    switch (sort) {
        case "title":
            return copiedPolicies.sort(
                (
                    first,
                    second,
                ) =>
                    compareText(
                        first.title,
                        second.title,
                    ),
            );

        case "organization":
            return copiedPolicies.sort(
                (
                    first,
                    second,
                ) =>
                    compareText(
                        first.organization,
                        second.organization,
                    ),
            );

        case "source":
            return copiedPolicies.sort(
                (
                    first,
                    second,
                ) =>
                    compareText(
                        first.source,
                        second.source,
                    ),
            );

        case "deadline":
            return copiedPolicies.sort(
                (
                    first,
                    second,
                ) => {
                    const firstDate =
                        first.end_date
                        ?? "9999-12-31";

                    const secondDate =
                        second.end_date
                        ?? "9999-12-31";

                    return (
                        firstDate.localeCompare(
                            secondDate,
                        )
                    );
                },
            );

        case "default":
        default:
            return copiedPolicies;
    }
}

export default function BookmarkPage() {
    const [
        policies,
        setPolicies,
    ] = useState<Policy[]>([]);

    const [
        searchKeyword,
        setSearchKeyword,
    ] = useState("");

    const [
        selectedSort,
        setSelectedSort,
    ] = useState<BookmarkSort>(
        "default",
    );

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        deletingPolicyIds,
        setDeletingPolicyIds,
    ] = useState<
        Set<string>
    >(
        () => new Set(),
    );

    const [
        isClearing,
        setIsClearing,
    ] = useState(false);

    const [
        isClearModalOpen,
        setIsClearModalOpen,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        actionMessage,
        setActionMessage,
    ] = useState("");

    const loadBookmarks =
        useCallback(
            async (): Promise<void> => {
                try {
                    setLoading(true);
                    setError("");

                    const data =
                        await getBookmarks();

                    setPolicies(
                        data,
                    );
                } catch (
                    requestError
                ) {
                    console.error(
                        requestError,
                    );

                    setError(
                        "북마크 목록을 불러오지 못했습니다.",
                    );
                } finally {
                    setLoading(false);
                }
            },
            [],
        );

    useEffect(() => {
        void loadBookmarks();
    }, [loadBookmarks]);

    const filteredPolicies =
        useMemo(
            () => {
                const normalizedKeyword =
                    normalizeText(
                        searchKeyword,
                    );

                const matchedPolicies =
                    normalizedKeyword
                        ? policies.filter(
                            (
                                policy,
                            ) =>
                                getPolicySearchText(
                                    policy,
                                ).includes(
                                    normalizedKeyword,
                                ),
                        )
                        : policies;

                return sortPolicies(
                    matchedPolicies,
                    selectedSort,
                );
            },
            [
                policies,
                searchKeyword,
                selectedSort,
            ],
        );

    const handleRemove =
        async (
            policy: Policy,
        ): Promise<void> => {
            const policyId =
                String(policy.id);

            if (
                deletingPolicyIds.has(
                    policyId,
                )
                || isClearing
            ) {
                return;
            }

            setActionMessage("");
            setError("");

            setDeletingPolicyIds(
                (
                    current,
                ) => {
                    const next =
                        new Set(
                            current,
                        );

                    next.add(
                        policyId,
                    );

                    return next;
                },
            );

            try {
                const success =
                    await removeBookmark(
                        policyId,
                    );

                if (!success) {
                    throw new Error(
                        "북마크 삭제에 실패했습니다.",
                    );
                }

                setPolicies(
                    (
                        current,
                    ) =>
                        current.filter(
                            (
                                item,
                            ) =>
                                String(
                                    item.id,
                                )
                                !== policyId,
                        ),
                );

                setActionMessage(
                    "북마크에서 삭제했습니다.",
                );
            } catch (
                requestError
            ) {
                console.error(
                    requestError,
                );

                setError(
                    "선택한 북마크를 삭제하지 못했습니다.",
                );
            } finally {
                setDeletingPolicyIds(
                    (
                        current,
                    ) => {
                        const next =
                            new Set(
                                current,
                            );

                        next.delete(
                            policyId,
                        );

                        return next;
                    },
                );
            }
        };

    const handleClear =
        async (): Promise<void> => {
            if (
                policies.length === 0
                || isClearing
            ) {
                return;
            }

            setIsClearModalOpen(false);
            setIsClearing(true);
            setActionMessage("");
            setError("");

            const policyIds =
                policies.map(
                    (
                        policy,
                    ) =>
                        String(
                            policy.id,
                        ),
                );

            try {
                const result =
                    await removeBookmarks(
                        policyIds,
                    );

                const removedIdSet =
                    new Set(
                        result
                            .removedPolicyIds,
                    );

                setPolicies(
                    (
                        current,
                    ) =>
                        current.filter(
                            (
                                policy,
                            ) =>
                                !removedIdSet.has(
                                    String(
                                        policy.id,
                                    ),
                                ),
                        ),
                );

                if (
                    result
                        .failedPolicyIds
                        .length > 0
                ) {
                    setError(
                        `${result.failedPolicyIds.length}개의 북마크를 삭제하지 못했습니다.`,
                    );

                    return;
                }

                setActionMessage(
                    "모든 북마크를 삭제했습니다.",
                );
            } catch (
                requestError
            ) {
                console.error(
                    requestError,
                );

                setError(
                    "북마크 전체 삭제에 실패했습니다.",
                );
            } finally {
                setIsClearing(false);
            }
        };

    const handleResetFilters =
        (): void => {
            setSearchKeyword("");
            setSelectedSort(
                "default",
            );
        };

    if (loading) {
        return (
            <main className="bookmark-page">
                <LoadingSpinner
                    message="북마크를 불러오고 있습니다."
                    fullPage
                />
            </main>
        );
    }

    if (
        error
        && policies.length === 0
    ) {
        return (
            <main className="bookmark-page">
                <ErrorState
                    title="북마크를 불러오지 못했습니다."
                    message={error}
                    retryLabel="다시 시도"
                    onRetry={() => {
                        void loadBookmarks();
                    }}
                />
            </main>
        );
    }

    return (
        <main className="bookmark-page">
            <header className="bookmark-page-header">
                <div>
                    <span className="bookmark-page-eyebrow">
                        SAVED POLICIES
                    </span>

                    <h1>
                        북마크
                    </h1>

                    <p>
                        저장해둔 지원사업을 검색하고 다시 확인할 수 있습니다.
                    </p>
                </div>

                <div className="bookmark-page-count">
                    <span>
                        저장한 정책
                    </span>

                    <strong>
                        {policies.length}
                    </strong>
                </div>
            </header>

            {policies.length > 0 && (
                <section
                    className="bookmark-toolbar"
                    aria-label="북마크 검색 및 정렬"
                >
                    <label className="bookmark-search-field">
                        <span className="sr-only">
                            북마크 검색
                        </span>

                        <span
                            className="bookmark-search-field__icon"
                            aria-hidden="true"
                        >
                            ⌕
                        </span>

                        <input
                            type="search"
                            value={
                                searchKeyword
                            }
                            onChange={(
                                event,
                            ) => {
                                setSearchKeyword(
                                    event
                                        .target
                                        .value,
                                );
                            }}
                            placeholder="정책명, 기관, 출처, 분야 검색"
                        />

                        {searchKeyword && (
                            <button
                                type="button"
                                className="bookmark-search-clear"
                                onClick={() => {
                                    setSearchKeyword(
                                        "",
                                    );
                                }}
                                aria-label="검색어 지우기"
                            >
                                ×
                            </button>
                        )}
                    </label>

                    <label className="bookmark-sort-field">
                        <span>
                            정렬
                        </span>

                        <select
                            value={
                                selectedSort
                            }
                            onChange={(
                                event,
                            ) => {
                              
                              const nextSort: BookmarkSort =
                                  event.target.value as BookmarkSort;

                              setSelectedSort(nextSort);
                            }}
                        >
                            <option value="default">
                                기본 순서
                            </option>

                            <option value="title">
                                정책명순
                            </option>

                            <option value="organization">
                                기관명순
                            </option>

                            <option value="source">
                                출처순
                            </option>

                            <option value="deadline">
                                마감 임박순
                            </option>
                        </select>
                    </label>

                    <button
                        type="button"
                        className="ui-button ui-button--danger bookmark-clear-all-button"
                        onClick={() => {
                            setIsClearModalOpen(true);
                        }}
                        disabled={
                            isClearing
                        }
                    >
                        {isClearing
                            ? "삭제 중"
                            : "전체 삭제"}
                    </button>
                </section>
            )}

            {actionMessage && (
                <div
                    className="bookmark-action-message"
                    role="status"
                    aria-live="polite"
                >
                    <span
                        aria-hidden="true"
                    >
                        ✓
                    </span>

                    {actionMessage}
                </div>
            )}

            {error && (
                <div
                    className="bookmark-action-error"
                    role="alert"
                >
                    <span
                        aria-hidden="true"
                    >
                        !
                    </span>

                    {error}
                </div>
            )}

            {policies.length === 0
                ? (
                    <section className="bookmark-empty">
                        <EmptyState
                            title="저장한 정책이 없습니다."
                            description="정책 조회 또는 맞춤 추천에서 관심 있는 정책을 북마크해 보세요."
                            compact
                        />

                        <div className="bookmark-empty__actions">
                            <Link
                                to="/policies"
                                className="ui-button ui-button--primary bookmark-primary-link"
                            >
                                정책 조회하기
                            </Link>

                            <Link
                                to="/recommend"
                                className="ui-button ui-button--secondary bookmark-secondary-link"
                            >
                                맞춤 추천받기
                            </Link>
                        </div>
                    </section>
                )
                : filteredPolicies.length
                    === 0
                    ? (
                        <EmptyState
                            title="검색 결과가 없습니다."
                            description="다른 검색어를 입력하거나 검색 조건을 초기화해 주세요."
                            actionLabel="검색 초기화"
                            onAction={handleResetFilters}
                        />
                    )
                    : (
                        <>
                            <div className="bookmark-result-summary">
                                <p>
                                    총{" "}
                                    <strong>
                                        {
                                            policies
                                                .length
                                        }
                                    </strong>
                                    개 중{" "}
                                    <strong>
                                        {
                                            filteredPolicies
                                                .length
                                        }
                                    </strong>
                                    개를 표시하고 있습니다.
                                </p>
                            </div>

                            <section
                                className="bookmark-policy-grid"
                                aria-label="저장한 정책 목록"
                            >
                                {filteredPolicies.map(
                                    (
                                        policy,
                                    ) => {
                                        const policyId =
                                            String(
                                                policy.id,
                                            );

                                        const isDeleting =
                                            deletingPolicyIds.has(
                                                policyId,
                                            );

                                        return (
                                            <article
                                                key={
                                                    getPolicyKey(
                                                        policy,
                                                    )
                                                }
                                                className="bookmark-policy-item"
                                            >
                                                <PolicyCard
                                                    policy={
                                                        policy
                                                    }
                                                />

                                                <button
                                                    type="button"
                                                    className="ui-button ui-button--secondary bookmark-policy-remove-button"
                                                    onClick={() => {
                                                        void handleRemove(
                                                            policy,
                                                        );
                                                    }}
                                                    disabled={
                                                        isDeleting
                                                        || isClearing
                                                    }
                                                >
                                                    <span
                                                        aria-hidden="true"
                                                    >
                                                        ×
                                                    </span>

                                                    {isDeleting
                                                        ? "삭제 중"
                                                        : "목록에서 삭제"}
                                                </button>
                                            </article>
                                        );
                                    },
                                )}
                            </section>
                        </>
                    )}
            <ConfirmModal
                isOpen={isClearModalOpen}
                title="저장한 북마크를 모두 삭제할까요?"
                description={`저장한 북마크 ${policies.length}개가 모두 삭제됩니다.`}
                cancelLabel="취소"
                confirmLabel="전체 삭제"
                isDanger
                onCancel={() => {
                    setIsClearModalOpen(false);
                }}
                onConfirm={() => {
                    void handleClear();
                }}
            />
        </main>
    );
}