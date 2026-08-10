import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    clearPolicyCache,
    getAdminDashboard,
    getCacheStatus,
    getSyncHistory,
    syncPolicies,
} from "../api/adminApi";

import type {
    AdminDashboard,
    CacheStatus,
    SyncLog,
} from "../api/adminApi";

export function useAdmin() {
    const [
        dashboard,
        setDashboard,
    ] = useState<AdminDashboard | null>(
        null,
    );

    const [
        syncLogs,
        setSyncLogs,
    ] = useState<SyncLog[]>([]);

    const [
        cacheStatus,
        setCacheStatus,
    ] = useState<CacheStatus | null>(
        null,
    );

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        isSyncing,
        setIsSyncing,
    ] = useState(false);

    const [
        isClearingCache,
        setIsClearingCache,
    ] = useState(false);

    const [
        message,
        setMessage,
    ] = useState("");

    const [
        error,
        setError,
    ] = useState("");

    const loadDashboard =
        useCallback(
            async (): Promise<
                AdminDashboard | null
            > => {
                try {
                    const data =
                        await getAdminDashboard();

                    setDashboard(data);

                    return data;
                } catch (
                    requestError
                ) {
                    setDashboard(null);

                    setError(
                        requestError
                            instanceof Error
                            ? requestError.message
                            : "관리자 데이터를 불러오지 못했습니다.",
                    );

                    return null;
                }
            },
            [],
        );

    const loadSyncLogs =
        useCallback(
            async (): Promise<void> => {
                try {
                    const logs =
                        await getSyncHistory(
                            10,
                        );

                    setSyncLogs(
                        Array.isArray(logs)
                            ? logs
                            : [],
                    );
                } catch (
                    requestError
                ) {
                    console.warn(
                        "동기화 이력을 불러오지 못했습니다.",
                        requestError,
                    );

                    setSyncLogs([]);
                }
            },
            [],
        );

    const loadCacheStatus =
        useCallback(
            async (): Promise<void> => {
                try {
                    const data =
                        await getCacheStatus();

                    setCacheStatus(data);
                } catch (
                    requestError
                ) {
                    console.warn(
                        "캐시 상태를 불러오지 못했습니다.",
                        requestError,
                    );

                    setCacheStatus(null);
                }
            },
            [],
        );

    const loadAdminData =
        useCallback(
            async (): Promise<void> => {
                setIsLoading(true);
                setError("");

                const data =
                    await loadDashboard();

                setIsLoading(false);

                if (!data) {
                    return;
                }

                void loadSyncLogs();
                void loadCacheStatus();
            },
            [
                loadDashboard,
                loadSyncLogs,
                loadCacheStatus,
            ],
        );

    useEffect(() => {
        void loadAdminData();
    }, [loadAdminData]);

    const handleSync =
        useCallback(
            async (): Promise<void> => {
                if (isSyncing) {
                    return;
                }

                const confirmed =
                    window.confirm(
                        "정책 데이터를 지금 동기화할까요?",
                    );

                if (!confirmed) {
                    return;
                }

                setIsSyncing(true);
                setMessage("");
                setError("");

                try {
                    const result =
                        await syncPolicies();

                    setMessage(
                        `동기화 완료: 수집 ${result.collected_count}건, `
                        + `신규 ${result.inserted_count}건, `
                        + `업데이트 ${result.updated_count}건`,
                    );

                    await loadDashboard();

                    void loadSyncLogs();
                    void loadCacheStatus();
                } catch (
                    requestError
                ) {
                    setError(
                        requestError
                            instanceof Error
                            ? requestError.message
                            : "정책 동기화 중 오류가 발생했습니다.",
                    );
                } finally {
                    setIsSyncing(false);
                }
            },
            [
                isSyncing,
                loadDashboard,
                loadSyncLogs,
                loadCacheStatus,
            ],
        );

    const handleClearCache =
        useCallback(
            async (): Promise<void> => {
                if (
                    isClearingCache
                    || !cacheStatus
                    || cacheStatus.cached_count
                        === 0
                ) {
                    return;
                }

                const confirmed =
                    window.confirm(
                        "정책 캐시를 모두 비울까요?",
                    );

                if (!confirmed) {
                    return;
                }

                setIsClearingCache(true);
                setMessage("");
                setError("");

                try {
                    await clearPolicyCache();

                    setMessage(
                        "정책 캐시를 비웠습니다.",
                    );

                    await loadDashboard();
                    await loadCacheStatus();
                } catch (
                    requestError
                ) {
                    setError(
                        requestError
                            instanceof Error
                            ? requestError.message
                            : "캐시 처리 중 오류가 발생했습니다.",
                    );
                } finally {
                    setIsClearingCache(false);
                }
            },
            [
                cacheStatus,
                isClearingCache,
                loadDashboard,
                loadCacheStatus,
            ],
        );

    return {
        dashboard,
        syncLogs,
        cacheStatus,

        isLoading,
        isSyncing,
        isClearingCache,

        message,
        error,

        reload:
            loadAdminData,

        handleSync,
        handleClearCache,
    };
}