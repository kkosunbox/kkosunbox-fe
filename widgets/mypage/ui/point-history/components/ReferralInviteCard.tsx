"use client";

import { useState } from "react";
import { FORM_ACTION_CHIP_CLASS as actionChipCls, FORM_INPUT_CLASS as inputCls } from "@/shared/ui";
import type { MyReferralCode } from "@/features/referral/api";

interface ReferralInviteCardProps {
  mobile: boolean;
  referral: MyReferralCode;
}

function useCopyFeedback() {
  const [copied, setCopied] = useState(false);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 API 미지원 환경 — 값은 이미 입력창에 노출돼 있어 수동 복사가 가능하므로 조용히 무시한다.
    }
  }

  return { copied, copy };
}

function InviteRow({ label, value }: { label: string; value: string | null }) {
  const { copied, copy } = useCopyFeedback();

  return (
    <div className="flex items-center gap-3">
      <span className="w-[70px] shrink-0 text-body-13-m leading-[16px] text-[var(--color-text)]">
        {label}
      </span>
      <input
        readOnly
        value={value ?? "아직 설정되지 않았습니다"}
        aria-label={label}
        className={`${inputCls} min-w-0 flex-1`}
      />
      <button
        type="button"
        onClick={() => value && copy(value)}
        disabled={!value}
        className={`${actionChipCls} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {copied ? "복사됨" : "복사"}
      </button>
    </div>
  );
}

export function ReferralInviteCard({ mobile, referral }: ReferralInviteCardProps) {
  const content = (
    <div className="flex flex-col gap-3">
      <span className="text-body-14-m leading-[17px] tracking-[-0.04em] text-[var(--color-text-label)]">
        나의 초대코드·초대링크
      </span>
      <InviteRow label="초대코드" value={referral.referralCode} />
      <InviteRow label="초대링크" value={referral.referralLink} />
    </div>
  );

  if (mobile) {
    return <div className="rounded-[20px] bg-white p-6">{content}</div>;
  }

  return <div className="rounded-[20px] bg-white px-12 py-8">{content}</div>;
}
