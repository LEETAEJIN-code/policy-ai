import type {
    RecentPolicyItem,
    RecentPolicyStorageData,
} from "../types/recentPolicy";

const RECENT_POLICY_STORAGE_KEY =
    "policy-ai:recent-policies";

const RECENT_POLICY_STORAGE_VERSION = 1;

const MAX_RECENT_POLICY_COUNT = 10;

const RECENT_POLICY_EXPIRE_MS =
    7 * 24 * 60 * 60 * 1000;

function isRecord(
    value: unknown,
): value is Record<string, unknown> {
    return (
        typeof value === "object"
        && value !== null
        && !Array.isArray(value)
    );
}

function isRecentPolicyItem(
    value: unknown,
): value is RecentPolicyItem {
    if (!isRecord(value)) {
        return false;
    }

    return (
        typeof value.policyId === "string"
        && typeof value.title === "string"
        && typeof value.organization === "string"
        && typeof value.source === "string"
        && (
            typeof value.detailUrl === "string"
            || value.detailUrl === null
        )
        && typeof value.viewedAt === "number"
    );
}

function isRecentPolicyStorageData(
    value: unknown,
): value is RecentPolicyStorageData {
    if (!isRecord(value)) {
        return false;
    }

    return (
        value.version
            === RECENT_POLICY_STORAGE_VERSION
        && Array.isArray(value.items)
        && value.items.every(
            isRecentPolicyItem,
        )
    );
}

function isExpired(
    viewedAt: number,
): boolean {
    return (
        Date.now() - viewedAt
        > RECENT_POLICY_EXPIRE_MS
    );
}

function readStorageData():
    RecentPolicyStorageData {
    try {
        const storedValue =
            window.localStorage.getItem(
                RECENT_POLICY_STORAGE_KEY,
            );

        if (!storedValue) {
            return {
                version:
                    RECENT_POLICY_STORAGE_VERSION,
                items: [],
            };
        }

        const parsedValue: unknown =
            JSON.parse(storedValue);

        if (
            !isRecentPolicyStorageData(
                parsedValue,
            )
        ) {
            window.localStorage.removeItem(
                RECENT_POLICY_STORAGE_KEY,
            );

            return {
                version:
                    RECENT_POLICY_STORAGE_VERSION,
                items: [],
            };
        }

        const validItems =
            parsedValue.items.filter(
                (item) =>
                    !isExpired(
                        item.viewedAt,
                    ),
            );

        return {
            version:
                RECENT_POLICY_STORAGE_VERSION,
            items: validItems,
        };
    } catch {
        return {
            version:
                RECENT_POLICY_STORAGE_VERSION,
            items: [],
        };
    }
}

function writeStorageData(
    data: RecentPolicyStorageData,
): void {
    try {
        window.localStorage.setItem(
            RECENT_POLICY_STORAGE_KEY,
            JSON.stringify(data),
        );
    } catch {
        /*
         * 브라우저 설정이나 저장 공간 문제로
         * localStorage 사용이 불가능해도
         * 상세페이지 기능은 그대로 유지한다.
         */
    }
}

export function getRecentPolicies():
    RecentPolicyItem[] {
    const data = readStorageData();

    writeStorageData(data);

    return data.items;
}

export function addRecentPolicy(
    policy: Omit<
        RecentPolicyItem,
        "viewedAt"
    >,
): void {
    const currentData =
        readStorageData();

    const nextItem:
        RecentPolicyItem = {
            ...policy,
            viewedAt: Date.now(),
        };

    const nextItems = [
        nextItem,

        ...currentData.items.filter(
            (item) =>
                item.policyId
                !== policy.policyId,
        ),
    ].slice(
        0,
        MAX_RECENT_POLICY_COUNT,
    );

    writeStorageData({
        version:
            RECENT_POLICY_STORAGE_VERSION,
        items: nextItems,
    });
}

export function removeRecentPolicy(
    policyId: string,
): void {
    const currentData =
        readStorageData();

    const nextItems =
        currentData.items.filter(
            (item) =>
                item.policyId
                !== policyId,
        );

    writeStorageData({
        version:
            RECENT_POLICY_STORAGE_VERSION,
        items: nextItems,
    });
}

export function clearRecentPolicies():
    void {
    try {
        window.localStorage.removeItem(
            RECENT_POLICY_STORAGE_KEY,
        );
    } catch {
        /*
         * 삭제 실패는 화면 동작에
         * 영향을 주지 않는다.
         */
    }
}