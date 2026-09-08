import { STANDARD_SHIPPING_FEE } from "@/shared/config/shipping";
import { formatKrwPrice } from "@/shared/lib/format";

export default function ShippingFeeWaiver({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-4 items-center gap-1 whitespace-nowrap text-[13px] font-medium leading-4 ${className}`}
    >
      <span className="text-[var(--color-text-secondary)] line-through">
        {formatKrwPrice(STANDARD_SHIPPING_FEE)}
      </span>
      <span>0원</span>
    </span>
  );
}
