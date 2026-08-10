interface ErrorStateProps {
    title?: string;
    message: string;
    retryLabel?: string;
    onRetry?: () => void;
    compact?: boolean;
    className?: string;
}

export default function ErrorState({
    title = "오류가 발생했습니다.",
    message,
    retryLabel = "다시 시도",
    onRetry,
    compact = false,
    className = "",
}: ErrorStateProps) {
    const classes = [
        "ui-state",
        "ui-state--error",
        compact ? "ui-state--compact" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div
            className={classes}
            role="alert"
        >
            <h2 className="ui-state__title">
                {title}
            </h2>

            <p className="ui-state__description">
                {message}
            </p>

            {onRetry && (
                <button
                    type="button"
                    className="ui-button ui-button--primary"
                    onClick={onRetry}
                >
                    {retryLabel}
                </button>
            )}
        </div>
    );
}