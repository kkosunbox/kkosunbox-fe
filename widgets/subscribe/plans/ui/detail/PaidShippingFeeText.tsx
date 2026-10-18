"use client";

import { formatManwon } from "@/features/cart";
import { STANDARD_FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from "@/shared/config/shipping";
import { formatKrwPrice } from "@/shared/lib/format";
import { useOrderPolicy } from "@/shared/lib/orderPolicy";

/** 단품 배송비 안내 — 기본 배송비·무료배송 기준은 주문 정책 API 값, 조회 전·실패 시 상수 */
export default function PaidShippingFeeText() {
  const policy = useOrderPolicy();
  const shippingFee = policy?.shippingFee ?? STANDARD_SHIPPING_FEE;
  const threshold = policy?.freeShippingThreshold ?? STANDARD_FREE_SHIPPING_THRESHOLD;
  return (
    <>
      {formatKrwPrice(shippingFee)}
      {threshold > 0 && ` (${formatManwon(threshold)} 이상 구매 시 무료배송)`}
    </>
  );
}
