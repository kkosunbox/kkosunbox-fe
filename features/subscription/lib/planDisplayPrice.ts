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
  /** 표시 단가 — 초대 할인이 적용됐으면 그 가격, 아니면 정가 */
  price: number;
  /** 취소선에 찍을 할인 전 가격. 할인이 전혀 없으면 null */
  strikePrice: number | null;
  /** 정가 대비 총 할인율(%) 배지값. 할인이 전혀 없으면 null */
  discountPct: number | null;
  /** 초대 할인이 실제로 적용됐는가 — 추가할인 칩 노출 판단용 */
  referralApplied: boolean;
  /** 초대 추가 할인율(%) 안내 문구용. 적용 안 됐으면 0 */
  referralPct: number;
}

type PlanPriceFields = Pick<
  SubscriptionPlanDto,
  | "monthlyPrice"
  | "originalPrice"
  | "discountRate"
  | "referralDiscountedPrice"
  | "referralDiscountRate"
>;

export function planDisplayPrice(plan: PlanPriceFields): PlanDisplayPrice {
  const referralApplied = plan.referralDiscountedPrice != null;
  const price = plan.referralDiscountedPrice ?? plan.monthlyPrice;
  const base = plan.originalPrice ?? plan.monthlyPrice;

  // 정가와 같거나 더 비싸면 할인 표기 자체를 숨긴다 — "0% + 같은 금액 취소선"이 찍히던 케이스.
  const hasDiscount = base > price;

  // 플랜 자체 할인만 있을 땐 서버가 선언한 `discountRate`를 그대로 쓴다.
  // 가격비로 재계산하면 서버의 원 단위 반올림 때문에 표시가 어긋난다
  // (베이직 17,900/20,900 → 실비 14.35%지만 서버 선언값은 15%).
  // 초대 할인이 얹히면 합산 할인율을 주는 필드가 없어 그때만 가격비로 유도한다.
  const declaredPct = plan.discountRate ?? 0;
  const discountPct = !hasDiscount
    ? null
    : referralApplied
      ? Math.round((1 - price / base) * 100)
      : declaredPct;

  return {
    price,
    strikePrice: hasDiscount ? base : null,
    discountPct,
    referralApplied,
    referralPct: referralApplied ? Math.round((plan.referralDiscountRate ?? 0) * 100) : 0,
  };
}
