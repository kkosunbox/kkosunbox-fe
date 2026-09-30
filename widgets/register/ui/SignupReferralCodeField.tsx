"use client";

import { INVITE_CODE_MAX_LENGTH } from "@/features/referral/lib";
import {
  authLabelCls,
  authUnderlineInputCls,
} from "@/features/auth";

interface SignupReferralCodeFieldProps {
  value: string;
  onChange: (value: string) => void;
  variant: "mobile" | "desktop" | "social";
}

export function SignupReferralCodeField({
  value,
  onChange,
  variant,
}: SignupReferralCodeFieldProps) {
  function handleChange(nextValue: string) {
    onChange(nextValue.slice(0, INVITE_CODE_MAX_LENGTH));
  }

  if (variant === "social") {
    return (
      <section className="mt-6 rounded-[12px] border border-[var(--color-text-muted)] px-8 py-6 max-md:px-4 max-md:py-4">
        <label
          htmlFor="social-register-referral-code"
          className="block text-[14px] font-bold leading-[17px] tracking-[-0.04em] text-[var(--color-text)]"
        >
          초대코드
        </label>
        <div className="mt-4 max-w-[327px]">
          <input
            id="social-register-referral-code"
            value={value}
            onChange={(event) => handleChange(event.target.value)}
            maxLength={INVITE_CODE_MAX_LENGTH}
            placeholder="초대코드를 입력하세요"
            className="h-8 min-w-0 flex-1 border-b border-[var(--color-text-muted)] bg-transparent text-[14px] font-medium leading-5 text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-cta-button)]"
            autoComplete="off"
          />
        </div>
        <p className="mt-3 text-[13px] font-medium leading-4 text-[var(--color-text)]">
          초대코드를 입력하고 첫 구독 할인 혜택을 챙겨보세요.
        </p>
      </section>
    );
  }

  const inputId = `reg-referral-${variant}`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className={authLabelCls}>
        초대코드
      </label>
      <input
        id={inputId}
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        maxLength={INVITE_CODE_MAX_LENGTH}
        placeholder="초대코드를 입력해주세요"
        className={authUnderlineInputCls}
        autoComplete="off"
      />
    </div>
  );
}
