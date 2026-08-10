import {
    useEffect,
    useId,
    useRef,
} from "react";

import type {
    KeyboardEvent as ReactKeyboardEvent,
    MouseEvent,
} from "react";


interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    description: string;

    confirmLabel?: string;
    cancelLabel?: string;

    isDanger?: boolean;
    isConfirming?: boolean;

    onConfirm: () => void;
    onCancel: () => void;
}


function ConfirmModal({
    isOpen,
    title,
    description,
    confirmLabel = "확인",
    cancelLabel = "취소",
    isDanger = false,
    isConfirming = false,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const titleId = useId();
    const descriptionId = useId();

    const dialogRef =
        useRef<HTMLElement | null>(null);

    const cancelButtonRef =
        useRef<HTMLButtonElement | null>(null);

    const previousFocusedElementRef =
        useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        previousFocusedElementRef.current =
            document.activeElement
                instanceof HTMLElement
                ? document.activeElement
                : null;

        const originalOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            "hidden";

        window.requestAnimationFrame(() => {
            cancelButtonRef.current?.focus();
        });

        const handleKeyDown = (
            event: KeyboardEvent,
        ): void => {
            if (
                event.key === "Escape"
                && !isConfirming
            ) {
                onCancel();
                return;
            }

            if (event.key !== "Tab") {
                return;
            }

            const dialog =
                dialogRef.current;

            if (!dialog) {
                return;
            }

            const focusableElements =
                Array.from(
                    dialog.querySelectorAll<
                        HTMLElement
                    >(
                        [
                            "button:not(:disabled)",
                            "[href]",
                            "input:not(:disabled)",
                            "select:not(:disabled)",
                            "textarea:not(:disabled)",
                            '[tabindex]:not([tabindex="-1"])',
                        ].join(","),
                    ),
                );

            if (
                focusableElements.length === 0
            ) {
                event.preventDefault();
                return;
            }

            const firstElement =
                focusableElements[0];

            const lastElement =
                focusableElements[
                    focusableElements.length - 1
                ];

            if (
                event.shiftKey
                && document.activeElement
                    === firstElement
            ) {
                event.preventDefault();
                lastElement.focus();
                return;
            }

            if (
                !event.shiftKey
                && document.activeElement
                    === lastElement
            ) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown,
            );

            document.body.style.overflow =
                originalOverflow;

            previousFocusedElementRef.current
                ?.focus();
        };
    }, [
        isConfirming,
        isOpen,
        onCancel,
    ]);

    if (!isOpen) {
        return null;
    }

    const handleBackdropMouseDown = (
        event: MouseEvent<HTMLDivElement>,
    ): void => {
        if (
            event.target
                !== event.currentTarget
            || isConfirming
        ) {
            return;
        }

        onCancel();
    };

    const handleDialogKeyDown = (
        event:
            ReactKeyboardEvent<HTMLElement>,
    ): void => {
        event.stopPropagation();
    };

    return (
        <div
            className="confirm-modal-backdrop"
            role="presentation"
            onMouseDown={
                handleBackdropMouseDown
            }
        >
            <section
                ref={dialogRef}
                className="confirm-modal"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={
                    descriptionId
                }
                aria-busy={isConfirming}
                onKeyDown={
                    handleDialogKeyDown
                }
            >
                <div
                    className={
                        isDanger
                            ? [
                                "confirm-modal-icon",
                                "confirm-modal-icon--danger",
                            ].join(" ")
                            : "confirm-modal-icon"
                    }
                    aria-hidden="true"
                >
                    {isDanger ? "!" : "?"}
                </div>

                <div className="confirm-modal-content">
                    <h2 id={titleId}>
                        {title}
                    </h2>

                    <p id={descriptionId}>
                        {description}
                    </p>
                </div>

                <div className="confirm-modal-actions">
                    <button
                        ref={cancelButtonRef}
                        type="button"
                        className={[
                            "ui-button",
                            "ui-button--secondary",
                            "confirm-modal-cancel",
                        ].join(" ")}
                        onClick={onCancel}
                        disabled={isConfirming}
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        className={[
                            "ui-button",
                            isDanger
                                ? "ui-button--danger"
                                : "ui-button--primary",
                            "confirm-modal-confirm",
                            isDanger
                                ? "confirm-modal-confirm--danger"
                                : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        onClick={onConfirm}
                        disabled={isConfirming}
                        aria-busy={isConfirming}
                    >
                        {isConfirming
                            ? "처리 중..."
                            : confirmLabel}
                    </button>
                </div>
            </section>
        </div>
    );
}


export default ConfirmModal;