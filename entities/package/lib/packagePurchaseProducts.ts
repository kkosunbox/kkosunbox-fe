import type { PackageTier } from "./packageData";

export interface PackagePurchaseProduct {
  tier: PackageTier;
  price: number;
  rating: number;
}

/**
 * /purchase 박스 1회 구매(구독 아님) 더미 가격·평점 — 체험용 단품 판매 컨셉.
 * 실제 상품 API 연동 시 이 배열을 서버 응답으로 교체한다.
 */
export const PACKAGE_PURCHASE_PRODUCTS: PackagePurchaseProduct[] = [
  { tier: "Basic", price: 19900, rating: 4.6 },
  { tier: "Standard", price: 23900, rating: 4.8 },
  { tier: "Premium", price: 27500, rating: 4.7 },
];

export function getPackagePurchaseProduct(tier: PackageTier): PackagePurchaseProduct | undefined {
  return PACKAGE_PURCHASE_PRODUCTS.find((p) => p.tier === tier);
}

/** 현재 실제로 단품 판매 중인 티어 — 나머지는 데이터만 유지, UI에 노출하지 않는다. */
export const CURRENT_PURCHASE_TIER: PackageTier = "Premium";
