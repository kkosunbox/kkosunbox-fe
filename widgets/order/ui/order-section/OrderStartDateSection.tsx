import { SectionCard, RadioButton, DatePicker } from "@/shared/ui";
import type { StartDateMode } from "./hooks/useStartDateState";

const DATE_TRIGGER_CLASS =
  "!rounded-[4px] !border-0 !bg-[var(--color-surface-light)] !px-3 hover:!border-0 [&_span]:!text-body-13-m [&_span]:!font-medium";

interface OrderStartDateSectionProps {
  open: boolean;
  onToggle: () => void;
  startDateMode: StartDateMode;
  onStartDateModeChange: (mode: StartDateMode) => void;
  scheduledDate: Date | null;
  onScheduledDateChange: (date: Date) => void;
  minScheduledDate: Date;
  maxScheduledDate: Date;
}

export function OrderStartDateSection({
  open,
  onToggle,
  startDateMode,
  onStartDateModeChange,
  scheduledDate,
  onScheduledDateChange,
  minScheduledDate,
  maxScheduledDate,
}: OrderStartDateSectionProps) {
  return (
    <SectionCard title="구독 시작일" open={open} onToggle={onToggle}>
      <div className="flex flex-col gap-6">
        <RadioButton
          checked={startDateMode === "immediate"}
          onChange={() => onStartDateModeChange("immediate")}
          label="지금 바로 첫 구독 상품 결제하기"
        />
        <div className="flex items-center gap-6">
          <RadioButton
            checked={startDateMode === "scheduled"}
            onChange={() => onStartDateModeChange("scheduled")}
            label="다음 결제부터 시작"
          />
          <DatePicker
            value={scheduledDate}
            onChange={onScheduledDateChange}
            placeholder="결제 날짜"
            minDate={minScheduledDate}
            maxDate={maxScheduledDate}
            disabled={startDateMode !== "scheduled"}
            className="w-[150px]"
            triggerClassName={DATE_TRIGGER_CLASS}
            iconColor="var(--color-border)"
          />
        </div>
      </div>
    </SectionCard>
  );
}
