import type {
    ToastItem,
} from "./types";


interface ToastContainerProps {
    toasts: ToastItem[];
    onClose: (id: number) => void;
}


export default function ToastContainer({
    toasts,
    onClose,
}: ToastContainerProps) {
    return (
        <div
            className="toast-container"
            aria-live="polite"
            aria-atomic="false"
        >
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={[
                        "toast",
                        `toast--${toast.type}`,
                    ].join(" ")}
                    role={
                        toast.type === "error"
                            ? "alert"
                            : "status"
                    }
                >
                    <span className="toast__message">
                        {toast.message}
                    </span>

                    <button
                        type="button"
                        className="toast__close"
                        onClick={() => {
                            onClose(toast.id);
                        }}
                        aria-label="알림 닫기"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}