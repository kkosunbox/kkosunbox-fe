"use client";

import type { PaymentMethod } from "./PaymentManager";

interface Props {
  methods: PaymentMethod[];
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  onNext: () => void;
  onClose: () => void;
}

export default function PaymentMethodView({
  methods,
  selected,
  onSelect,
  onNext,
  onClose,
}: Props) {
  return (
    <div className="flex min-h-screen flex-col px-6 pb-8 pt-8">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-subtitle-18-b tracking-tightest text-[var(--color-text)]">
          결제수단 선택
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="flex h-8 w-8 items-center justify-center text-[var(--color-text)] transition-opacity hover:opacity-70"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path
              d="M12.5 1.5L1.5 12.5M1.5 1.5L12.5 12.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* 결제수단 2x2 그리드 */}
      <div className="grid grid-cols-2 gap-x-10 gap-y-8">
        {methods.map((method) => (
          <label key={method} className="inline-flex items-center gap-2 cursor-pointer">
            <button
              type="button"
              onClick={() => onSelect(method)}
              className={[
                "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors",
                selected === method
                  ? "border-2 border-[var(--color-accent)]"
                  : "border border-[var(--color-border)]",
              ].join(" ")}
            >
              {selected === method && (
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]" />
              )}
            </button>
            <span className="text-body-14-m leading-[17px] tracking-[-0.02em] text-[var(--color-text)]">
              {method}
            </span>
          </label>
        ))}
      </div>

      {/* 하단 다음 버튼 */}
      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={onNext}
          className="w-full h-14 rounded-[30px] bg-[var(--color-accent)] text-white text-subtitle-18-sb transition-opacity hover:opacity-90"
        >
          다음
        </button>
      </div>
    </div>
  );
}
