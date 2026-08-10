import {
    useEffect,
} from "react";

import {
    useAdmin,
} from "../hooks/useAdmin";

import {
    LoadingSpinner,
    ErrorState,
    EmptyState,
} from "../components/common";

import {
    useToast,
} from "../components/common/toast/useToast";

import AdminSummarySkeleton from
    "../components/common/AdminSummarySkeleton";

    import AdminSyncChart from
    "../components/common/AdminSyncChart";
    
function formatDateTime(
    value: string | null,
    fallback: string,
): string {
    if (!value) {
        return fallback;
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
        return fallback;
    }

    return date.toLocaleString(
        "ko-KR",
    );
}

export default function AdminPage() {
    const toast = useToast();

    const {
        dashboard,
        syncLogs,
        cacheStatus,

        isLoading,
        isSyncing,
        isClearingCache,

        message,
        error,

        reload,
        handleSync,
        handleClearCache,
    } = useAdmin();

    useEffect(() => {
        if (
            !dashboard
            || !message
        ) {
            return;
        }

        toast.success(message);
    }, [
        dashboard,
        message,
        toast,
    ]);

    useEffect(() => {
        if (
            !dashboard
            || !error
        ) {
            return;
        }

        toast.error(error);
    }, [
        dashboard,
        error,
        toast,
    ]);

    const safeSyncLogs =
      Array.isArray(syncLogs)
          ? syncLogs
          : [];

    if (
    isLoading
    && !dashboard
    ) {
        return (
            <main className="admin-page">
                <header className="admin-header">
                    <div>
                        <span className="admin-header-label">
                            POLICY AI
                        </span>

                        <h1>
                            관리자 대시보드
                        </h1>

                        <p>
                            정책 수집 및 데이터 동기화 현황을
                            확인합니다.
                        </p>
                    </div>
                </header>

                <AdminSummarySkeleton />

                <LoadingSpinner
                    message="동기화 이력과 캐시 상태를 불러오는 중입니다."
                    size="sm"
                />
            </main>
        );
    }

    if (!dashboard) {
        return (
            <main className="admin-page">
                <ErrorState
                    title="관리자 데이터를 불러오지 못했습니다."
                    message={
                        error
                        || "관리자 데이터를 불러오지 못했습니다."
                    }
                    retryLabel="다시 시도"
                    onRetry={() => {
                        void reload();
                    }}
                />
            </main>
        );
    }

    const latestSync =
        formatDateTime(
            dashboard.latest_sync,
            "동기화 기록 없음",
        );

    return (
        <main className="admin-page">
            <header className="admin-header">
                <div>
                    <span className="admin-header-label">
                        POLICY AI
                    </span>

                    <h1>
                        관리자 대시보드
                    </h1>

                    <p>
                        정책 수집 및 데이터 동기화 현황을
                        확인합니다.
                    </p>
                </div>

                <div className="admin-header-actions">
                    <div className="admin-sync-info">
                        <span>
                            마지막 동기화
                        </span>

                        <strong>
                            {latestSync}
                        </strong>
                    </div>

                    <button
                        type="button"
                        className="ui-button ui-button--primary admin-sync-button"
                        onClick={() => {
                            void handleSync();
                        }}
                        disabled={
                            isSyncing
                            || isClearingCache
                        }
                    >
                        {isSyncing
                            ? "동기화 중..."
                            : "정책 동기화"}
                    </button>
                </div>
            </header>

            <section className="admin-summary-grid">
                <article className="admin-summary-card admin-summary-main">
                    <div className="admin-card-content">
                        <span>
                            전체 정책
                        </span>

                        <strong>
                            {dashboard
                                .policy_count
                                .toLocaleString()}
                        </strong>

                        <p>
                            현재 저장된 정책 수
                        </p>
                    </div>
                </article>

                <article className="admin-summary-card">
                    <div className="admin-card-content">
                        <span>
                            수집된 정책
                        </span>

                        <strong>
                            {dashboard
                                .collected_count
                                .toLocaleString()}
                        </strong>

                        <p>
                            최근 수집한 정책 수
                        </p>
                    </div>
                </article>

                <article className="admin-summary-card">
                    <div className="admin-card-content">
                        <span>
                            신규 정책
                        </span>

                        <strong>
                            {dashboard
                                .inserted_count
                                .toLocaleString()}
                        </strong>

                        <p>
                            새롭게 등록된 정책 수
                        </p>
                    </div>
                </article>

                <article className="admin-summary-card">
                    <div className="admin-card-content">
                        <span>
                            업데이트
                        </span>

                        <strong>
                            {dashboard
                                .updated_count
                                .toLocaleString()}
                        </strong>

                        <p>
                            내용이 변경된 정책 수
                        </p>
                    </div>
                </article>
            </section>
                <AdminSyncChart
                    logs={safeSyncLogs}
                />
            <section className="admin-history">
                <div className="admin-history-header">
                    <div>
                        <h2>
                            최근 동기화 이력
                        </h2>

                        <p>
                            최근 정책 수집 실행 결과를
                            확인합니다.
                        </p>
                    </div>

                    <span>
                        최근 {safeSyncLogs.length}건
                    </span>
                </div>

                {safeSyncLogs.length === 0
                    ? (
                        <EmptyState
                            title="아직 동기화 이력이 없습니다."
                            description="정책 동기화를 실행하면 여기에 기록이 표시됩니다."
                            compact
                        />
                    )
                    : (
                        <div className="admin-history-list">
                            {safeSyncLogs.map(
                                (
                                    log,
                                ) => (
                                    <article
                                        key={log.id}
                                        className="history-card"
                                    >
                                        <div className="history-card-top">
                                            <strong>
                                                {formatDateTime(
                                                    log.created_at,
                                                    "시간 확인 불가",
                                                )}
                                            </strong>

                                            <span
                                                className={
                                                    log.status
                                                    === "SUCCESS"
                                                        ? "history-status success"
                                                        : "history-status failure"
                                                }
                                            >
                                                {log.status
                                                    === "SUCCESS"
                                                        ? "성공"
                                                        : "실패"}
                                            </span>
                                        </div>

                                        <div className="history-counts">
                                            <div>
                                                <span>
                                                    수집
                                                </span>

                                                <strong>
                                                    {log
                                                        .collected_count
                                                        .toLocaleString()}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    신규
                                                </span>

                                                <strong>
                                                    {log
                                                        .inserted_count
                                                        .toLocaleString()}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    업데이트
                                                </span>

                                                <strong>
                                                    {log
                                                        .updated_count
                                                        .toLocaleString()}
                                                </strong>
                                            </div>
                                        </div>

                                        {log.error_message
                                            && (
                                                <p className="history-error-message">
                                                    {log.error_message}
                                                </p>
                                            )}
                                    </article>
                                ),
                            )}
                        </div>
                    )}
            </section>

            <section className="admin-cache-section">
                <div className="admin-cache-header">
                    <div>
                        <h2>
                            캐시 관리
                        </h2>

                        <p>
                            현재 정책 캐시 상태를 확인하고
                            초기화합니다.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="ui-button ui-button--danger admin-cache-clear-button"
                        onClick={() => {
                            void handleClearCache();
                        }}
                        disabled={
                            isClearingCache
                            || isSyncing
                            || !cacheStatus
                            || cacheStatus
                                .cached_count
                                === 0
                        }
                    >
                        {isClearingCache
                            ? "비우는 중..."
                            : "캐시 비우기"}
                    </button>
                </div>

                {!cacheStatus
                    ? (
                        <EmptyState
                            title="캐시 상태를 확인할 수 없습니다."
                            description="캐시 상태 API가 아직 연결되지 않았습니다."
                            compact
                        />
                    )
                    : (
                        <div className="admin-cache-grid">
                            <div className="admin-cache-item">
                                <span>
                                    캐시 개수
                                </span>

                                <strong>
                                    {cacheStatus
                                        .cached_count
                                        .toLocaleString()}
                                    건
                                </strong>
                            </div>

                            <div className="admin-cache-item">
                                <span>
                                    캐시 상태
                                </span>

                                <strong>
                                    {cacheStatus.is_valid
                                        ? "사용 가능"
                                        : "만료 또는 비어 있음"}
                                </strong>
                            </div>

                            <div className="admin-cache-item">
                                <span>
                                    마지막 갱신
                                </span>

                                <strong>
                                    {formatDateTime(
                                        cacheStatus.updated_at,
                                        "기록 없음",
                                    )}
                                </strong>
                            </div>

                            <div className="admin-cache-item">
                                <span>
                                    유효 시간
                                </span>

                                <strong>
                                    {cacheStatus.cache_minutes}분
                                </strong>
                            </div>
                        </div>
                    )}
            </section>
        </main>
    );
}