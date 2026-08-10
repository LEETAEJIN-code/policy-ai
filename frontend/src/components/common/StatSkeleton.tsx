interface StatSkeletonProps {
    width?: number;
}

export default function StatSkeleton({
    width = 72,
}: StatSkeletonProps) {
    return (
        <span
            className="stat-skeleton"
            style={{
                width,
            }}
            aria-hidden="true"
        />
    );
}