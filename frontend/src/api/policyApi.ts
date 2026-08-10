import api from "./axios";

import type {
    Policy,
} from "../types/policy";

export type PolicySearchParams = {
    keyword?: string;
    region?: string;
    target?: string;
    supportType?: string;
    source?: string;
    organization?: string;
    includeClosed?: boolean;
    page?: number;
    perPage?: number;
};

export type PolicySearchResponse = {
    items: Policy[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
};

export type PolicyStatistics = {
    total: number;
    available: number;
    deadline_approaching: number;
    closed: number;
    date_unknown: number;
};

function createSearchParams(
    params: PolicySearchParams,
): URLSearchParams {
    const query =
        new URLSearchParams();

    if (
        params.keyword?.trim()
    ) {
        query.set(
            "keyword",
            params.keyword.trim(),
        );
    }

    if (
        params.region?.trim()
    ) {
        query.set(
            "region",
            params.region.trim(),
        );
    }

    if (
        params.target?.trim()
    ) {
        query.set(
            "target",
            params.target.trim(),
        );
    }

    if (
        params.supportType?.trim()
    ) {
        query.set(
            "support_type",
            params.supportType.trim(),
        );
    }

    if (
        params.source?.trim()
    ) {
        query.set(
            "source",
            params.source.trim(),
        );
    }

    if (
        params.organization?.trim()
    ) {
        query.set(
            "organization",
            params.organization.trim(),
        );
    }

    query.set(
        "include_closed",
        String(
            params.includeClosed
            ?? false,
        ),
    );

    query.set(
        "page",
        String(
            params.page
            ?? 1,
        ),
    );

    query.set(
        "per_page",
        String(
            params.perPage
            ?? 12,
        ),
    );

    return query;
}

export async function searchPolicies(
    params: PolicySearchParams = {},
): Promise<PolicySearchResponse> {
    const query =
        createSearchParams(
            params,
        );

    const response =
        await api.get<PolicySearchResponse>(
            `/policies/search?${query.toString()}`,
        );

    return response.data;
}

export async function getPolicy(
    policyId: string,
): Promise<Policy> {
    const normalizedPolicyId =
        policyId.trim();

    if (!normalizedPolicyId) {
        throw new Error(
            "정책 번호가 올바르지 않습니다.",
        );
    }

    const response =
        await api.get<Policy>(
            `/policies/${encodeURIComponent(
                normalizedPolicyId,
            )}`,
        );

    return response.data;
}

export async function getPolicyStatistics():
    Promise<PolicyStatistics> {
    const response =
        await api.get<PolicyStatistics>(
            "/policies/statistics",
        );

    return response.data;
}

export async function getPolicies():
    Promise<Policy[]> {
    const response =
        await searchPolicies({
            includeClosed: false,
            page: 1,
            perPage: 100,
        });

    return response.items;
}