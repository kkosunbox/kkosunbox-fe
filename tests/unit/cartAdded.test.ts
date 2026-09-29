import { describe, expect, it } from "vitest";
import { getCartRecommendations, getCartShippingProgress } from "@/features/cart/lib/cartAdded";
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
  it("서버 기준액에 대한 남은 금액과 진행률을 계산한다", () => {
    expect(getCartShippingProgress(cart)).toMatchObject({ remaining: 11000, percent: 78, isFree: false });
    expect(getCartShippingProgress({ ...cart, freeShippingThreshold: 60000 }).remaining).toBe(21000);
  });
  it("무료배송은 서버가 확정한 배송비를 따른다", () => {
    expect(getCartShippingProgress({ ...cart, shippingFee: 0 })).toMatchObject({ remaining: 0, percent: 100, isFree: true });
  });
  it("기준액을 넘거나 기준액이 0이어도 진행률을 안전하게 표시한다", () => {
    expect(getCartShippingProgress({ ...cart, itemsAmount: 70000 }).percent).toBe(100);
    expect(getCartShippingProgress({ ...cart, freeShippingThreshold: 0 }).percent).toBe(0);
  });
  it("품절·판매중지·재고 0 상품을 제외하고 최대 3개를 추천한다", () => {
    const products = [product(1, { isSoldOut: true }), product(2, { isSalesPaused: true }), product(3, { stockQuantity: 0 }), product(4), product(5), product(6), product(7)];
    expect(getCartRecommendations(products, cart).map((p) => p.id)).toEqual([4, 5, 6]);
  });
  it("이미 담은 상품과 중복 상품은 추천하지 않는다", () => {
    const withItem: CartDto = { ...cart, items: [{ id: 1, productId: 1, productName: "상품 1", unitPrice: 8500, quantity: 1, itemAmount: 8500, stockQuantity: null, isOrderable: true, createdAt: "" }] };
    expect(getCartRecommendations([product(1), product(2), product(2), product(3)], withItem).map((p) => p.id)).toEqual([2, 3]);
  });
  it("추천 상품이 없어도 빈 배열을 반환한다", () => {
    expect(getCartRecommendations([], cart)).toEqual([]);
  });
});
