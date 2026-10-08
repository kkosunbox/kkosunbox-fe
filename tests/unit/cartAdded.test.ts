import { describe, expect, it } from "vitest";
import { getCartRecommendationPool, getCartRecommendations } from "@/features/cart/lib/cartAdded";
import { getPackageProgress, getPackageProgressPercent, PACKAGE_PANEL_MARKERS } from "@/features/cart/lib/packageProgress";
import type { CartDto } from "@/features/cart/api/types";
import type { ProductDto } from "@/features/product/api/types";

const cart: CartDto = {
  items: [], itemCount: 0, totalQuantity: 0, itemsAmount: 39000,
  shippingFee: 4000, estimatedAmount: 43000, freeShippingThreshold: 50000, hasUnorderableItem: false,
};
const product = (id: number, overrides: Partial<ProductDto> = {}): ProductDto => ({
  id, name: `상품 ${id}`, price: 8500, originalPrice: 10000, categoryId: null, category: null,
  isSoldOut: false, isSalesPaused: false, averageRating: 0, reviewCount: 0, ...overrides,
});

describe("장바구니 담기 모달", () => {
  const policy = { minimumOrderAmount: 20000, freeShippingThreshold: 50000, shippingFee: 3000 };
  const orderable = { ...cart, items: [{ id: 1, productId: 1, productName: "상품", unitPrice: 39000, quantity: 1, itemAmount: 39000, stockQuantity: null, isOrderable: true, createdAt: "" }] };

  it("최소 주문·무료배송까지 남은 금액과 고정 마커 기준 진행률을 계산한다", () => {
    const progress = getPackageProgress(orderable, policy);
    expect(progress).toMatchObject({ remainingToMinimum: 0, remainingToFree: 11000, minimumReached: true, isFree: false, shippingFee: 4000 });
    expect(getPackageProgressPercent(progress, PACKAGE_PANEL_MARKERS)).toBeCloseTo(21.8 + (19000 / 30000) * 56.4);
    const below = getPackageProgress({ ...orderable, itemsAmount: 10000 }, policy);
    expect(below).toMatchObject({ minimumReached: false, remainingToMinimum: 10000 });
    expect(getPackageProgressPercent(below, PACKAGE_PANEL_MARKERS)).toBeCloseTo(10.9);
  });
  it("무료배송은 서버가 확정한 배송비를 따른다", () => {
    const free = getPackageProgress({ ...orderable, shippingFee: 0 }, policy);
    expect(free).toMatchObject({ remainingToFree: 0, isFree: true });
    expect(getPackageProgressPercent(free, PACKAGE_PANEL_MARKERS)).toBe(100);
  });
  it("빈 패키지는 주문 불가이며 정책의 기본 배송비를 보여준다", () => {
    const empty = getPackageProgress({ ...cart, itemsAmount: 0, shippingFee: 0 }, policy);
    expect(empty).toMatchObject({ minimumReached: false, isFree: false, shippingFee: 3000 });
    expect(getPackageProgressPercent(empty, PACKAGE_PANEL_MARKERS)).toBe(0);
    expect(getPackageProgress(null, null)).toMatchObject({ minimumReached: false, orderableIds: [] });
  });
  it("품절·판매중지·재고 0 상품을 제외하고 최대 3개를 추천한다", () => {
    const products = [product(1, { isSoldOut: true }), product(2, { isSalesPaused: true }), product(3, { stockQuantity: 0 }), product(4), product(5), product(6), product(7)];
    expect(getCartRecommendations(products, cart, () => 0.999).map((p) => p.id)).toEqual([4, 5, 6]);
  });
  it("패키지 카테고리 상품은 추천하지 않는다", () => {
    const packageCategory = { id: 6, name: "패키지", sortOrder: 0 };
    const products = [product(1, { categoryId: 6, category: packageCategory }), product(2), product(3)];
    expect(getCartRecommendationPool(products, () => 0.999).map((p) => p.id)).toEqual([2, 3]);
  });
  it("방금 담은 상품·장바구니 상품·중복 상품은 추천하지 않는다", () => {
    const withItems: CartDto = {
      ...cart,
      items: [
        { id: 1, productId: 1, productName: "상품 1", unitPrice: 8500, quantity: 1, itemAmount: 8500, stockQuantity: null, isOrderable: true, createdAt: "" },
        { id: 2, productId: 2, productName: "상품 2", unitPrice: 8500, quantity: 1, itemAmount: 8500, stockQuantity: null, isOrderable: true, createdAt: "" },
      ],
    };
    const recommendations = getCartRecommendations(
      [product(1), product(2), product(3), product(3), product(4)],
      withItems,
      () => 0.999,
      [3],
    );
    expect(recommendations.map((p) => p.id)).toEqual([4]);
  });
  it("모달을 열 때 추천 후보를 무작위로 섞어 3개를 선택한다", () => {
    const products = [product(1), product(2), product(3), product(4), product(5)];
    expect(getCartRecommendations(products, cart, () => 0).map((p) => p.id)).toEqual([2, 3, 4]);
  });
  it("추천 상품이 없어도 빈 배열을 반환한다", () => {
    expect(getCartRecommendations([], cart)).toEqual([]);
  });
  it("순환 추천 풀은 제외 상품과 중복 상품을 빼고 전체 후보를 반환한다", () => {
    const pool = getCartRecommendationPool(
      [product(1), product(2), product(2), product(3), product(4, { isSoldOut: true })],
      () => 0.999,
      [1, 3],
    );
    expect(pool.map((item) => item.id)).toEqual([2]);
  });
});
