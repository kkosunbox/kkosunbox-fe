import type { ProductCouponInfo } from "../api/types";

/**
 * 단건 구매 쿠폰의 할인 금액(원)을 산출한다.
 *
 * 단건 쿠폰은 정률 할인만 있고 대신 할인 상한(`maxDiscountAmount`)이 있다 —
 * 정액 할인과 회차가 있는 구독 쿠폰(`features/subscription/lib/couponDiscount.ts`)과 규칙이 다르므로
 * 함수를 나눠 둔다.
 *
 * 할인율은 **주문상품금액 전체(단가 × 수량)** 에, 상한은 **주문 전체에 1회** 적용한다.
 * 백엔드와 합의된 규칙이며(2026-08-11 확정), 실결제로도 검증됐다 —
 * 스탠다드 26,900원 × 5개 = 134,500원에 10% 쿠폰 → 서버 청구 할인 13,450원(= 총액의 10%).
 *
 * 과거에는 "단가 1개" 제한이 있었으나 제거됐다. 그 제한이 남아 있으면 수량 2개 이상에서
 * 화면 표시액이 청구액보다 작아지고(위 예시로 10,760원 차이), 기준이 항상 단가 1개라
 * 상한에 도달할 일이 없어 `maxDiscountAmount`가 무의미해진다.
 *
 * **구독 쿠폰·초대코드는 여전히 단가 1개 기준이다**(같은 날 확인). 정기결제 청구 규칙이
 * 달라 함께 바꾸면 안 된다 — 구독은 결제 전 서버 금액 재동기화 단계도 없어 어긋나면 바로 오청구다.
 */
export function resolveProductCouponDiscount(
  info: ProductCouponInfo | null,
  /** 주문상품금액 = 단가 × 수량 */
  orderAmount: number,
): number {
  if (!info?.canUse) return 0;

  const rate = info.discountRate ?? 0;
  if (rate <= 0) return 0;

  const discount = Math.min(Math.floor((orderAmount * rate) / 100), orderAmount);
  const cap = info.maxDiscountAmount;
  return cap != null ? Math.min(discount, Math.max(0, cap)) : discount;
}
