import { useState } from "react";
import type { MyReferralCode } from "@/features/referral/api";
import { MonthBanner } from "./MonthBanner";
import { CopyIcon } from "./icons";

export interface BalanceCardProps {
  mobile: boolean;
  monthlyEarned: number;
  cumulativePoint: number;
  selectedYear: number;
  selectedMonth: number;
  showPicker: boolean;
  isLoading: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPickerOpen: () => void;
  onPickerClose: () => void;
  onMonthSelect: (year: number, month: number) => void;
  /** 내 초대코드·초대링크(`GET /v1/referral/me`) — 조회 실패 시 null이면 표시하지 않는다 */
  referral: MyReferralCode | null;
}

function useCopyFeedback() {
  const [copied, setCopied] = useState(false);

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 API 미지원 환경 — 값은 이미 화면에 노출돼 있어 수동 복사가 가능하므로 조용히 무시한다.
    }
  }

  return { copied, copy };
}

function ReferralField({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string | null;
  /** 코드(400)·링크(500)가 굵기가 달라 호출부에서 타이포 클래스를 지정한다 */
  valueClassName: string;
}) {
  const { copied, copy } = useCopyFeedback();

  return (
    <div className="flex items-center gap-3">
      <span className="w-[46px] shrink-0 text-body-13-m text-[var(--color-text)]">{label}</span>
      <div className="flex h-10 w-[208px] items-center gap-3 rounded-[4px] bg-[var(--color-surface-light)] px-3">
        <span className={`min-w-0 flex-1 truncate ${valueClassName} text-[var(--color-text)]`}>
          {value ?? "미설정"}
        </span>
        <button
          type="button"
          onClick={() => value && copy(value)}
          disabled={!value}
          aria-label={`${label} 복사`}
          title={copied ? "복사됨" : "복사"}
          className="flex h-6 w-6 shrink-0 items-center justify-center text-[var(--color-border)] transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CopyIcon />
        </button>
      </div>
    </div>
  );
}

function ReferralFields({ referral, stacked }: { referral: MyReferralCode; stacked?: boolean }) {
  return (
    <div className={stacked ? "mt-4 flex flex-col gap-3" : "flex items-center gap-6"}>
      <ReferralField label="초대코드" value={referral.referralCode} valueClassName="text-body-13-r" />
      <ReferralField label="초대링크" value={referral.referralLink} valueClassName="text-body-13-m" />
    </div>
  );
}

export function BalanceCard({
  mobile,
  monthlyEarned,
  cumulativePoint,
  selectedYear,
  selectedMonth,
  showPicker,
  isLoading,
  onPrevMonth,
  onNextMonth,
  onPickerOpen,
  onPickerClose,
  onMonthSelect,
  referral,
}: BalanceCardProps) {
  const bannerProps = {
    selectedMonth,
    showPicker,
    selectedYear,
    isLoading,
    onPrevMonth,
    onNextMonth,
    onPickerOpen,
    onPickerClose,
    onMonthSelect,
  };

  const pointInfo = (
    <div className={["flex flex-col gap-0 transition-opacity", isLoading ? "opacity-50" : ""].join(" ")}>
      <span className="text-body-14-m leading-[17px] tracking-[-0.04em] text-[var(--color-text-label)]">
        적립 포인트
      </span>
      <div className="flex gap-3">
        <span className="text-title-36-b text-[var(--color-text)]">
          {monthlyEarned.toLocaleString("ko-KR")}P
        </span>
        <span className="mt-[13px] shrink-0 text-body-14-m leading-[17px] tracking-[-0.04em] text-black">
          누적 {cumulativePoint.toLocaleString("ko-KR")}P
        </span>
      </div>
    </div>
  );

  if (mobile) {
    return (
      <div className="overflow-visible rounded-[20px] bg-white">
        <MonthBanner bannerPadding="px-6" {...bannerProps} />
        <div className="rounded-b-[20px] bg-white px-6 pt-4 pb-6">
          {pointInfo}
          {referral ? <ReferralFields referral={referral} stacked /> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-visible rounded-[20px] bg-white">
      <MonthBanner bannerPadding="pl-8" {...bannerProps} />
      <div className="flex min-h-[118px] items-center justify-between gap-6 rounded-b-[20px] bg-white px-12 py-4">
        {pointInfo}
        {referral ? <ReferralFields referral={referral} /> : null}
      </div>
    </div>
  );
}
