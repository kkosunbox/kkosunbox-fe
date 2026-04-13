"use client";

import type { BillingInfo } from "../api/types";

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
      <div className="rounded-lg border border-[var(--color-border)] bg-white px-5 py-5">
        <div className="flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <rect
              x="2"
              y="5"
              width="20"
              height="14"
              rx="2"
              stroke="var(--color-text)"
              strokeWidth="1.5"
            />
            <path d="M2 10H22" stroke="var(--color-text)" strokeWidth="1.5" />
          </svg>
          <div className="flex flex-col gap-0.5">
            <span className="text-body-14-sb text-[var(--color-text)]">
              {billing.cardCompany}
            </span>
            <span className="text-body-13-r text-[var(--color-text-secondary)]">
              **** **** **** {billing.lastFourDigits}
            </span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="ml-auto shrink-0"
          >
            <circle cx="8" cy="8" r="8" fill="var(--color-accent)" />
            <path
              d="M5 8l2 2 4-4"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* 새 카드 등록 버튼 */}
      <button
        type="button"
        onClick={onNewCard}
        className="mt-4 flex h-12 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--color-text-muted)] bg-white text-body-14-m text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-light)]"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 1v12M1 7h12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        새 카드 등록
      </button>

      {/* 하단 이 카드로 결제 버튼 */}
      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={() => onConfirm(billing)}
          className="w-full h-14 rounded-[30px] bg-[var(--color-accent)] text-white text-subtitle-18-sb transition-opacity hover:opacity-90"
        >
          이 카드로 결제
        </button>
      </div>
    </div>
  );
}
