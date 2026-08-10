import type {
  FormEvent,
} from "react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  disabled?: boolean;
};

export default function SearchBar({
  value,
  onChange,
  onSearch,
  disabled = false,
}: SearchBarProps) {
  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form
      className="policy-search-bar"
      onSubmit={handleSubmit}
    >
      <input
        type="search"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="정책명, 기관, 설명을 검색하세요"
        aria-label="정책 검색어"
        disabled={disabled}
      />

      <button
        type="submit"
        disabled={disabled}
      >
        {disabled ? "검색 중..." : "검색"}
      </button>
    </form>
  );
}