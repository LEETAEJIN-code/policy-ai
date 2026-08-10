interface RecommendErrorProps {
  message: string;
  onRetry: () => void;
}

export default function RecommendError({
  message,
  onRetry,
}: RecommendErrorProps) {
  return (
    <section
      className="recommend-error"
      role="alert"
      aria-live="assertive"
    >
      <h2>추천 정보를 불러오지 못했습니다</h2>

      <p>{message}</p>

      <button
        type="button"
        onClick={onRetry}
      >
        다시 시도
      </button>
    </section>
  );
}