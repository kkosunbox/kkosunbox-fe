/**
 * 주문 금액·할인 계산 (순수 함수).
 *
 * 쿠폰 할인 **금액**은 도메인별 resolver가 산출해 넘긴다 — 구독 쿠폰은 정률/정액,
 * 단건 쿠폰은 정률 + 상한으로 규칙이 다르기 때문에 여기서 방식을 분기하지 않는다.
 *   - 구독: `features/subscription/lib/couponDiscount.ts`
 *   - 단건: `features/product/lib/couponDiscount.ts`
 *
 * 초대코드 할인 **금액**도 마찬가지로 밖에서 계산해 넘긴다 —
 * `features/referral/lib/referralPricing.ts`의 `referralDiscountAmount()`가 유일한 계산식이며,
 * 플랜 선택 화면이 보여주는 단가와 정확히 같은 값이 나오도록 보장한다.
 * (예전에는 여기서 `floor(단가 × 요율)`을 따로 계산해 플랜 화면의 `round(단가 × (1−요율))`과
 *  1원씩 어긋날 수 있었다.)
 *
 * 쿠폰·초대코드 모두 **단가 1개**에만 적용된다(서버 청구 기준과 일치).
 * 총액은 0 미만으로 내려가지 않는다.
 */

export interface OrderPricingInput {
  /** 플랜 단가(월 요금) */
  unitPrice: number;
  /** 구독 수량 (1~99) */
  quantity: number;
  /** 쿠폰 할인금액(원) — 도메인 resolver가 계산한 값. 미적용 시 0/null/undefined. */
  couponDiscount?: number | null;
  /** 초대코드 할인금액(원) — `referralDiscountAmount()`가 계산한 값. 미적용 시 0/null/undefined. */
  inviteDiscount?: number | null;
}

export interface OrderPricing {
  /** 주문상품금액 = 단가 × 수량 */
  basePrice: number;
  /** 쿠폰 할인금액 (단가 1개 기준) */
  couponDiscount: number;
  /** 초대코드 할인금액 (단가 1개 기준) */
  inviteDiscount: number;
  /** 총 할인금액 = 쿠폰 + 초대코드 */
  totalDiscount: number;
  /** 총 주문금액 = max(0, 주문상품금액 − 총 할인금액) */
  total: number;
}

export function computeOrderPricing({
  unitPrice,
  quantity,
  couponDiscount: couponDiscountInput,
  inviteDiscount: inviteDiscountInput,
}: OrderPricingInput): OrderPricing {
  const basePrice = unitPrice * quantity;
  const couponDiscount = Math.max(0, couponDiscountInput ?? 0);
  const inviteDiscount = Math.max(0, inviteDiscountInput ?? 0);
  const totalDiscount = couponDiscount + inviteDiscount;
  const total = Math.max(0, basePrice - totalDiscount);
  return { basePrice, couponDiscount, inviteDiscount, totalDiscount, total };
}
