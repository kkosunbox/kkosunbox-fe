import { SectionCard } from "@/shared/ui";

interface OrderDeliveryMethodSectionProps {
  open: boolean;
  onToggle: () => void;
}

export function OrderDeliveryMethodSection({ open, onToggle }: OrderDeliveryMethodSectionProps) {
  return (
    <SectionCard title="배송방법" open={open} onToggle={onToggle}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6 md:flex-wrap">
        <span className="text-body-14-sb leading-[17px] text-[var(--color-text)]">
          우체국택배
        </span>
        <span className="text-body-13-m leading-[140%] text-[var(--color-text-secondary)]">
          월~목 배송 / 오전 11시 이후 주문 시 익일 발송
        </span>
      </div>
    </SectionCard>
  );
}
