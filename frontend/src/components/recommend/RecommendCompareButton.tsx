interface RecommendCompareButtonProps {
    selected: boolean;
    disabled: boolean;

    onClick: () => void;
}

function RecommendCompareButton({
    selected,
    disabled,
    onClick,
}: RecommendCompareButtonProps) {
    return (
        <button
            type="button"
            className={
                selected
                    ? "recommend-compare-button recommend-compare-button--selected"
                    : "recommend-compare-button"
            }
            disabled={
                disabled && !selected
            }
            aria-pressed={selected}
            onClick={onClick}
        >
            <span
                className="recommend-compare-button__icon"
                aria-hidden="true"
            >
                {selected ? "✓" : "+"}
            </span>

            <span>
                {selected
                    ? "비교 선택됨"
                    : "비교 담기"}
            </span>
        </button>
    );
}

export default RecommendCompareButton;