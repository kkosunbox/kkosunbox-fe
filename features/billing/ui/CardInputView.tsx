"use client";

import { useState } from "react";
import type { BillingInfo } from "../api/types";
import { requestTossBillingAuth, isTossUserCancel } from "../lib/requestTossBillingAuth";
import { getErrorMessage } from "@/shared/lib/api";
import { LoadingOverlay } from "@/shared/ui";

interface Props {
  existingBilling: BillingInfo | null;
  onBack: () => void;
  onClose: () => void;
}

// Toss 자동결제 인증 완료 시 브라우저가 successUrl로 전체 리다이렉트되므로,
// 등록 결과는 이 컴포넌트로 돌아오지 않고 /payment/billing/success 페이지가 처리한다.
export default function CardInputView({ existingBilling, onBack, onClose }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleStartAuth() {
    setError(null);
    setIsPending(true);
    try {
      await requestTossBillingAuth({
        customerKey: crypto.randomUUID(),
        billingInfoId: existingBilling?.id,
      });
    } catch (err) {
      if (!isTossUserCancel(err)) {
        setError(getErrorMessage(err, "결제 수단 등록 창을 여는 중 오류가 발생했습니다."));
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pb-8 pt-8">
      <LoadingOverlay visible={isPending} message="카드 등록 창을 여는 중입니다..." />
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
            카드 등록
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

      <p className="text-body-13-r text-[var(--color-text-secondary)]">
        Toss 자동결제 인증 창에서 카드 정보를 등록합니다.
        <br />
        국내 발급 카드만 지원됩니다.
      </p>

      {/* Error */}
      {error && (
        <p className="mt-4 text-body-13-m text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* 하단 확인 버튼 */}
      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={handleStartAuth}
          disabled={isPending}
          className="w-full h-12 rounded-[8px] bg-[var(--color-btn-dark-warm)] text-white text-body-14-sb transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "처리 중…" : "카드 등록하기"}
        </button>
      </div>
    </div>
  );
}
