import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    addBookmark,
    checkBookmark,
    removeBookmark,
} from "../../api/bookmarkApi";

import {
    useToast,
} from "./toast/useToast";


interface BookmarkButtonProps {
    policyId: string;

    onChange?: (
        bookmarked: boolean,
    ) => void;
}


export default function BookmarkButton({
    policyId,
    onChange,
}: BookmarkButtonProps) {
    const toast = useToast();

    const [
        bookmarked,
        setBookmarked,
    ] = useState(false);

    const [
        isChecking,
        setIsChecking,
    ] = useState(true);

    const [
        isUpdating,
        setIsUpdating,
    ] = useState(false);

    const loadBookmarkState =
        useCallback(
            async (): Promise<void> => {
                setIsChecking(true);

                try {
                    const result =
                        await checkBookmark(
                            policyId,
                        );

                    setBookmarked(
                        result,
                    );
                } catch (
                    requestError
                ) {
                    console.error(
                        requestError,
                    );

                    toast.error(
                        "북마크 상태를 확인하지 못했습니다.",
                    );
                } finally {
                    setIsChecking(false);
                }
            },
            [
                policyId,
                toast,
            ],
        );

    useEffect(() => {
        void loadBookmarkState();
    }, [
        loadBookmarkState,
    ]);

    const handleClick =
        async (): Promise<void> => {
            if (
                isChecking
                || isUpdating
            ) {
                return;
            }

            const previousValue =
                bookmarked;

            const nextValue =
                !previousValue;

            setIsUpdating(true);

            /*
             * 버튼 반응을 빠르게 보여주기 위한
             * 낙관적 업데이트
             */
            setBookmarked(
                nextValue,
            );

            try {
                const success =
                    nextValue
                        ? await addBookmark(
                            policyId,
                        )
                        : await removeBookmark(
                            policyId,
                        );

                if (!success) {
                    throw new Error(
                        "북마크 처리에 실패했습니다.",
                    );
                }

                onChange?.(
                    nextValue,
                );

                if (nextValue) {
                    toast.success(
                        "북마크에 저장했습니다.",
                    );
                } else {
                    toast.success(
                        "북마크에서 삭제했습니다.",
                    );
                }
            } catch (
                requestError
            ) {
                console.error(
                    requestError,
                );

                setBookmarked(
                    previousValue,
                );

                toast.error(
                    nextValue
                        ? "북마크를 저장하지 못했습니다."
                        : "북마크를 삭제하지 못했습니다.",
                );
            } finally {
                setIsUpdating(false);
            }
        };

    const isLoading =
        isChecking
        || isUpdating;

    const buttonLabel =
        isChecking
            ? "확인 중"
            : isUpdating
                ? "처리 중"
                : bookmarked
                    ? "저장됨"
                    : "북마크";

    return (
        <div className="bookmark-button-wrapper">
            <button
                className={
                    bookmarked
                        ? "card-button bookmark-card-button active"
                        : "card-button bookmark-card-button"
                }
                type="button"
                onClick={() => {
                    void handleClick();
                }}
                disabled={isLoading}
                aria-pressed={
                    bookmarked
                }
                aria-busy={
                    isLoading
                }
                title={
                    bookmarked
                        ? "북마크에서 삭제"
                        : "북마크에 저장"
                }
            >
                <span
                    aria-hidden="true"
                >
                    {bookmarked
                        ? "★"
                        : "☆"}
                </span>

                {buttonLabel}
            </button>
        </div>
    );
}