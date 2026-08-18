import { useReferral } from "./ReferralProvider";
import {
  combinedDiscountPercent,
  referralUnitPrice,
  type ReferralDiscount,
} from "@/features/referral/lib/referralPricing";

/**
 * 이 화면이 어느 계층에 속하는가.
 *
 * - `"promotional"` — 마케팅 화면. 계정 적격성을 보지 않고 프로모션을 일관되게 약속한다.
 *   실제 적용 가능 여부는 `/order`가 판정하고 부적격 사유까지 안내한다.
 * - `"actual"` — 청구로 이어지는 화면. 서버가 확정한 적격 여부 그대로.
 *
 * 계층 경계와 화면별 배정: `.claude/contexts/referral-pricing-architecture.md` §2
 */
export type ReferralPricingIntent = "promotional" | "actual";

export interface ReferralPricing {
  /**
   * 초대코드 할인이 반영된 **표시 단가**. 할인이 적용되지 않는 상태면 정가를 그대로 돌려준다.
   * 호출부에서 조건을 다시 조합하지 말 것 — 예전에 그 분기를 화면마다 따로 하다가
   * 한 곳이 빠져 가격이 어긋났다.
   */
  unitPrice: (monthlyPrice: number) => number;
  /** 정가(originalPrice) 대비 합산 할인율(%) — 배지 표기용 */
  combinedDiscountPct: (plan: { monthlyPrice: number; originalPrice?: number | null }) => number;
  /** 초대코드 추가 할인율(%) — 안내 문구용 */
  additionalDiscountPct: number;
  /** 초대 맥락으로 진입했는가 (원시값 — 표시 판단에 직접 쓰지 말 것) */
  isReferral: boolean;
  /**
   * **이 화면에서 초대 할인을 표시·적용하는가.** intent에 따라 근거가 달라진다.
   *
   * - `"promotional"` → `hasDisplayableReferralOffer` (적격성 무시)
   * - `"actual"`      → `inviteEligible` (서버 판정)
   *
   * 가격·취소선·배지·칩·CTA가 **전부 이 값 하나**를 읽어야 한다.
   */
  discountApplied: boolean;
}

/**
 * 초대코드 할인 단가를 화면에 쓰기 위한 훅.
 *
 * 할인율과 적격 여부는 **서버가 확정해 내려준 값**(`ReferralProvider`)을 그대로 쓰고,
 * 이 훅은 그것으로 표시 단가를 유도하기만 한다. 계산식은
 * `features/referral/lib/referralPricing.ts` 한 곳에만 있으며 주문서도 같은 함수를 쓴다.
 *
 * **기본값이 `"actual"`인 이유**: 새 사용처가 실수로 할인을 약속하면 표시가와 청구액이 어긋난다.
 * 백엔드는 부적격 `referralCode`를 거절하지 않고 **조용히 무시하고 정가를 청구**하므로
 * (`.claude/contexts/referral-pricing-architecture.md` §0-1), 잘못된 약속은 에러 없이
 * 그대로 추가 청구가 된다. 낙관적 표시는 **명시적으로 켜는 것만** 허용한다.
 */
export function useReferralPricing(
  { intent = "actual" }: { intent?: ReferralPricingIntent } = {},
): ReferralPricing {
  const { discountRate, isReferral, inviteEligible, hasDisplayableReferralOffer } = useReferral();

  const discountApplied = intent === "promotional" ? hasDisplayableReferralOffer : inviteEligible;
  // `referralPricing`은 계산에만 관심이 있으므로 "적용 여부"를 그대로 넘긴다.
  const discount: ReferralDiscount = { inviteEligible: discountApplied, discountRate };

  return {
    unitPrice: (monthlyPrice: number) => referralUnitPrice(monthlyPrice, discount),
    combinedDiscountPct: (plan) => combinedDiscountPercent(plan, discount),
    additionalDiscountPct: Math.round(discountRate * 100),
    isReferral,
    discountApplied,
  };
}
