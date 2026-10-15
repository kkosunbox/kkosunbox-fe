import type { SubscriptionPlanDto } from "../api/types";

/**
 * 플랜 카드·요약에 찍을 가격 표시값.
 *
 * **금액은 전부 서버가 준 값 그대로다.** 이 모듈은 어떤 필드를 보여줄지 고르고
 * 취소선 표기 여부를 판단할 뿐, 할인액을 유도하지 않는다.
 *
 * 이전에는 `features/referral/lib/referralPricing.ts`가 `monthlyPrice`에서 초대 할인을
 * 직접 계산했는데, 서버가 할인액을 **100원 단위로 내림**하는 규칙을 프론트가 반영하지 않아
 * 미리보기가 실제 청구액보다 35~85원 싸게 표시되고 있었다(2026-08-31 dev 실측:
 * 베이직 서버 15,300 / 프론트 15,215). 계산을 옮기지 말고 서버 값을 그대로 쓸 것.
 */
export interface PlanDisplayPrice {
  /** 매월 결제 단가 — 플랜 할인가(`monthlyPrice`). 초대 할인은 여기에 섞지 않는다 */
  price: number;
  /** 취소선에 찍을 할인 전 가격. 플랜 할인이 없으면 null */
  strikePrice: number | null;
  /** 플랜 자체 할인율(%) 배지값. 할인이 없으면 null */
  discountPct: number | null;
  /** 초대 할인이 실제로 적용됐는가 — 초대 혜택 박스 노출 판단용 */
  referralApplied: boolean;
  /** 초대 추가 할인율(%) 안내 문구용. 적용 안 됐으면 0 */
  referralPct: number;
  /** 초대 할인이 반영된 첫 달 단가. 적용 안 됐으면 null */
  referralPrice: number | null;
}

type PlanPriceFields = Pick<
  SubscriptionPlanDto,
  | "monthlyPrice"
  | "originalPrice"
  | "discountRate"
  | "referralDiscountedPrice"
  | "referralDiscountRate"
>;

/**
 * 초대 할인은 **첫 달 1회** 혜택이라 월 가격 자리를 대체하지 않는다(2026-10 디자인 개편).
 * 월 가격은 플랜 할인가 그대로 두고, 첫 달 가격은 `referralPrice`로 따로 내려 별도 박스에 그린다.
 */
export function planDisplayPrice(plan: PlanPriceFields): PlanDisplayPrice {
  const referralPrice = plan.referralDiscountedPrice ?? null;
  const referralApplied = referralPrice != null;
  const price = plan.monthlyPrice;
  const base = plan.originalPrice ?? plan.monthlyPrice;

  // 정가와 같거나 더 비싸면 할인 표기 자체를 숨긴다 — "0% + 같은 금액 취소선"이 찍히던 케이스.
  const hasDiscount = base > price;

  // 서버가 선언한 `discountRate`를 그대로 쓴다. 가격비로 재계산하면 서버의 원 단위 반올림 때문에
  // 표시가 어긋난다(베이직 17,900/20,900 → 실비 14.35%지만 서버 선언값은 15%).
  const discountPct = hasDiscount ? (plan.discountRate ?? null) : null;

  return {
    price,
    strikePrice: hasDiscount ? base : null,
    discountPct,
    referralApplied,
    referralPct: referralApplied ? Math.round((plan.referralDiscountRate ?? 0) * 100) : 0,
    referralPrice,
  };
}

/**
 * 구독 상세의 결제 금액 미리보기. 초대 할인은 **단가 1개에만** 적용된다(서버 견적 규칙과 동일).
 *
 * 실제 청구액은 결제 화면에서 `POST /v1/subscriptions/price` 견적으로 확정한다 —
 * 여기서는 서버가 준 단가 두 개를 조합할 뿐 할인액을 유도하지 않는다.
 */
export function planPaymentAmount(price: PlanDisplayPrice, quantity: number): number {
  if (quantity < 1) return 0;
  return (price.referralPrice ?? price.price) + price.price * (quantity - 1);
}
