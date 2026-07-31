import { PACKAGES, tierFromSubscriptionPlan, type PackageTier, type SubscriptionPlanLike } from "@/entities/package";
import { logProductResolveByTier } from "./productDebugLog";
import type { ProductDto } from "../api/types";

/**
 * 상품의 `relatedPlanId`로 연결된 구독 플랜을 찾아 티어를 역매핑한다.
 * relatedPlanId가 없거나 매칭되는 플랜이 없으면 상품명으로 폴백한다(백엔드 데이터 과도기 대응).
 */
export function resolveProductTier(product: ProductDto, plans: SubscriptionPlanLike[]): PackageTier | null {
  if (product.relatedPlanId != null) {
    const plan = plans.find((p) => p.id === product.relatedPlanId);
    if (plan) return tierFromSubscriptionPlan(plan);
  }
  return PACKAGES.find((pkg) => pkg.name === product.name)?.tier ?? null;
}

/**
 * 티어별로 판매 중인 단건 상품을 찾는다. 카탈로그에 아직 없는 티어는 null
 * (체크아웃 시점에 `productId === null` 가드로 안내·차단하는 기존 안전장치를 그대로 활용).
 */
export function resolveProductsByTier(
  products: ProductDto[],
  plans: SubscriptionPlanLike[],
): Record<PackageTier, ProductDto | null> {
  const result: Record<PackageTier, ProductDto | null> = {
    Basic: null,
    Standard: null,
    Premium: null,
  };

  for (const product of products) {
    const tier = resolveProductTier(product, plans);
    if (tier && !result[tier]) result[tier] = product;
  }

  logProductResolveByTier(
    Object.fromEntries(
      (Object.keys(result) as PackageTier[]).map((tier) => {
        const product = result[tier];
        if (!product) return [tier, null];
        const reason = product.relatedPlanId != null ? "relatedPlanId 매칭" : "이름 매칭(폴백)";
        return [tier, { id: product.id, name: product.name, reason }];
      }),
    ),
  );

  return result;
}
