interface RecommendPaginationProps {
    currentPage: number;
    totalPages: number;

    onPageChange: (
        page: number,
    ) => void;
}

const PAGE_GROUP_SIZE = 5;

function RecommendPagination({
    currentPage,
    totalPages,
    onPageChange,
}: RecommendPaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    const currentGroup =
        Math.floor(
            (currentPage - 1)
            / PAGE_GROUP_SIZE,
        );

    const startPage =
        currentGroup * PAGE_GROUP_SIZE + 1;

    const endPage = Math.min(
        startPage + PAGE_GROUP_SIZE - 1,
        totalPages,
    );

    const pageNumbers = Array.from(
        {
            length:
                endPage - startPage + 1,
        },
        (_, index) =>
            startPage + index,
    );

    const moveToPage = (
        page: number,
    ): void => {
        if (
            page < 1
            || page > totalPages
            || page === currentPage
        ) {
            return;
        }

        onPageChange(page);

        window.requestAnimationFrame(() => {
            const resultSection =
                document.querySelector(
                    ".recommend-summary-section",
                );

            resultSection?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });
    };

    return (
        <nav
            className="recommend-pagination"
            aria-label="추천 결과 페이지"
        >
            <button
                type="button"
                className="recommend-pagination__direction"
                disabled={currentPage === 1}
                onClick={() =>
                    moveToPage(
                        currentPage - 1,
                    )
                }
            >
                이전
            </button>

            <div className="recommend-pagination__pages">
                {startPage > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() =>
                                moveToPage(1)
                            }
                        >
                            1
                        </button>

                        {startPage > 2 && (
                            <span
                                className="recommend-pagination__ellipsis"
                                aria-hidden="true"
                            >
                                ···
                            </span>
                        )}
                    </>
                )}

                {pageNumbers.map((page) => {
                    const isCurrent =
                        page === currentPage;

                    return (
                        <button
                            key={page}
                            type="button"
                            className={
                                isCurrent
                                    ? "active"
                                    : ""
                            }
                            aria-current={
                                isCurrent
                                    ? "page"
                                    : undefined
                            }
                            onClick={() =>
                                moveToPage(page)
                            }
                        >
                            {page}
                        </button>
                    );
                })}

                {endPage < totalPages && (
                    <>
                        {endPage
                            < totalPages - 1 && (
                            <span
                                className="recommend-pagination__ellipsis"
                                aria-hidden="true"
                            >
                                ···
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={() =>
                                moveToPage(
                                    totalPages,
                                )
                            }
                        >
                            {totalPages}
                        </button>
                    </>
                )}
            </div>

            <button
                type="button"
                className="recommend-pagination__direction"
                disabled={
                    currentPage === totalPages
                }
                onClick={() =>
                    moveToPage(
                        currentPage + 1,
                    )
                }
            >
                다음
            </button>
        </nav>
    );
}

export default RecommendPagination;