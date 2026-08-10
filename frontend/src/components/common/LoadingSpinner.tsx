interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

const sizeMap = {
  sm: 24,
  md: 40,
  lg: 56,
};

export default function LoadingSpinner({
  message = "불러오는 중...",
  size = "md",
  fullPage = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className="animate-spin rounded-full border-4 border-slate-200 border-t-teal-600"
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
        }}
      />
      <p className="text-sm text-slate-500">
        {message}
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}