import api from "./axios";

import type {
    Policy,
} from "../types/policy";

const DEFAULT_USER =
    "default";

interface BookmarkMutationResponse {
    success: boolean;
}

interface BookmarkExistsResponse {
    bookmarked: boolean;
}

export async function addBookmark(
    policyId: string,
): Promise<boolean> {
    const response =
        await api.post<BookmarkMutationResponse>(
            "/bookmarks",
            {
                user: DEFAULT_USER,
                policy_id: policyId,
            },
        );

    return response.data.success;
}

export async function removeBookmark(
    policyId: string,
): Promise<boolean> {
    const response =
        await api.delete<BookmarkMutationResponse>(
            `/bookmarks/${DEFAULT_USER}/${encodeURIComponent(
                policyId,
            )}`,
        );

    return response.data.success;
}

export async function checkBookmark(
    policyId: string,
): Promise<boolean> {
    const response =
        await api.get<BookmarkExistsResponse>(
            `/bookmarks/${DEFAULT_USER}/${encodeURIComponent(
                policyId,
            )}/exists`,
        );

    return response.data.bookmarked;
}

export async function getBookmarks():
    Promise<Policy[]> {
    const response =
        await api.get<Policy[]>(
            `/bookmarks/${DEFAULT_USER}`,
        );

    return response.data;
}

export interface RemoveBookmarksResult {
    removedPolicyIds: string[];
    failedPolicyIds: string[];
}

export async function removeBookmarks(
    policyIds: string[],
): Promise<RemoveBookmarksResult> {
    const uniquePolicyIds =
        Array.from(
            new Set(policyIds),
        );

    if (
        uniquePolicyIds.length
        === 0
    ) {
        return {
            removedPolicyIds: [],
            failedPolicyIds: [],
        };
    }

    const results =
        await Promise.allSettled(
            uniquePolicyIds.map(
                async (
                    policyId,
                ) => {
                    const success =
                        await removeBookmark(
                            policyId,
                        );

                    if (!success) {
                        throw new Error(
                            "북마크 삭제에 실패했습니다.",
                        );
                    }

                    return policyId;
                },
            ),
        );

    const removedPolicyIds:
        string[] = [];

    const failedPolicyIds:
        string[] = [];

    results.forEach(
        (
            result,
            index,
        ) => {
            const policyId =
                uniquePolicyIds[index];

            if (
                result.status
                === "fulfilled"
            ) {
                removedPolicyIds.push(
                    policyId,
                );
            } else {
                failedPolicyIds.push(
                    policyId,
                );
            }
        },
    );

    return {
        removedPolicyIds,
        failedPolicyIds,
    };
}