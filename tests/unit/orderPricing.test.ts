import { describe, it, expect } from "vitest";
import { computeOrderPricing } from "@/features/order";

// 기준 단가 39,000원 (베이직 플랜)
const UNIT = 39000;

describe("computeOrderPricing", () => {
  it("할인 없음 → 총액 = 주문상품금액", () => {
    const p = computeOrderPricing({ unitPrice: UNIT, quantity: 1 });
    expect(p).toEqual({
      basePrice: 39000,
      couponDiscount: 0,
      inviteDiscount: 0,
      totalDiscount: 0,
      total: 39000,
    });
  });

  it("쿠폰 할인금액만 전달 → 그대로 차감", () => {
    const p = computeOrderPricing({ unitPrice: UNIT, quantity: 1, couponDiscount: 3900 });
    expect(p.couponDiscount).toBe(3900);
    expect(p.inviteDiscount).toBe(0);
    expect(p.total).toBe(35100);
  });

  it("초대코드만 10%(0.1) → 단가 1개 기준 floor 할인", () => {
    const p = computeOrderPricing({ unitPrice: UNIT, quantity: 1, inviteRate: 0.1 });
    expect(p.couponDiscount).toBe(0);
    expect(p.inviteDiscount).toBe(3900);
    expect(p.total).toBe(35100);
  });

  it("쿠폰 + 초대코드 → 각각 계산 후 합산", () => {
    const p = computeOrderPricing({
      unitPrice: UNIT,
      quantity: 1,
      couponDiscount: 3900,
      inviteRate: 0.1,
    });
    expect(p.couponDiscount).toBe(3900);
    expect(p.inviteDiscount).toBe(3900);
    expect(p.totalDiscount).toBe(7800);
    expect(p.total).toBe(31200);
  });

  it("수량 > 1 → 주문상품금액만 배수, 할인은 단가 1개 기준 고정", () => {
    const p = computeOrderPricing({
      unitPrice: UNIT,
      quantity: 3,
      couponDiscount: 3900,
      inviteRate: 0.1,
    });
    expect(p.basePrice).toBe(117000);
    expect(p.couponDiscount).toBe(3900); // 단가 1개 기준 (수량 무관)
    expect(p.inviteDiscount).toBe(3900);
    expect(p.total).toBe(117000 - 7800); // 109,200
  });

  it("초대코드 할인율이 나누어떨어지지 않으면 floor(내림) 처리", () => {
    // 33,333 × 0.15 = 4,999.95 → floor 4,999
    const q = computeOrderPricing({ unitPrice: 33333, quantity: 1, inviteRate: 0.15 });
    expect(q.inviteDiscount).toBe(4999);
  });

  it("할인이 주문상품금액을 초과해도 총액은 0 미만으로 내려가지 않음", () => {
    // 수량 1 + 두 할인 합이 단가를 넘는 극단값
    const p = computeOrderPricing({
      unitPrice: 1000,
      quantity: 1,
      couponDiscount: 1000,
      inviteRate: 0.5,
    });
    expect(p.totalDiscount).toBe(1500);
    expect(p.total).toBe(0);
  });

  it("미적용(null/0)은 할인 0으로 처리", () => {
    const p = computeOrderPricing({
      unitPrice: UNIT,
      quantity: 1,
      couponDiscount: null,
      inviteRate: 0,
    });
    expect(p.couponDiscount).toBe(0);
    expect(p.inviteDiscount).toBe(0);
    expect(p.total).toBe(39000);
  });

  it("음수 쿠폰 할인금액은 0으로 방어", () => {
    const p = computeOrderPricing({ unitPrice: UNIT, quantity: 1, couponDiscount: -5000 });
    expect(p.couponDiscount).toBe(0);
    expect(p.total).toBe(39000);
  });
});
