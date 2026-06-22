import { useReferral } from "./ReferralProvider";

export interface ReferralPricing {
  /** 월 요금에 레퍼럴 할인을 적용한 금액 */
  referralPrice: (monthlyPrice: number) => number;
  /** 정가 대비 합산 할인율(%) */
  combinedDiscountPct: (plan: { monthlyPrice: number; originalPrice: number }) => number;
  /** 레퍼럴 추가 할인율(%) */
  additionalDiscountPct: number;
  isReferral: boolean;
}

export function useReferralPricing(): ReferralPricing {
  const { discountRate, isReferral } = useReferral();
  const additionalDiscountPct = Math.round(discountRate * 100);
  const referralPrice = (monthlyPrice: number) =>
    Math.round(monthlyPrice * (1 - discountRate));
  const combinedDiscountPct = (plan: { monthlyPrice: number; originalPrice: number }) =>
    Math.round((1 - referralPrice(plan.monthlyPrice) / plan.originalPrice) * 100);
  return { referralPrice, combinedDiscountPct, additionalDiscountPct, isReferral };
}
