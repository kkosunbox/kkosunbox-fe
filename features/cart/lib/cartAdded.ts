import type { CartDto } from "../api/types";
import type { ProductDto } from "@/features/product/api";

export function getCartShippingProgress(cart: CartDto) {
  const threshold = Math.max(0, cart.freeShippingThreshold);
  const amount = Math.max(0, cart.itemsAmount);
  const isFree = cart.shippingFee === 0;
  return {
    amount,
    threshold,
    isFree,
    remaining: isFree ? 0 : Math.max(0, threshold - amount),
    percent: isFree ? 100 : threshold > 0 ? Math.min(100, (amount / threshold) * 100) : 0,
  };
}

export function getCartRecommendations(products: ProductDto[], cart: CartDto) {
  const excluded = new Set(cart.items.map((item) => item.productId));
  return products.filter((product) => {
    if (excluded.has(product.id) || product.isSoldOut || product.isSalesPaused ||
      (product.stockQuantity != null && product.stockQuantity <= 0)) return false;
    excluded.add(product.id);
    return true;
  }).slice(0, 3);
}
