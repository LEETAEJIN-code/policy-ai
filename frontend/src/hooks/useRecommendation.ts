import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import type {
    FormEvent,
} from "react";

import {
    RecommendApiError,
    requestRecommendations,
} from "../api/recommendApi";

import type {
    Recommendation,
} from "../types/recommendation";

import type {
    RecommendationFilter,
} from "../types/recommendationFilter";

import {
    initialRecommendationFormData,
} from "../types/recommendationForm";

import type {
    RecommendationFormData,
} from "../types/recommendationForm";

import type {
    RecommendationSort,
} from "../types/recommendationSort";

import {
    calculateRecommendationFilterCount,
    filterRecommendations,
} from "../utils/filterRecommendations";

import {
    clearRecommendationState,
    loadRecommendationState,
    saveRecommendationState,
} from "../utils/recommendStorage";

import {
    sortRecommendations,
} from "../utils/sortRecommendations";

const RECOMMENDATIONS_PER_PAGE = 10;

function validateForm(
    form: RecommendationFormData,
): string | null {
    const age = Number(form.age);

    if (
        form.age.trim() === ""
        || !Number.isInteger(age)
        || age < 0
        || age > 120
    ) {
        return "올바른 나이를 입력해 주세요.";
    }

    if (!form.region) {
        return "지역을 선택해 주세요.";
    }

    if (form.targets.length === 0) {
        return "현재 상황을 하나 이상 선택해 주세요.";
    }

    if (form.interests.length === 0) {
        return "관심 분야를 하나 이상 선택해 주세요.";
    }

    return null;
}

function cloneForm(
    form: RecommendationFormData,
): RecommendationFormData {
    return {
        ...form,
        targets: [...form.targets],
        interests: [...form.interests],
    };
}

function getInitialStoredState() {
    const storedState =
        loadRecommendationState();

    return {
        form:
            storedState?.form
            ?? initialRecommendationFormData,

        recommendations:
            storedState?.recommendations
            ?? [],

        selectedFilter:
            storedState?.selectedFilter
            ?? "all",

        selectedSort:
            storedState?.selectedSort
            ?? "score_desc",

        currentPage:
            storedState?.currentPage
            ?? 1,

        hasRequested:
            storedState?.hasRequested
            ?? false,

    } satisfies {
        form: RecommendationFormData;
        recommendations:
            Recommendation[];
        selectedFilter:
            RecommendationFilter;
        selectedSort:
            RecommendationSort;
        currentPage: number;
        hasRequested: boolean;
    };
}

