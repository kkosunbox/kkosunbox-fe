/** 스토어 상품 상세 경로 — 패키지 상품은 `getPackageProductPath`의 고정 slug 경로를 쓴다 */
export function getProductDetailPath(productId: number): string {
  return `/products/${productId}`;
}
