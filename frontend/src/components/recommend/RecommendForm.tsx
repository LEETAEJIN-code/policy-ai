import type {
    FormEvent,
} from "react";

import type {
    InterestOption,
    RecommendationFormData,
} from "../../types/recommendationForm";

interface RecommendFormProps {
    form: RecommendationFormData;

    loading: boolean;
    error: string;

    regionOptions: string[];
    targetOptions: string[];
    interestOptions: InterestOption[];
    supportOptions: string[];

    onAgeChange: (
        value: string,
    ) => void;

    onRegionChange: (
        value: string,
    ) => void;

    onToggleTarget: (
        target: string,
    ) => void;

    onToggleInterest: (
        interest: string,
    ) => void;

    onSupportTypeChange: (
        supportType: string,
    ) => void;

    onSubmit: (
        event:
            FormEvent<HTMLFormElement>,
    ) => void;

    onReset: () => void;
}

function RecommendForm({
    form,
    loading,
    error,

    regionOptions,
    targetOptions,
    interestOptions,
    supportOptions,

    onAgeChange,
    onRegionChange,
    onToggleTarget,
    onToggleInterest,
    onSupportTypeChange,
    onSubmit,
    onReset,
}: RecommendFormProps) {
    const hasSelectedValue =
        form.age.trim() !== ""
        || form.region !== ""
        || form.targets.length > 0
        || form.interests.length > 0
        || form.supportType !== "";

    return (
        <section className="recommend-form-card">
            <div className="recommend-section-heading">
                <div>
                    <h2>내 정보 선택</h2>

                    <p>
                        현재 상황과 관심 분야는
                        여러 개를 선택할 수 있습니다.
                    </p>
                </div>

                {hasSelectedValue && (
                    <span className="recommend-saved-label">
                        입력 내용 저장됨
                    </span>
                )}
            </div>

            <form
                className="recommend-form"
                onSubmit={onSubmit}
            >
                <label className="recommend-field">
                    <span>나이 *</span>

                    <input
                        type="number"
                        min="0"
                        max="120"
                        inputMode="numeric"
                        placeholder="예: 24"
                        value={form.age}
                        disabled={loading}
                        onChange={(event) =>
                            onAgeChange(
                                event.target.value,
                            )
                        }
                    />
                </label>

                <label className="recommend-field">
                    <span>지역 *</span>

                    <select
                        value={form.region}
                        disabled={loading}
                        onChange={(event) =>
                            onRegionChange(
                                event.target.value,
                            )
                        }
                    >
                        <option value="">
                            지역을 선택하세요
                        </option>

                        {regionOptions.map(
                            (region) => (
                                <option
                                    key={region}
                                    value={region}
                                >
                                    {region}
                                </option>
                            ),
                        )}
                    </select>
                </label>

                <div className="recommend-category-field">
                    <div className="recommend-category-heading">
                        <span>
                            현재 상황 *
                        </span>

                        <small>
                            여러 개 선택할 수 있습니다.
                        </small>
                    </div>

                    <div className="recommend-category-grid">
                        {targetOptions.map(
                            (target) => {
                                const selected =
                                    form.targets.includes(
                                        target,
                                    );

                                return (
                                    <button
                                        key={target}
                                        type="button"
                                        disabled={loading}
                                        aria-pressed={
                                            selected
                                        }
                                        className={
                                            selected
                                                ? "recommend-category-button selected"
                                                : "recommend-category-button"
                                        }
                                        onClick={() =>
                                            onToggleTarget(
                                                target,
                                            )
                                        }
                                    >
                                        {target}
                                    </button>
                                );
                            },
                        )}
                    </div>
                </div>

                <div className="recommend-category-field">
                    <div className="recommend-category-heading">
                        <span>
                            관심 분야 *
                        </span>

                        <small>
                            관심 있는 분야를 모두
                            선택하세요.
                        </small>
                    </div>

                    <div className="recommend-category-grid">
                        {interestOptions.map(
                            (interest) => {
                                const selected =
                                    form.interests.includes(
                                        interest.value,
                                    );

                                return (
                                    <button
                                        key={
                                            interest.value
                                        }
                                        type="button"
                                        disabled={loading}
                                        aria-pressed={
                                            selected
                                        }
                                        className={
                                            selected
                                                ? "recommend-category-button selected"
                                                : "recommend-category-button"
                                        }
                                        onClick={() =>
                                            onToggleInterest(
                                                interest.value,
                                            )
                                        }
                                    >
                                        {interest.label}
                                    </button>
                                );
                            },
                        )}
                    </div>
                </div>

                <div className="recommend-category-field">
                    <div className="recommend-category-heading">
                        <span>
                            희망 지원 유형
                        </span>

                        <small>
                            하나만 선택할 수 있습니다.
                        </small>
                    </div>

                    <div className="recommend-category-grid">
                        {supportOptions.map(
                            (supportType) => {
                                const selected =
                                    form.supportType
                                    === supportType;

                                return (
                                    <button
                                        key={
                                            supportType
                                        }
                                        type="button"
                                        disabled={loading}
                                        aria-pressed={
                                            selected
                                        }
                                        className={
                                            selected
                                                ? "recommend-category-button selected"
                                                : "recommend-category-button"
                                        }
                                        onClick={() =>
                                            onSupportTypeChange(
                                                supportType,
                                            )
                                        }
                                    >
                                        {supportType}
                                    </button>
                                );
                            },
                        )}
                    </div>
                </div>

                <div className="recommend-submit-area">
                    <button
                        className="recommend-reset-button"
                        type="button"
                        disabled={
                            loading
                            || !hasSelectedValue
                        }
                        onClick={onReset}
                    >
                        선택 초기화
                    </button>

                    <button
                        className="recommend-submit-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "정책을 분석하고 있습니다..."
                            : "맞춤 정책 추천받기"}
                    </button>
                </div>
            </form>

            {error && (
                <p
                    className="recommend-error"
                    role="alert"
                >
                    {error}
                </p>
            )}
        </section>
    );
}

export default RecommendForm;