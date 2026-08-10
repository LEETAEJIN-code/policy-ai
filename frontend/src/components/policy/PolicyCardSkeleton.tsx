export default function PolicyCardSkeleton() {
    return (
        <article
            className="policy-card policy-card-skeleton"
            aria-hidden="true"
        >
            <div className="policy-card-top">
                <span className="skeleton skeleton--source" />

                <span className="skeleton skeleton--date" />
            </div>

            <div className="skeleton skeleton--title" />

            <div className="skeleton skeleton--organization" />

            <div className="policy-card-skeleton__description">
                <div className="skeleton skeleton--line" />
                <div className="skeleton skeleton--line" />
                <div className="skeleton skeleton--line skeleton--line-short" />
            </div>

            <div className="policy-tags policy-card-skeleton__tags">
                <span className="skeleton skeleton--tag" />
                <span className="skeleton skeleton--tag" />
                <span className="skeleton skeleton--tag" />
            </div>

            <div className="policy-card-actions policy-card-skeleton__actions">
                <span className="skeleton skeleton--button" />
                <span className="skeleton skeleton--button" />
                <span className="skeleton skeleton--button skeleton--button-small" />
            </div>
        </article>
    );
}