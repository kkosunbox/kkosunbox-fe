"use client";

import { STANDARD_SHIPPING_FEE } from "@/shared/config/shipping";
import { useOrderPolicy } from "@/shared/lib/orderPolicy";
import { formatKrwPrice } from "@/shared/lib/format";

/** 무료배송 혜택 표시 — 원배송비는 주문 정책 API 값, 조회 전·실패 시 기본 상수 */
export default function ShippingFeeWaiver({ className = "" }: { className?: string }) {
  const policy = useOrderPolicy();
  return (
    <span
      className={`inline-flex h-4 items-center gap-1 whitespace-nowrap text-[13px] font-medium leading-4 ${className}`}
    >
      <span className="text-[var(--color-text-secondary)] line-through">
        {formatKrwPrice(policy?.shippingFee ?? STANDARD_SHIPPING_FEE)}
      </span>
      <span>0원</span>
    </span>
  );
}
