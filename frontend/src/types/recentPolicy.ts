export interface RecentPolicyItem {
    policyId: string;
    title: string;
    organization: string;
    source: string;

    detailUrl: string | null;

    viewedAt: number;
}

export interface RecentPolicyStorageData {
    version: number;
    items: RecentPolicyItem[];
}