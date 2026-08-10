interface RecommendEmptyProps {
  hasRequested: boolean;
  isFiltered: boolean;
  onResetFilter?: () => void;
}

export default function RecommendEmpty({
  hasRequested,
  isFiltered,
  onResetFilter,
}: RecommendEmptyProps) {
  if (!hasRequested) {
    return (
      <section
        className="recommend-empty"
        aria-label="추천 안내"
      >
        <h2>맞춤 정책을 찾아보세요</h2>

        <p>
          나이와 현재 상황, 관심 분야를 입력하면
          조건에 맞는 정책을 추천해드립니다.
        </p>
      </section>
    );
  }

  if (isFiltered) {
    return (
      <section
        className="recommend-empty"
        aria-label="필터 결과 없음"
      >
        <h2>해당 조건의 정책이 없습니다</h2>

        <p>
          다른 결과 필터를 선택하거나 전체 정책을
          확인해보세요.
        </p>

        {onResetFilter && (
          <button
            type="button"
            onClick={onResetFilter}
          >
            전체 결과 보기
          </button>
        )}
      </section>
    );
  }

  return (
    <section
      className="recommend-empty"
      aria-label="추천 결과 없음"
    >
      <h2>추천할 수 있는 정책을 찾지 못했습니다</h2>

      <p>
        입력 조건을 조금 넓게 변경한 뒤 다시
        추천받아보세요.
      </p>
    </section>
  );
}