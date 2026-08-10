export default function AdminSummarySkeleton() {
    return (
        <section
            className="admin-summary-grid"
            aria-hidden="true"
        >
            {Array.from({
                length: 4,
            }).map((_, index) => (
                <article
                    key={index}
                    className="admin-summary-card admin-summary-skeleton"
                >
                    <div className="skeleton skeleton--admin-label" />
                    <div className="skeleton skeleton--admin-value" />
                    <div className="skeleton skeleton--admin-caption" />
                </article>
            ))}
        </section>
    );
}