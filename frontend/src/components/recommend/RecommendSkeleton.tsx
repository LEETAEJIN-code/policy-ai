interface RecommendSkeletonProps {
  count?: number;
}

export default function RecommendSkeleton({
  count = 3,
}: RecommendSkeletonProps) {
  return (
    <section
      className="recommend-skeleton-list"
      aria-label="추천 정책을 불러오는 중"
      aria-busy="true"
    >
      {Array.from({ length: count }).map(
        (_, index) => (
          <article
            key={index}
            className="recommend-skeleton-card"
          >
            <div className="skeleton skeleton-badge" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-button" />
          </article>
        ),
      )}
    </section>
  );
}