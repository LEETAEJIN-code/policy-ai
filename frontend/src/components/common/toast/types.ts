export type ToastType =
    | "success"
    | "error"
    | "warning"
    | "info";


export interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
}


export interface ToastOptions {
    type?: ToastType;
    duration?: number;
}


export interface ToastContextValue {
    showToast: (
        message: string,
        options?: ToastOptions,
    ) => void;

    success: (
        message: string,
        duration?: number,
    ) => void;

    error: (
        message: string,
        duration?: number,
    ) => void;

    warning: (
        message: string,
        duration?: number,
    ) => void;

    info: (
        message: string,
        duration?: number,
    ) => void;
}