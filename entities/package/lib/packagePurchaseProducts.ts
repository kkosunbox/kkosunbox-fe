import type { PackageTier } from "./packageData";

export interface PackagePurchaseProduct {
  tier: PackageTier;
  price: number;
}

/**
 * /purchase 박스 1회 구매(구독 아님) **가격 폴백** — 백엔드 상품 카탈로그가 비었을 때만 쓴다.
 * 카탈로그에 상품이 있으면 항상 `ProductDto.price`가 우선한다.
 *
 * ⚠️ 여기에 `rating`을 다시 넣지 말 것. 별점은 백엔드 `SubscriptionPlanDto.averageRating`이
 * 유일한 출처다(`resolveAverageRatingByTier`). 과거 이 파일과 ReferralPlanPicker가 각각
 * 하드코딩 별점을 갖고 있어 같은 티어에 서로 다른 값이 보였다(Basic 4.6 vs 4.9).
 */
export const PACKAGE_PURCHASE_PRODUCTS: PackagePurchaseProduct[] = [
  { tier: "Basic", price: 19900 },
  { tier: "Standard", price: 23900 },
  { tier: "Premium", price: 27500 },
];

export function getPackagePurchaseProduct(tier: PackageTier): PackagePurchaseProduct | undefined {
  return PACKAGE_PURCHASE_PRODUCTS.find((p) => p.tier === tier);
}

/** 현재 실제로 단품 판매 중인 티어 — 나머지는 데이터만 유지, UI에 노출하지 않는다. */
export const CURRENT_PURCHASE_TIER: PackageTier = "Premium";
