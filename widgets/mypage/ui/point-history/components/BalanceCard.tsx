import { MonthBanner } from "./MonthBanner";

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
    <div className={["flex flex-col gap-1 transition-opacity", isLoading ? "opacity-50" : ""].join(" ")}>
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
        <div className="rounded-b-[20px] bg-white px-6 pt-6 pb-6">
          <div className="mb-4">{pointInfo}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-visible rounded-[20px] bg-white">
      <MonthBanner bannerPadding="pl-8" {...bannerProps} />
      <div className="flex h-[118px] items-center rounded-b-[20px] bg-white px-12">
        {pointInfo}
      </div>
    </div>
  );
}
