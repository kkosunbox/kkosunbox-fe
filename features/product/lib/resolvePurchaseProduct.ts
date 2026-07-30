import { logProductResolve } from "./productDebugLog";
import type { ProductDto } from "../api/types";

/**
 * 상품명 기준으로 판매 중인 단건 상품을 찾는다.
 * 상품이 정확히 1개뿐이면(현재 프리미엄만 판매) 이름이 정확히 일치하지 않아도 그 상품으로 간주한다.
 */
export function resolvePurchaseProduct(
  products: ProductDto[],
  packageName: string,
): ProductDto | null {
  const byName = products.find((p) => p.name === packageName);
  const resolved = byName ?? (products.length === 1 ? products[0] : null);
  logProductResolve(packageName, products, resolved);
  return resolved;
}
