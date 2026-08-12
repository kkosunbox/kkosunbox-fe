/**
 * 초대코드(레퍼럴) 할인 단가 계산 — **프로젝트 전체에서 이 함수만 사용한다.**
 *
 * 초대코드가 적용되면 "원가 자체가 깎인다". 즉 할인은 별도 차감 항목이 아니라
 * **플랜 단가를 대체**하는 값이다. 플랜 선택 화면과 주문서가 같은 단가를 보여야 하므로
 * 반올림 방식까지 여기서 한 번만 정한다.
 *
 * 과거 사고(2026-08-12): 플랜 화면은 `round(P × (1−r))`, 주문서는 `P − floor(P × r)`로
 * 각자 계산해 같은 플랜에 다른 값이 나올 수 있었다. 두 식은 대부분 일치하지만
 * 나누어떨어지지 않는 요율에서 1원씩 어긋난다.
 *
 * **할인율(`discountRate`)과 적격 여부(`inviteEligible`)는 서버가 내려주는 값이다.**
 * 이 모듈은 그 값으로 표시 단가를 유도만 한다 — 적격 판정을 여기서 하지 않는다.
 */

/** 서버가 확정한 초대코드 할인 상태. 표시 단가 계산에 필요한 최소 정보만 담는다. */
export interface ReferralDiscount {
  /** 초대코드 할인을 실제로 받을 수 있는 상태인가 (서버 판정) */
  inviteEligible: boolean;
  /** 할인율 분수 (0.15 = 15%). 적격이 아니면 의미 없음 */
  discountRate: number;
}

/**
 * 초대코드 할인이 반영된 단가. 적격이 아니면 정가를 그대로 돌려준다.
 * 반환값이 곧 "쿠폰 적용 전 단가"이며, 쿠폰은 이 값 위에 별도로 적용된다.
 */
export function referralUnitPrice(monthlyPrice: number, discount: ReferralDiscount): number {
  if (!discount.inviteEligible || discount.discountRate <= 0) return monthlyPrice;
  return Math.round(monthlyPrice * (1 - discount.discountRate));
}

/**
 * 정가 대비 실제 할인액(원). `정가 − 할인단가`로 유도하므로
 * `referralUnitPrice()`와 항상 정확히 맞아떨어진다(따로 floor/round 하지 않는다).
 */
export function referralDiscountAmount(
  monthlyPrice: number,
  discount: ReferralDiscount,
): number {
  return monthlyPrice - referralUnitPrice(monthlyPrice, discount);
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
