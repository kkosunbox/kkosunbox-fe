"use client";

import { useRef, useState } from "react";
import { registerBilling, updateBilling } from "../api/billingApi";
import type { BillingInfo } from "../api/types";
import { getErrorMessage } from "@/shared/lib/api";
import { LoadingOverlay } from "@/shared/ui";

const inputCls =
  "h-9 w-full rounded-[4px] bg-white px-3 text-body-13-m leading-[140%] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none border border-[var(--color-border)]";

function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

function formatCardNumber(value: string): string {
  const digits = digitsOnly(value).slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 - ");
}

interface Props {
  existingBilling: BillingInfo | null;
  onConfirm: (billing: BillingInfo) => void;
  onBack: () => void;
  onClose: () => void;
}

export default function CardInputView({ existingBilling, onConfirm, onBack, onClose }: Props) {
  const expYearInputRef = useRef<HTMLInputElement>(null);
  const [cardNo, setCardNo] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardPw, setCardPw] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleConfirm() {
    setError(null);

    const digits = digitsOnly(cardNo);
    if (digits.length < 15) {
      setError("카드번호를 확인해 주세요.");
      return;
    }
    if (expMonth.length !== 2 || expYear.length !== 2) {
      setError("유효기간을 확인해 주세요.");
      return;
    }
    if (cvc.length !== 3) {
      setError("CVC를 확인해 주세요.");
      return;
    }
    if (cardPw.length !== 2) {
      setError("비밀번호 앞 2자리를 입력해 주세요.");
      return;
    }

    setIsPending(true);
    try {
      const cardInfo = { cardNo: digits, expYear, expMonth, idNo: cvc, cardPw };
      const billing = existingBilling
        ? await updateBilling({ ...cardInfo, billingInfoId: existingBilling.id })
        : await registerBilling(cardInfo);
      onConfirm(billing);
    } catch (err) {
      setError(getErrorMessage(err, "카드 등록에 실패했습니다."));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pb-8 pt-8">
      <LoadingOverlay visible={isPending} message="카드 정보를 등록하고 있습니다..." />
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
            카드 정보 입력
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

      {/* Form fields */}
      <div className="flex flex-col gap-5">
        {/* 카드번호 */}
        <div className="flex items-center gap-3">
          <span className="w-[60px] shrink-0 text-body-13-sb text-[var(--color-text)]">
            카드번호
          </span>
          <input
            value={formatCardNumber(cardNo)}
            onChange={(e) => setCardNo(digitsOnly(e.target.value))}
            className={inputCls}
            placeholder="0000 - 0000 - 0000 - 0000"
            inputMode="numeric"
            maxLength={25}
          />
        </div>

        {/* 유효기간 */}
        <div className="flex items-center gap-3">
          <span className="w-[60px] shrink-0 text-body-13-sb text-[var(--color-text)]">
            유효기간
          </span>
          <div className="flex flex-1 gap-2 items-center">
            <input
              value={expMonth}
              onChange={(e) => {
                const next = digitsOnly(e.target.value).slice(0, 2);
                setExpMonth(next);
                if (next.length === 2) {
                  queueMicrotask(() => expYearInputRef.current?.focus());
                }
              }}
              className={inputCls}
              placeholder="MM"
              inputMode="numeric"
              maxLength={2}
              aria-label="유효기간 월"
            />
            <span className="text-body-13-m text-[var(--color-text-secondary)]">/</span>
            <input
              ref={expYearInputRef}
              value={expYear}
              onChange={(e) => setExpYear(digitsOnly(e.target.value).slice(0, 2))}
              className={inputCls}
              placeholder="YY"
              inputMode="numeric"
              maxLength={2}
              aria-label="유효기간 연도"
            />
          </div>
        </div>

        {/* CVC */}
        <div className="flex items-center gap-3">
          <span className="w-[60px] shrink-0 text-body-13-sb text-[var(--color-text)]">
            CVC
          </span>
          <input
            value={cvc}
            onChange={(e) => setCvc(digitsOnly(e.target.value).slice(0, 3))}
            className={inputCls}
            placeholder="카드 뒷면 3자리 숫자"
            inputMode="numeric"
            maxLength={3}
            type="password"
          />
        </div>

        {/* 비밀번호 */}
        <div className="flex items-center gap-3">
          <span className="w-[60px] shrink-0 text-body-13-sb text-[var(--color-text)]">
            비밀번호
          </span>
          <input
            type="password"
            value={cardPw}
            onChange={(e) => setCardPw(digitsOnly(e.target.value).slice(0, 2))}
            className={inputCls}
            placeholder="비밀번호 앞 2자리"
            inputMode="numeric"
            maxLength={2}
          />
        </div>

        {/* 카드 정보 저장 체크 */}
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <button
            type="button"
            onClick={() => setSaveCard((v) => !v)}
            className={[
              "w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0 transition-colors",
              saveCard
                ? "bg-[var(--color-accent)]"
                : "border border-[var(--color-border)] bg-white",
            ].join(" ")}
          >
            {saveCard && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 6L4.5 8.5L10 3.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <span className="text-body-13-m text-[var(--color-text)]">
            카드 정보 저장
          </span>
        </label>
      </div>

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
          onClick={handleConfirm}
          disabled={isPending}
          className="w-full h-14 rounded-[30px] bg-[var(--color-accent)] text-white text-subtitle-18-sb transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "처리 중…" : "확인"}
        </button>
      </div>
    </div>
  );
}
