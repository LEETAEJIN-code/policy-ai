import axios from "axios";

import api from "./axios";

export interface AdminDashboard {
    policy_count: number;
    latest_sync: string | null;
    collected_count: number;
    inserted_count: number;
    updated_count: number;
    cache_count: number;
}

export interface SyncLog {
    id: number;
    status: string;
    collected_count: number;
    inserted_count: number;
    updated_count: number;
    error_message: string | null;
    created_at: string;
}

export interface CacheStatus {
    cached_count: number;
    updated_at: string | null;
    is_valid: boolean;
    cache_minutes: number;
}

export interface SyncResult {
    collected_count: number;
    inserted_count: number;
    updated_count: number;
}

interface ApiErrorBody {
    detail?: unknown;
    message?: unknown;
}

function getApiErrorMessage(
    error: unknown,
    fallbackMessage: string,
): string {
    if (!axios.isAxiosError(error)) {
        return error instanceof Error
            ? error.message
            : fallbackMessage;
    }

    const data =
        error.response?.data;

    if (
        typeof data === "object"
        && data !== null
    ) {
        const body =
            data as ApiErrorBody;

        if (
            typeof body.detail
            === "string"
        ) {
            return body.detail;
        }

        if (
            typeof body.message
            === "string"
        ) {
            return body.message;
        }
    }

    if (
        error.code
        === "ECONNABORTED"
    ) {
        return "요청 시간이 초과되었습니다.";
    }

    if (!error.response) {
        return "관리자 서버에 연결할 수 없습니다.";
    }

    return fallbackMessage;
}

export async function getAdminDashboard():
    Promise<AdminDashboard> {
    try {
        const response =
            await api.get<AdminDashboard>(
                "/admin/dashboard",
                {
                    timeout: 5000,
                },
            );

        return response.data;
    } catch (error) {
        throw new Error(
            getApiErrorMessage(
                error,
                "관리자 데이터를 불러오지 못했습니다.",
            ),
        );
    }
}

export async function getSyncHistory(
    limit = 10,
): Promise<SyncLog[]> {
    try {
        const response =
            await api.get<unknown>(
                "/policies/sync/history",
                {
                    params: {
                        limit,
                    },
                    timeout: 5000,
                },
            );

        const data =
            response.data;

        if (Array.isArray(data)) {
            return data as SyncLog[];
        }

        if (
            typeof data === "object"
            && data !== null
            && "items" in data
        ) {
            const items =
                data.items;

            return Array.isArray(items)
                ? items as SyncLog[]
                : [];
        }

        if (
            typeof data === "object"
            && data !== null
            && "logs" in data
        ) {
            const logs =
                data.logs;

            return Array.isArray(logs)
                ? logs as SyncLog[]
                : [];
        }

        return [];
    } catch (error) {
        throw new Error(
            getApiErrorMessage(
                error,
                "동기화 이력을 불러오지 못했습니다.",
            ),
        );
    }
}

export async function syncPolicies():
    Promise<SyncResult> {
    try {
        const response =
            await api.post<SyncResult>(
                "/policies/sync",
                undefined,
                {
                    timeout: 120000,
                },
            );

        return response.data;
    } catch (error) {
        throw new Error(
            getApiErrorMessage(
                error,
                "정책 동기화에 실패했습니다.",
            ),
        );
    }
}

export async function getCacheStatus():
    Promise<CacheStatus> {
    try {
        const response =
            await api.get<CacheStatus>(
                "/admin/cache/status",
                {
                    timeout: 5000,
                },
            );

        return response.data;
    } catch (error) {
        throw new Error(
            getApiErrorMessage(
                error,
                "캐시 상태를 불러오지 못했습니다.",
            ),
        );
    }
}

export async function clearPolicyCache():
    Promise<void> {
    try {
        await api.post(
            "/admin/cache/clear",
            undefined,
            {
                timeout: 5000,
            },
        );
    } catch (error) {
        throw new Error(
            getApiErrorMessage(
                error,
                "캐시 비우기에 실패했습니다.",
            ),
        );
    }
}