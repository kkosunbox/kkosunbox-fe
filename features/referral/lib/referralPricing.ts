/**
 * 초대코드(레퍼럴) 할인 계산 — **프로젝트 전체에서 이 함수만 사용한다.**
 *
 * ## 백엔드 청구식과 원 단위까지 일치시킨다
 *
 * 서버는 **`floor(단가 × 할인율)`** 로 할인액을 산출하고 원가 단가에서 뺀다.
 * 그래서 이 모듈도 **할인액을 먼저 구하고 단가를 유도**한다. 반대로 하면 안 된다 —
 * `round(단가 × (1−율))`로 단가를 먼저 구하면 나누어떨어지지 않는 요율에서 서버보다
 * 1원 더 깎인 값을 보여주게 된다(예: 33,333 × 15% → 서버 4,999 / 반올림식 5,000).
 *
 * ## 계산 시점이 다른 값을 섞지 않는다
 *
 * 초대코드는 상품 단계에서 결정되고, 쿠폰은 `/order`에 들어와야 알 수 있다.
 * 이 모듈은 **초대코드까지만** 책임진다.
 *
 * ```
 * 원가 ──(초대코드)──> 표시 단가 ──(쿠폰, /order 전용)──> 최종 결제금액
 *        ↑ 여기까지가 이 모듈          ↑ computeOrderPricing
 * ```
 *
 * 쿠폰은 **할인된 단가가 아니라 원가**를 기준으로 계산된다(백엔드 규칙). 둘을 곱하듯 겹치지 않는다.
 *
 * ## 수량
 *
 * 초대코드 할인은 쿠폰과 마찬가지로 **1개분만** 적용된다. 수량 2개 이상이면 나머지는 정가다.
 * 따라서 이 함수가 돌려주는 "표시 단가"는 **첫 1개 기준**이라는 점에 주의.
 *
 * **할인율과 적격 여부는 서버가 내려주는 값이다.** 이 모듈은 그 값으로 금액을 유도만 한다 —
 * 적격 판정을 여기서 하지 않는다.
 */

/** 서버가 확정한 초대코드 할인 상태. 표시 단가 계산에 필요한 최소 정보만 담는다. */
export interface ReferralDiscount {
  /** 초대코드 할인을 실제로 받을 수 있는 상태인가 (서버 판정) */
  inviteEligible: boolean;
  /** 할인율 분수 (0.15 = 15%). 적격이 아니면 의미 없음 */
  discountRate: number;
}

/**
 * 초대코드 할인액(원) — **서버 청구식 `floor(단가 × 할인율)` 그대로.**
 * 이쪽이 1차 계산이고 표시 단가는 여기서 유도된다.
 */
export function referralDiscountAmount(
  monthlyPrice: number,
  discount: ReferralDiscount,
): number {
  if (!discount.inviteEligible || discount.discountRate <= 0) return 0;
  return Math.min(Math.floor(monthlyPrice * discount.discountRate), monthlyPrice);
}

/**
 * 초대코드 할인이 반영된 표시 단가 = 원가 − 할인액. 적격이 아니면 정가 그대로.
 * 이 값이 "쿠폰 적용 전 단가"이며, `/subscribe`와 `/order`가 반드시 같아야 하는 기준값이다.
 */
export function referralUnitPrice(monthlyPrice: number, discount: ReferralDiscount): number {
  return monthlyPrice - referralDiscountAmount(monthlyPrice, discount);
}

/**
 * 표시용 총 할인율(%) — 플랜 자체 할인(originalPrice 대비)과 초대코드 할인을 합산한 값.
 * 배지에 찍는 숫자이므로 정수로 반올림한다.
 */
export function combinedDiscountPercent(
  plan: { monthlyPrice: number; originalPrice?: number | null },
  discount: ReferralDiscount,
): number {
  const base = plan.originalPrice ?? plan.monthlyPrice;
  if (base <= 0) return 0;
  return Math.round((1 - referralUnitPrice(plan.monthlyPrice, discount) / base) * 100);
}
