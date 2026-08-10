import {
    createContext,
    useCallback,
    useMemo,
    useRef,
    useState,
} from "react";

import type {
    ReactNode,
} from "react";

import ToastContainer from "./ToastContainer";

import type {
    ToastContextValue,
    ToastItem,
    ToastOptions,
    ToastType,
} from "./types";


export const ToastContext =
    createContext<ToastContextValue | null>(
        null,
    );


interface ToastProviderProps {
    children: ReactNode;
}


export default function ToastProvider({
    children,
}: ToastProviderProps) {
    const [
        toasts,
        setToasts,
    ] = useState<ToastItem[]>([]);

    const nextIdRef =
        useRef(1);

    const removeToast =
        useCallback(
            (id: number): void => {
                setToasts((current) =>
                    current.filter(
                        (toast) =>
                            toast.id !== id,
                    ),
                );
            },
            [],
        );

    const showToast =
        useCallback(
            (
                message: string,
                options: ToastOptions = {},
            ): void => {
                const {
                    type = "info",
                    duration = 3500,
                } = options;

                const id =
                    nextIdRef.current++;

                setToasts((current) => [
                    ...current,
                    {
                        id,
                        type,
                        message,
                    },
                ]);

                window.setTimeout(() => {
                    removeToast(id);
                }, duration);
            },
            [
                removeToast,
            ],
        );

    const createTypeHandler =
        useCallback(
            (
                type: ToastType,
            ) =>
                (
                    message: string,
                    duration?: number,
                ): void => {
                    showToast(
                        message,
                        {
                            type,
                            duration,
                        },
                    );
                },
            [
                showToast,
            ],
        );

    const value =
        useMemo<ToastContextValue>(
            () => ({
                showToast,

                success:
                    createTypeHandler(
                        "success",
                    ),

                error:
                    createTypeHandler(
                        "error",
                    ),

                warning:
                    createTypeHandler(
                        "warning",
                    ),

                info:
                    createTypeHandler(
                        "info",
                    ),
            }),
            [
                showToast,
                createTypeHandler,
            ],
        );

    return (
        <ToastContext.Provider
            value={value}
        >
            {children}

            <ToastContainer
                toasts={toasts}
                onClose={removeToast}
            />
        </ToastContext.Provider>
    );
}