export function useRecommendation() {
    const initialStateRef =
        useRef(getInitialStoredState());

    const [form, setForm] =
        useState<RecommendationFormData>(
            () =>
                cloneForm(
                    initialStateRef.current.form,
                ),
        );

    const [
        recommendations,
        setRecommendations,
        ] = useState<Recommendation[]>(
            () => [
                ...initialStateRef
                    .current
                    .recommendations,
            ],
    );

    const [
        selectedFilter,
        setSelectedFilter,
    ] = useState<RecommendationFilter>(
        initialStateRef
            .current
            .selectedFilter,
    );

    const [
        selectedSort,
        setSelectedSort,
    ] = useState<RecommendationSort>(
        initialStateRef
            .current
            .selectedSort,
    );

    const [
        currentPage,
        setCurrentPage,
    ] = useState(
        initialStateRef
            .current
            .currentPage,
    );

    const [isLoading, setIsLoading] =
        useState(false);

   const [hasRequested, setHasRequested] =
        useState(
            initialStateRef
                .current
                .hasRequested,
        );

    const [formError, setFormError] =
        useState("");

    const [errorMessage, setErrorMessage] =
        useState<string | null>(null);

    const abortControllerRef =
        useRef<AbortController | null>(null);

    const lastSubmittedFormRef =
        useRef<RecommendationFormData | null>(
            null,
        );

    const filteredRecommendations =
        useMemo(
            () =>
                filterRecommendations(
                    recommendations,
                    selectedFilter,
                ),
            [
                recommendations,
                selectedFilter,
            ],
        );

    const visibleRecommendations =
        useMemo(
            () =>
                sortRecommendations(
                    filteredRecommendations,
                    selectedSort,
                ),
            [
                filteredRecommendations,
                selectedSort,
            ],
        );

    const totalPages = useMemo(
        () =>
            Math.max(
                1,
                Math.ceil(
                    visibleRecommendations.length
                    / RECOMMENDATIONS_PER_PAGE,
                ),
            ),
        [visibleRecommendations.length],
    );

    const paginatedRecommendations =
        useMemo(() => {
            const startIndex =
                (
                    currentPage - 1
                ) * RECOMMENDATIONS_PER_PAGE;

            const endIndex =
                startIndex
                + RECOMMENDATIONS_PER_PAGE;

            return visibleRecommendations.slice(
                startIndex,
                endIndex,
            );
        }, [
            visibleRecommendations,
            currentPage,
        ]);

    const paginationRange =
        useMemo(() => {
            if (
                visibleRecommendations.length
                === 0
            ) {
                return {
                    start: 0,
                    end: 0,
                };
            }

            const start =
                (
                    currentPage - 1
                ) * RECOMMENDATIONS_PER_PAGE
                + 1;

            const end = Math.min(
                currentPage
                    * RECOMMENDATIONS_PER_PAGE,
                visibleRecommendations.length,
            );

            return {
                start,
                end,
            };
        }, [
            currentPage,
            visibleRecommendations.length,
        ]);

    const filterCount = useMemo(
        () =>
            calculateRecommendationFilterCount(
                recommendations,
            ),
        [recommendations],
    );

    const updateForm = useCallback(
        (
            updater: (
                current:
                    RecommendationFormData,
            ) => RecommendationFormData,
        ) => {
            setForm(updater);
            setFormError("");
        },
        [],
    );

    const handleAgeChange = useCallback(
        (value: string) => {
            updateForm((current) => ({
                ...current,
                age: value,
            }));
        },
        [updateForm],
    );

    const handleRegionChange = useCallback(
        (value: string) => {
            updateForm((current) => ({
                ...current,
                region: value,
            }));
        },
        [updateForm],
    );

    const handleToggleTarget = useCallback(
        (target: string) => {
            updateForm((current) => ({
                ...current,

                targets:
                    current.targets.includes(
                        target,
                    )
                        ? current.targets.filter(
                            (item) =>
                                item !== target,
                        )
                        : [
                            ...current.targets,
                            target,
                        ],
            }));
        },
        [updateForm],
    );

    const handleToggleInterest =
        useCallback(
            (interest: string) => {
                updateForm((current) => ({
                    ...current,

                    interests:
                        current.interests.includes(
                            interest,
                        )
                            ? current
                                .interests
                                .filter(
                                    (item) =>
                                        item
                                        !== interest,
                                )
                            : [
                                ...current
                                    .interests,
                                interest,
                            ],
                }));
            },
            [updateForm],
        );

    const handleSupportTypeChange =
        useCallback(
            (supportType: string) => {
                updateForm((current) => ({
                    ...current,

                    supportType:
                        current.supportType
                        === supportType
                            ? ""
                            : supportType,
                }));
            },
            [updateForm],
        );

    const loadRecommendations =
        useCallback(
            async (
                submittedForm:
                    RecommendationFormData,
            ): Promise<void> => {
                abortControllerRef.current
                    ?.abort();

                const controller =
                    new AbortController();

                abortControllerRef.current =
                    controller;

                setIsLoading(true);
                setErrorMessage(null);
                setSelectedFilter("all");
                setSelectedSort("score_desc");
                setCurrentPage(1);
                setHasRequested(true);

                lastSubmittedFormRef.current =
                    cloneForm(submittedForm);

                try {
                    const response =
                        await requestRecommendations(
                            submittedForm,
                            controller.signal,
                        );

                    setRecommendations(
                        response.recommendations,
                    );
                } catch (error) {
                    if (
                        error
                            instanceof DOMException
                        && error.name
                            === "AbortError"
                    ) {
                        return;
                    }

                    setRecommendations([]);
    
                    if (
                        error
                            instanceof RecommendApiError
                    ) {
                        setErrorMessage(
                            error.message,
                        );

                        return;
                    }

                    setErrorMessage(
                        "추천 정보를 불러오는 중 오류가 발생했습니다.",
                    );
                } finally {
                    if (
                        abortControllerRef
                            .current
                        === controller
                    ) {
                        abortControllerRef.current =
                            null;

                        setIsLoading(false);
                    }
                }
            },
            [],
        );

    const handleSubmit = useCallback(
        (
            event:
                FormEvent<HTMLFormElement>,
        ) => {
            event.preventDefault();

            const validationMessage =
                validateForm(form);

            if (validationMessage) {
                setFormError(
                    validationMessage,
                );

                return;
            }

            setFormError("");

            void loadRecommendations(form);
        },
        [
            form,
            loadRecommendations,
        ],
    );

    const retry = useCallback(
        async (): Promise<void> => {
            if (
                !lastSubmittedFormRef.current
            ) {
                return;
            }

            await loadRecommendations(
                lastSubmittedFormRef.current,
            );
        },
        [loadRecommendations],
    );

    const handleFilterChange =
        useCallback(
            (
                filter:
                    RecommendationFilter,
            ) => {
                setSelectedFilter(filter);
                setCurrentPage(1);
            },
            [],
        );

    const handleSortChange =
        useCallback(
            (
                sort:
                    RecommendationSort,
            ) => {
                setSelectedSort(sort);
                setCurrentPage(1);
            },
            [],
        );

    const handlePageChange =
        useCallback(
            (page: number) => {
                const safePage = Math.min(
                    Math.max(1, page),
                    totalPages,
                );

                setCurrentPage(safePage);
            },
            [totalPages],
        );

    const handleResetRecommendation =
    useCallback(() => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;

        setForm({
            ...initialRecommendationFormData,
            targets: [],
            interests: [],
        });

        setRecommendations([]);
        setSelectedFilter("all");
        setSelectedSort("score_desc");
        setCurrentPage(1);

        setIsLoading(false);
        setHasRequested(false);
        setFormError("");
        setErrorMessage(null);

        lastSubmittedFormRef.current = null;

        clearRecommendationState();
    }, []);

    useEffect(() => {
        saveRecommendationState({
            form,
            recommendations,
            selectedFilter,
            selectedSort,
            currentPage,
            hasRequested,
        });
    }, [
        form,
        recommendations,
        selectedFilter,
        selectedSort,
        currentPage,
        hasRequested,
    ]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [
        currentPage,
        totalPages,
    ]);

    useEffect(() => {
        return () => {
            abortControllerRef.current
                ?.abort();
        };
    }, []);

    return {
        form,
        recommendations,

        visibleRecommendations,
        paginatedRecommendations,

        selectedFilter,
        filterCount,

        selectedSort,

        currentPage,
        totalPages,
        paginationRange,

        recommendationsPerPage:
            RECOMMENDATIONS_PER_PAGE,

        isLoading,
        hasRequested,
        formError,
        errorMessage,

        handleAgeChange,
        handleRegionChange,
        handleToggleTarget,
        handleToggleInterest,
        handleSupportTypeChange,
        handleSubmit,

        handleFilterChange,
        handleSortChange,
        handlePageChange,
        handleResetRecommendation,
        retry,
    };
    
}