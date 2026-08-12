import type { CouponInfo } from "../api/types";

/**
 * 구독 쿠폰의 할인 금액(원)을 산출한다.
 *
 * 구독 쿠폰은 정률(percent)·정액(fixed) 두 방식이 있고 할인 상한(`maxDiscountAmount`)은 없다 —
 * 상한이 있는 단건 쿠폰(`features/product/lib/couponDiscount.ts`)과 규칙이 다르므로 함수를 나눠 둔다.
 *
 * 정률은 **단가 1개**에만 적용하고 floor(내림) 처리한다. 정액은 액수가 그대로 할인되며,
 * 단가를 넘지 않도록 자른다.
 *
 * 단건 쿠폰은 2026-08-11자로 "단가 1개" 제한이 풀려 주문 총액 기준이 됐지만,
 * **구독은 단가 1개 기준을 유지하기로 확정됐다.** 단건 쪽을 따라 바꾸지 말 것.
 *
 * `applyCount`(할인 적용 횟수)는 최초 결제 시점의 금액에는 영향을 주지 않는다 —
 * 최초 결제는 항상 할인 대상이고, 나머지 회차는 서버가 갱신 결제 때 처리한다.
 */
export function resolveSubscriptionCouponDiscount(
  info: CouponInfo | null,
  unitPrice: number,
): number {
  if (!info?.canUse) return 0;

  if (info.discountType === "fixed") {
    return Math.min(Math.max(0, info.discountAmount ?? 0), unitPrice);
  }

  // discountType이 없는(구버전) 응답도 정률로 간주한다.
  const rate = info.discountRate ?? 0;
  if (rate <= 0) return 0;
  return Math.min(Math.floor((unitPrice * rate) / 100), unitPrice);
}
