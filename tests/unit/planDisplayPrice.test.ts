import { describe, it, expect } from "vitest";
import { planDisplayPrice } from "@/features/subscription/lib/planDisplayPrice";

/**
 * 값은 전부 2026-08-31 dev 실측(`GET /v1/subscriptions/plans?referralCode=nqy5gx6b`) 기준.
 * 서버는 할인액을 100원 단위로 내림하므로 프론트가 `monthlyPrice`에서 유도하면 안 된다 —
 * 그 회귀를 막는 것이 이 테스트의 목적이다.
 */
const BASIC = {
  monthlyPrice: 17900,
  originalPrice: 20900,
  discountRate: 15,
  referralDiscountedPrice: 15300,
  referralDiscountRate: 0.15,
};

describe("planDisplayPrice", () => {
  it("초대 할인가가 있으면 서버 값을 그대로 쓴다 (프론트 유도 금지)", () => {
    const price = planDisplayPrice(BASIC);
    expect(price.price).toBe(15300);
    // 프론트가 floor(17900 × 0.15)로 유도하면 15,215가 나온다 — 85원 싸게 표시되던 옛 버그.
    expect(price.price).not.toBe(15215);
    expect(price.referralApplied).toBe(true);
    expect(price.referralPct).toBe(15);
  });

  it("초대 할인 필드가 null이면 정가 기준으로 떨어진다", () => {
    const price = planDisplayPrice({
      monthlyPrice: 17900,
      originalPrice: 20900,
      discountRate: 15,
      referralDiscountedPrice: null,
      referralDiscountRate: null,
    });
    expect(price.price).toBe(17900);
    expect(price.strikePrice).toBe(20900);
    // 가격비로 재계산하면 14%가 나온다 — 서버 선언값 15%를 그대로 써야 한다.
    expect(price.discountPct).toBe(15);
    expect(price.referralApplied).toBe(false);
    expect(price.referralPct).toBe(0);
  });

  it("초대 할인이 얹히면 합산 할인율을 유도한다 (서버에 해당 필드가 없음)", () => {
    // 1 − 15300/20900 = 0.2679…
    expect(planDisplayPrice(BASIC).discountPct).toBe(27);
    expect(planDisplayPrice(BASIC).strikePrice).toBe(20900);
  });

  it("할인이 전혀 없으면 취소선·할인율을 숨긴다", () => {
    const price = planDisplayPrice({
      monthlyPrice: 17900,
      originalPrice: null,
      discountRate: null,
      referralDiscountedPrice: null,
      referralDiscountRate: null,
    });
    expect(price.price).toBe(17900);
    expect(price.strikePrice).toBeNull();
    expect(price.discountPct).toBeNull();
  });

  it("originalPrice가 표시가와 같으면 0% 취소선을 만들지 않는다", () => {
    const price = planDisplayPrice({
      monthlyPrice: 17900,
      originalPrice: 17900,
      discountRate: 0,
      referralDiscountedPrice: null,
      referralDiscountRate: null,
    });
    expect(price.strikePrice).toBeNull();
    expect(price.discountPct).toBeNull();
  });
});
