import type { CartDto } from "../api/types";
import type { ProductDto } from "@/features/product/api";

/** 담기 모달 추천에서 제외할 상품 카테고리 이름 (id는 환경마다 달라 이름으로 판별) */
const EXCLUDED_RECOMMENDATION_CATEGORY_NAMES = new Set(["패키지"]);

export function getCartRecommendations(
  products: ProductDto[],
  cart: CartDto,
  random: () => number = Math.random,
  additionallyExcludedProductIds: Iterable<number> = [],
) {
  return getCartRecommendationPool(
    products,
    random,
    [
    ...cart.items.map((item) => item.productId),
    ...additionallyExcludedProductIds,
    ],
  ).slice(0, 3);
}

export function getCartRecommendationPool(
  products: ProductDto[],
  random: () => number = Math.random,
  excludedProductIds: Iterable<number> = [],
) {
  const excluded = new Set(excludedProductIds);
  const candidates = products.filter((product) => {
    if (excluded.has(product.id) || product.isSoldOut || product.isSalesPaused ||
      EXCLUDED_RECOMMENDATION_CATEGORY_NAMES.has(product.category?.name.trim() ?? "") ||
      (product.stockQuantity != null && product.stockQuantity <= 0)) return false;
    excluded.add(product.id);
    return true;
  });

  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
  }

  return candidates;
}
