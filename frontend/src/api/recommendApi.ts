import axios from "axios";

import api from "./axios";

import type {
    Recommendation,
    RecommendationResponse,
} from "../types/recommendation";

import type {
    RecommendationFormData,
} from "../types/recommendationForm";

interface RecommendationRequestBody {
    age: number;
    region: string;
    targets: string[];
    interests: string[];
    support_type: string | null;
}

interface ApiErrorResponse {
    detail?: unknown;
    message?: unknown;
}

export class RecommendApiError extends Error {
    status: number;

    constructor(
        message: string,
        status: number,
    ) {
        super(message);

        this.name = "RecommendApiError";
        this.status = status;
    }
}

function createRequestBody(
    form: RecommendationFormData,
): RecommendationRequestBody {
    const age =
        Number(form.age);

    if (
        !Number.isInteger(age)
        || age < 0
        || age > 120
    ) {
        throw new RecommendApiError(
            "올바른 나이를 입력해 주세요.",
            400,
        );
    }

    return {
        age,
        region:
            form.region,

        targets:
            [...form.targets],

        interests:
            [...form.interests],

        support_type:
            form.supportType.trim()
            || null,
    };
}

function getErrorMessage(
    data: unknown,
): string | null {
    if (
        typeof data !== "object"
        || data === null
    ) {
        return null;
    }

    const errorData =
        data as ApiErrorResponse;

    if (
        typeof errorData.detail
        === "string"
    ) {
        return errorData.detail;
    }

    if (
        typeof errorData.message
        === "string"
    ) {
        return errorData.message;
    }

    if (
        Array.isArray(
            errorData.detail,
        )
    ) {
        const messages =
            errorData.detail
                .map(
                    (
                        item,
                    ) => {
                        if (
                            typeof item
                                === "object"
                            && item
                                !== null
                            && "msg" in item
                            && typeof item.msg
                                === "string"
                        ) {
                            return item.msg;
                        }

                        return null;
                    },
                )
                .filter(
                    (
                        message,
                    ): message is string =>
                        message
                        !== null,
                );

        if (
            messages.length
            > 0
        ) {
            return messages.join(
                ", ",
            );
        }
    }

    return null;
}

function normalizeRecommendationResponse(
    data: unknown,
): RecommendationResponse {
    if (Array.isArray(data)) {
        const recommendations:
            Recommendation[] = data;

        return {
            total:
                recommendations.length,

            recommendations,
        };
    }

    if (
        typeof data === "object"
        && data !== null
        && "recommendations" in data
    ) {
        const responseData = data as {
            total?: unknown;
            recommendations?: unknown;
        };

        const recommendations =
            responseData.recommendations;

        if (!Array.isArray(recommendations)) {
            throw new RecommendApiError(
                "추천 API 응답 형식이 올바르지 않습니다.",
                500,
            );
        }

        const normalizedRecommendations:
            Recommendation[] =
                recommendations;

        const total =
            typeof responseData.total
                === "number"
                ? responseData.total
                : normalizedRecommendations.length;

        return {
            total,

            recommendations:
                normalizedRecommendations,
        };
    }

    throw new RecommendApiError(
        "추천 API 응답 형식이 올바르지 않습니다.",
        500,
    );
}

function convertToRecommendApiError(
    error: unknown,
): RecommendApiError {
    if (
        error instanceof RecommendApiError
    ) {
        return error;
    }

    if (
        axios.isAxiosError(error)
    ) {
        const status =
            error.response?.status
            ?? 0;

        const serverMessage =
            getErrorMessage(
                error.response?.data,
            );

        if (serverMessage) {
            return new RecommendApiError(
                serverMessage,
                status,
            );
        }

        if (
            error.code
            === "ECONNABORTED"
        ) {
            return new RecommendApiError(
                "추천 요청 시간이 초과되었습니다.",
                0,
            );
        }

        if (!error.response) {
            return new RecommendApiError(
                "추천 서버에 연결할 수 없습니다.",
                0,
            );
        }

        return new RecommendApiError(
            "정책 추천 요청에 실패했습니다.",
            status,
        );
    }

    return new RecommendApiError(
        "추천 정보를 불러오는 중 오류가 발생했습니다.",
        0,
    );
}

export async function requestRecommendations(
    form: RecommendationFormData,
    signal?: AbortSignal,
): Promise<RecommendationResponse> {
    const requestBody =
        createRequestBody(form);

    try {
        const response =
            await api.post<unknown>(
                "/recommend",
                requestBody,
                {
                    signal,
                },
            );

        return normalizeRecommendationResponse(
            response.data,
        );
    } catch (
        error
    ) {
        /*
         * Axios에서 AbortController가 취소되면
         * ERR_CANCELED 오류가 발생한다.
         * 기존 Hook이 AbortError를 확인하므로
         * DOMException 형태로 다시 전달한다.
         */
        if (
            axios.isAxiosError(error)
            && error.code
                === "ERR_CANCELED"
        ) {
            throw new DOMException(
                "추천 요청이 취소되었습니다.",
                "AbortError",
            );
        }

        throw convertToRecommendApiError(
            error,
        );
    }
}