/**
 * 주문 금액·할인 계산 (순수 함수).
 *
 * 쿠폰·초대코드 할인은 각각 **단가 1개**에만 적용되며(서버 청구 기준과 일치),
 * 각각 원금액(단가) 기준으로 floor 한 뒤 합산한다. 총액은 0 미만으로 내려가지 않는다.
 */

export interface OrderPricingInput {
  /** 플랜 단가(월 요금) */
  unitPrice: number;
  /** 구독 수량 (1~99) */
  quantity: number;
  /** 쿠폰 할인율(%) — 적용 가능할 때만 전달. 예: 10 = 10%. 미적용 시 null/0/undefined. */
  couponRatePercent?: number | null;
  /** 초대코드 할인율(분수) — 적용 가능할 때만 전달. 예: 0.1 = 10%. 미적용 시 null/0/undefined. */
  inviteRate?: number | null;
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
  couponRatePercent,
  inviteRate,
}: OrderPricingInput): OrderPricing {
  const basePrice = unitPrice * quantity;
  // 쿠폰 할인율은 백분율(%), 초대코드 할인율은 분수(0.1=10%)로 단위가 다르다.
  const couponDiscount = couponRatePercent
    ? Math.floor((unitPrice * couponRatePercent) / 100)
    : 0;
  const inviteDiscount = inviteRate ? Math.floor(unitPrice * inviteRate) : 0;
  const totalDiscount = couponDiscount + inviteDiscount;
  const total = Math.max(0, basePrice - totalDiscount);
  return { basePrice, couponDiscount, inviteDiscount, totalDiscount, total };
}
