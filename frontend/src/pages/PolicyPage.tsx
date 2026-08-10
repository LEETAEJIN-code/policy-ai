import SearchBar from "../components/common/SearchBar";
import PolicyCard from "../components/policy/PolicyCard";

import {
    usePolicies,
} from "../hooks/usePolicies";

import {
    LoadingSpinner,
    ErrorState,
    EmptyState,
} from "../components/common";

export default function PolicyPage() {
    const {
        filters,
        result,
        page,
        pageNumbers,
        loading,
        error,

        updateFilter,
        handleSearch,
        handleReset,
        setPage,
        goToPreviousPage,
        goToNextPage,
        retry,
    } = usePolicies();

    return (
        <section className="policy-page">
            <div className="policy-page-header">
                <div>
                    <p className="page-eyebrow">
                        통합 정책 조회
                    </p>

                    <h2 className="page-title">
                        현재 확인 가능한 지원사업
                    </h2>

                    <p className="page-description">
                        검색어와 조건을 조합하여 필요한
                        지원사업을 찾아보세요.
                    </p>
                </div>

                <strong>
                    총{" "}
                    {result.total.toLocaleString()}
                    건
                </strong>
            </div>

            <section className="policy-filter-panel">
                <SearchBar
                    value={filters.keyword}
                    onChange={(value) =>
                        updateFilter(
                            "keyword",
                            value,
                        )
                    }
                    onSearch={handleSearch}
                    disabled={loading}
                />

                <div className="policy-filter-grid">
                    <label>
                        <span>지역</span>

                        <select
                            value={filters.region}
                            onChange={(event) =>
                                updateFilter(
                                    "region",
                                    event.target.value,
                                )
                            }
                        >
                            <option value="">
                                전체 지역
                            </option>
                            <option value="전국">전국</option>
                            <option value="서울">서울</option>
                            <option value="경기">경기</option>
                            <option value="인천">인천</option>
                            <option value="대전">대전</option>
                            <option value="세종">세종</option>
                            <option value="충북">충북</option>
                            <option value="충남">충남</option>
                            <option value="부산">부산</option>
                            <option value="대구">대구</option>
                            <option value="광주">광주</option>
                            <option value="울산">울산</option>
                            <option value="경북">경북</option>
                            <option value="경남">경남</option>
                            <option value="전북">전북</option>
                            <option value="전남">전남</option>
                            <option value="강원">강원</option>
                            <option value="제주">제주</option>
                        </select>
                    </label>

                    <label>
                        <span>지원 대상</span>

                        <select
                            value={filters.target}
                            onChange={(event) =>
                                updateFilter(
                                    "target",
                                    event.target.value,
                                )
                            }
                        >
                            <option value="">
                                전체 대상
                            </option>
                            <option value="청년">청년</option>
                            <option value="창업">창업자</option>
                            <option value="예비창업">
                                예비 창업자
                            </option>
                            <option value="중소기업">
                                중소기업
                            </option>
                            <option value="소상공인">
                                소상공인
                            </option>
                            <option value="학생">학생</option>
                        </select>
                    </label>

                    <label>
                        <span>지원 유형</span>

                        <select
                            value={
                                filters.supportType
                            }
                            onChange={(event) =>
                                updateFilter(
                                    "supportType",
                                    event.target.value,
                                )
                            }
                        >
                            <option value="">
                                전체 유형
                            </option>
                            <option value="자금">자금</option>
                            <option value="금융">금융</option>
                            <option value="교육">교육</option>
                            <option value="멘토링">
                                멘토링
                            </option>
                            <option value="R&D">
                                R&amp;D
                            </option>
                            <option value="기술">기술</option>
                            <option value="판로">판로</option>
                            <option value="수출">
                                수출·해외진출
                            </option>
                            <option value="공간">
                                시설·공간
                            </option>
                        </select>
                    </label>

                    <label>
                        <span>출처</span>

                        <select
                            value={filters.source}
                            onChange={(event) =>
                                updateFilter(
                                    "source",
                                    event.target.value,
                                )
                            }
                        >
                            <option value="">
                                전체 출처
                            </option>
                            <option value="기업마당">
                                기업마당
                            </option>
                            <option value="K-Startup">
                                K-Startup
                            </option>
                        </select>
                    </label>

                    <label className="organization-filter">
                        <span>기관</span>

                        <input
                            type="text"
                            value={
                                filters.organization
                            }
                            onChange={(event) =>
                                updateFilter(
                                    "organization",
                                    event.target.value,
                                )
                            }
                            onKeyDown={(event) => {
                                if (
                                    event.key
                                    === "Enter"
                                ) {
                                    handleSearch();
                                }
                            }}
                            placeholder="기관명 입력"
                        />
                    </label>

                    <label className="closed-policy-filter">
                        <input
                            type="checkbox"
                            checked={
                                filters.includeClosed
                            }
                            onChange={(event) =>
                                updateFilter(
                                    "includeClosed",
                                    event.target.checked,
                                )
                            }
                        />

                        <span>
                            마감 정책 포함
                        </span>
                    </label>
                </div>

                <div className="policy-filter-actions">
                    <button
                        type="button"
                        className="ui-button ui-button--secondary policy-reset-button"
                        onClick={handleReset}
                        disabled={loading}
                    >
                        조건 초기화
                    </button>

                    <button
                        type="button"
                        className="ui-button ui-button--primary policy-search-button"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading
                            ? "검색 중..."
                            : "조건 검색"}
                    </button>
                </div>
            </section>

            {error && (
                <ErrorState
                    title="정책을 불러오지 못했습니다."
                    message={error}
                    retryLabel="다시 시도"
                    onRetry={() => {
                        void retry();
                    }}
                />
            )}

            {loading ? (
                <LoadingSpinner
                    message="정책 데이터를 불러오는 중입니다."
                />
            ) : result.items.length === 0 ? (
                <EmptyState
                    title="검색 결과가 없습니다."
                    description="검색어나 필터 조건을 바꿔 다시 검색해보세요."
                    actionLabel="전체 정책 보기"
                    onAction={handleReset}
                />
            ) : (
                <>
                    <div className="policy-result-summary">
                        <span>
                            {result.page}페이지
                        </span>

                        <span>
                            한 페이지당{" "}
                            {result.per_page}건
                        </span>
                    </div>

                    <div className="policy-grid">
                        {result.items.map(
                            (policy) => (
                                <PolicyCard
                                    key={`${policy.source}-${policy.id}`}
                                    policy={policy}
                                />
                            ),
                        )}
                    </div>

                    {result.total_pages > 1 && (
                        <nav
                            className="policy-pagination"
                            aria-label="정책 목록 페이지"
                        >
                            <button
                                type="button"
                                onClick={
                                    goToPreviousPage
                                }
                                disabled={
                                    page === 1
                                    || loading
                                }
                            >
                                이전
                            </button>

                            {pageNumbers.map(
                                (
                                    pageNumber,
                                ) => (
                                    <button
                                        key={
                                            pageNumber
                                        }
                                        type="button"
                                        className={
                                            pageNumber
                                            === page
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setPage(
                                                pageNumber,
                                            )
                                        }
                                        disabled={
                                            loading
                                        }
                                    >
                                        {pageNumber}
                                    </button>
                                ),
                            )}

                            <button
                                type="button"
                                onClick={
                                    goToNextPage
                                }
                                disabled={
                                    page
                                    === result.total_pages
                                    || loading
                                }
                            >
                                다음
                            </button>
                        </nav>
                    )}
                </>
            )}
        </section>
    );
}