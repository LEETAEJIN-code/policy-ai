import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    searchPolicies,
    type PolicySearchResponse,
} from "../api/policyApi";

const DEFAULT_PER_PAGE = 12;

export type SearchFilters = {
    keyword: string;
    region: string;
    target: string;
    supportType: string;
    source: string;
    organization: string;
    includeClosed: boolean;
};

export const initialPolicyFilters: SearchFilters = {
    keyword: "",
    region: "",
    target: "",
    supportType: "",
    source: "",
    organization: "",
    includeClosed: false,
};

const initialResult: PolicySearchResponse = {
    items: [],
    total: 0,
    page: 1,
    per_page: DEFAULT_PER_PAGE,
    total_pages: 0,
};

export function usePolicies() {
    const [
        filters,
        setFilters,
    ] = useState<SearchFilters>(
        initialPolicyFilters,
    );

    const [
        appliedFilters,
        setAppliedFilters,
    ] = useState<SearchFilters>(
        initialPolicyFilters,
    );

    const [
        result,
        setResult,
    ] = useState<PolicySearchResponse>(
        initialResult,
    );

    const [
        page,
        setPage,
    ] = useState(1);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState("");

    const loadPolicies =
        useCallback(
            async (): Promise<void> => {
                setLoading(true);
                setError("");

                try {
                    const data =
                        await searchPolicies({
                            keyword:
                                appliedFilters.keyword,

                            region:
                                appliedFilters.region,

                            target:
                                appliedFilters.target,

                            supportType:
                                appliedFilters.supportType,

                            source:
                                appliedFilters.source,

                            organization:
                                appliedFilters.organization,

                            includeClosed:
                                appliedFilters.includeClosed,

                            page,

                            perPage:
                                DEFAULT_PER_PAGE,
                        });

                    setResult(data);
                } catch (
                    requestError
                ) {
                    console.error(
                        requestError,
                    );

                    setError(
                        requestError
                            instanceof Error
                            ? requestError.message
                            : "정책 데이터를 불러오지 못했습니다.",
                    );
                } finally {
                    setLoading(false);
                }
            },
            [
                appliedFilters,
                page,
            ],
        );

    useEffect(() => {
        void loadPolicies();
    }, [loadPolicies]);

    const updateFilter =
        useCallback(
            <
                K extends keyof SearchFilters,
            >(
                key: K,
                value: SearchFilters[K],
            ): void => {
                setFilters(
                    (previous) => ({
                        ...previous,
                        [key]: value,
                    }),
                );
            },
            [],
        );

    const handleSearch =
        useCallback((): void => {
            setPage(1);

            setAppliedFilters({
                ...filters,
            });
        }, [filters]);

    const handleReset =
        useCallback((): void => {
            setFilters(
                initialPolicyFilters,
            );

            setAppliedFilters(
                initialPolicyFilters,
            );

            setPage(1);
        }, []);

    const pageNumbers =
        useMemo(
            () => {
                const totalPages =
                    result.total_pages;

                if (totalPages <= 0) {
                    return [];
                }

                const startPage =
                    Math.max(
                        1,
                        Math.min(
                            page - 2,
                            totalPages - 4,
                        ),
                    );

                const endPage =
                    Math.min(
                        totalPages,
                        startPage + 4,
                    );

                return Array.from(
                    {
                        length:
                            endPage
                            - startPage
                            + 1,
                    },
                    (
                        _,
                        index,
                    ) =>
                        startPage
                        + index,
                );
            },
            [
                page,
                result.total_pages,
            ],
        );

    const goToPreviousPage =
        useCallback((): void => {
            setPage(
                (previous) =>
                    Math.max(
                        1,
                        previous - 1,
                    ),
            );
        }, []);

    const goToNextPage =
        useCallback((): void => {
            setPage(
                (previous) =>
                    Math.min(
                        result.total_pages,
                        previous + 1,
                    ),
            );
        }, [result.total_pages]);

    return {
        filters,
        result,
        page,
        pageNumbers,
        loading,
        error,

        updateFilter,
        handleSearch,
        handleReset,
        setPage,
        goToPreviousPage,
        goToNextPage,
        retry:
            loadPolicies,
    };
}