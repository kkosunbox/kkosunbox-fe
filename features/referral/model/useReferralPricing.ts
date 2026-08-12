import { useReferral } from "./ReferralProvider";
import {
  combinedDiscountPercent,
  referralUnitPrice,
  type ReferralDiscount,
} from "@/features/referral/lib/referralPricing";

export interface ReferralPricing {
  /**
   * 초대코드 할인이 반영된 **표시 단가**. 적격이 아니면 정가를 그대로 돌려준다.
   * 호출부에서 `inviteEligible ? unitPrice(p) : p`처럼 다시 분기하지 말 것 —
   * 예전에 그 분기를 화면마다 따로 하다가 한 곳이 빠져 가격이 어긋났다.
   */
  unitPrice: (monthlyPrice: number) => number;
  /** 정가(originalPrice) 대비 합산 할인율(%) — 배지 표기용 */
  combinedDiscountPct: (plan: { monthlyPrice: number; originalPrice?: number | null }) => number;
  /** 초대코드 추가 할인율(%) — 안내 문구용 */
  additionalDiscountPct: number;
  /** 초대 맥락으로 진입했는가 (배지·문구 노출 기준) */
  isReferral: boolean;
  /** 실제로 할인을 받을 수 있는가 (가격 적용 기준) */
  inviteEligible: boolean;
}

/**
 * 초대코드 할인 단가를 화면에 쓰기 위한 훅.
 *
 * 할인율·적격 여부는 **서버가 확정해 내려준 값**(`ReferralProvider`)을 그대로 쓰고,
 * 이 훅은 그것으로 표시 단가를 유도하기만 한다. 계산식은
 * `features/referral/lib/referralPricing.ts` 한 곳에만 있으며 주문서도 같은 함수를 쓴다.
 */
export function useReferralPricing(): ReferralPricing {
  const { discountRate, isReferral, inviteEligible } = useReferral();
  const discount: ReferralDiscount = { inviteEligible, discountRate };

  return {
    unitPrice: (monthlyPrice: number) => referralUnitPrice(monthlyPrice, discount),
    combinedDiscountPct: (plan) => combinedDiscountPercent(plan, discount),
    additionalDiscountPct: Math.round(discountRate * 100),
    isReferral,
    inviteEligible,
  };
}
