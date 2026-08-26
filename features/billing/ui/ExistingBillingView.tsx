"use client";

import type { BillingInfo } from "../api/types";
import BillingCardBox from "./BillingCardBox";

interface Props {
  billing: BillingInfo;
  onConfirm: (billing: BillingInfo) => void;
  onNewCard: () => void;
  onBack: () => void;
  onClose: () => void;
}

export default function ExistingBillingView({
  billing,
  onConfirm,
  onNewCard,
  onBack,
  onClose,
}: Props) {
  return (
    <div className="flex min-h-screen flex-col px-6 pb-8 pt-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로"
            className="flex h-8 w-8 items-center justify-center text-[var(--color-text)] transition-opacity hover:opacity-70"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 2L4 8L10 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h2 className="text-subtitle-18-b tracking-tightest text-[var(--color-text)]">
            등록된 결제수단
          </h2>
        </div>
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

      {/* 기존 카드 정보 */}
      <BillingCardBox billing={billing} />

      {/* 카드 정보 변경 버튼 */}
      <button
        type="button"
        onClick={onNewCard}
        className="mt-4 flex h-12 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--color-cta-button)] bg-white text-body-14-m text-[var(--color-cta-button)] transition-opacity hover:opacity-80"
      >
        카드 정보 변경
      </button>

      {/* 하단 이 카드로 결제 버튼 */}
      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={() => onConfirm(billing)}
          className="w-full h-12 rounded-[8px] bg-[var(--color-cta-button)] text-white text-body-14-sb transition-opacity hover:opacity-90"
        >
          이 카드로 결제
        </button>
      </div>
    </div>
  );
}
