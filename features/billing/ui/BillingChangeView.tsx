"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BillingInfo } from "../api/types";
import { requestTossBillingAuth, isTossUserCancel } from "../lib/requestTossBillingAuth";
import { getErrorMessage } from "@/shared/lib/api";
import { LoadingOverlay } from "@/shared/ui";
import BillingCardBox from "./BillingCardBox";

interface Props {
  billing: BillingInfo | null;
  /** true면 확인 화면 없이 창이 열리자마자 Toss 카드 등록창으로 넘어간다. */
  autoStart: boolean;
  onClose: () => void;
}

/**
 * 결제수단 변경 화면.
 *
 * - 등록된 카드가 있고 `autoStart`가 아니면: 현재 카드 정보 + 확인 버튼 1단계 → Toss 카드 등록창.
 * - 등록된 카드가 없거나 `autoStart`면: 보여줄 정보가 없거나 이미 변경 의사가 확인된 상태이므로
 *   창이 열리자마자 바로 Toss 카드 등록창으로 넘어간다.
 *
 * 인증이 시작되면 창 자체가 Toss 페이지로 이동하므로(`windowTarget: "self"`) 결과는 이 화면으로
 * 돌아오지 않고 `/payment/billing/success|fail`이 처리한다. 여기서 잡는 에러는 SDK 로드·호출 실패뿐이며,
 * 그 경우 빈 화면이 남지 않도록 재시도 UI를 보여준다.
 */
export default function BillingChangeView({ billing, autoStart, onClose }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const autoStartedRef = useRef(false);

  const showConfirm = !autoStart && billing !== null;

  const startAuth = useCallback(async () => {
    setError(null);
    setIsPending(true);
    try {
      await requestTossBillingAuth({
        customerKey: crypto.randomUUID(),
        billingInfoId: billing?.id,
      });
    } catch (err) {
      if (!isTossUserCancel(err)) {
        setError(getErrorMessage(err, "카드 등록 창을 여는 중 오류가 발생했습니다."));
      }
    } finally {
      setIsPending(false);
    }
  }, [billing?.id]);

  useEffect(() => {
    if (showConfirm) return;
    // StrictMode의 이펙트 2회 실행으로 인증 요청이 중복되지 않도록 한 번만 시작한다.
    if (autoStartedRef.current) return;
    autoStartedRef.current = true;
    void startAuth();
  }, [showConfirm, startAuth]);

  return (
    <div className="flex min-h-screen flex-col px-6 pb-8 pt-8">
      <LoadingOverlay visible={isPending} message="카드 등록 창을 여는 중입니다..." />

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-subtitle-18-b tracking-tightest text-[var(--color-text)]">
          결제수단 변경
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

      {showConfirm ? (
        <>
          <p className="mb-3 text-body-13-r text-[var(--color-text-secondary)]">
            현재 등록된 결제수단입니다.
          </p>
          <BillingCardBox billing={billing!} />
          <p className="mt-4 text-body-13-r text-[var(--color-text-secondary)]">
            확인을 누르면 카드 등록 창으로 이동합니다.
            <br />
            국내 발급 카드만 지원됩니다.
          </p>
        </>
      ) : (
        <p className="text-body-13-r text-[var(--color-text-secondary)]">
          {error
            ? "카드 등록 창을 열지 못했습니다."
            : "카드 등록 창으로 이동하고 있습니다..."}
        </p>
      )}

      {error && (
        <p className="mt-4 text-body-13-m text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* 하단 버튼 — 확인 화면이면 "확인", 자동 진행 화면은 실패했을 때만 재시도를 노출한다. */}
      {(showConfirm || error) && (
        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={() => void startAuth()}
            disabled={isPending}
            className="h-12 w-full rounded-[8px] bg-[var(--color-btn-dark-warm)] text-body-14-sb text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "처리 중…" : error ? "다시 시도" : "확인"}
          </button>
        </div>
      )}
    </div>
  );
}
