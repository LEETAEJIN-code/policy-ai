interface EmptyStateProps {
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    compact?: boolean;
    className?: string;
}

export default function EmptyState({
    title,
    description,
    actionLabel,
    onAction,
    compact = false,
    className = "",
}: EmptyStateProps) {
    const classes = [
        "ui-state",
        compact ? "ui-state--compact" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={classes}>
            <h2 className="ui-state__title">
                {title}
            </h2>

            {description && (
                <p className="ui-state__description">
                    {description}
                </p>
            )}

            {actionLabel && onAction && (
                <button
                    type="button"
                    className="ui-button ui-button--primary"
                    onClick={onAction}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}