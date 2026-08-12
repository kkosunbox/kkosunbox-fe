import { describe, expect, it } from "vitest";
import {
  combinedDiscountPercent,
  referralDiscountAmount,
  referralUnitPrice,
} from "@/features/referral/lib/referralPricing";
import { computeOrderPricing } from "@/features/order";

const ELIGIBLE = { inviteEligible: true, discountRate: 0.15 };
const INELIGIBLE = { inviteEligible: false, discountRate: 0.15 };

describe("referralUnitPrice", () => {
  it("적격이면 할인 단가를 돌려준다", () => {
    // dev 실데이터: 프리미엄 28,900원 + 15% 초대 할인
    expect(referralUnitPrice(28900, ELIGIBLE)).toBe(24565);
  });

  it("적격이 아니면 정가 그대로 — 호출부가 따로 분기하지 않아도 되게", () => {
    expect(referralUnitPrice(28900, INELIGIBLE)).toBe(28900);
  });

  it("할인율이 0이면 정가 그대로", () => {
    expect(referralUnitPrice(28900, { inviteEligible: true, discountRate: 0 })).toBe(28900);
  });
});

describe("referralDiscountAmount", () => {
  it("백엔드 청구식 floor(단가 × 요율)과 원 단위까지 일치한다", () => {
    // 나누어떨어지지 않는 경우가 핵심 — round로 단가부터 구하면 서버보다 1원 더 깎인다
    expect(referralDiscountAmount(33333, ELIGIBLE)).toBe(Math.floor(33333 * 0.15)); // 4,999
    expect(referralUnitPrice(33333, ELIGIBLE)).toBe(33333 - 4999);
  });

  it("정가 − 할인단가로 유도되므로 단가와 항상 정확히 맞는다", () => {
    const price = 33333;
    expect(referralUnitPrice(price, ELIGIBLE) + referralDiscountAmount(price, ELIGIBLE)).toBe(price);
  });

  it("적격이 아니면 0", () => {
    expect(referralDiscountAmount(28900, INELIGIBLE)).toBe(0);
  });
});

describe("플랜 화면 단가 == 주문서 쿠폰 적용 전 총액 (수량 1)", () => {
  // 회귀 방지: 예전에는 플랜 화면이 round(P×(1−r)), 주문서가 P−floor(P×r)로 각자 계산해
  // 같은 플랜에 다른 값이 나올 수 있었다(2026-08-12 /r/{slug} 24,565 vs /order 28,900 사고의 일부).
  const PLANS = [28900, 26900, 20900, 17900, 33333, 39000];

  for (const monthlyPrice of PLANS) {
    it(`${monthlyPrice.toLocaleString("ko-KR")}원 — 두 화면 값이 일치`, () => {
      const planScreen = referralUnitPrice(monthlyPrice, ELIGIBLE);
      const order = computeOrderPricing({
        unitPrice: monthlyPrice,
        quantity: 1,
        inviteDiscount: referralDiscountAmount(monthlyPrice, ELIGIBLE),
      });
      expect(order.total).toBe(planScreen);
    });
  }

  it("부적격이면 두 화면 모두 정가", () => {
    const planScreen = referralUnitPrice(28900, INELIGIBLE);
    const order = computeOrderPricing({
      unitPrice: 28900,
      quantity: 1,
      inviteDiscount: referralDiscountAmount(28900, INELIGIBLE),
    });
    expect(planScreen).toBe(28900);
    expect(order.total).toBe(28900);
  });
});

describe("combinedDiscountPercent", () => {
  it("정가(originalPrice) 대비 초대 할인까지 합산한 비율", () => {
    // 33,900 → 24,565 = 27.5% → 반올림 28%
    expect(combinedDiscountPercent({ monthlyPrice: 28900, originalPrice: 33900 }, ELIGIBLE)).toBe(28);
  });

  it("적격이 아니면 플랜 자체 할인율만 남는다", () => {
    // 33,900 → 28,900 = 14.7% → 반올림 15%
    expect(combinedDiscountPercent({ monthlyPrice: 28900, originalPrice: 33900 }, INELIGIBLE)).toBe(15);
  });

  it("originalPrice가 없으면 monthlyPrice를 기준으로 본다", () => {
    expect(combinedDiscountPercent({ monthlyPrice: 28900 }, ELIGIBLE)).toBe(15);
  });
});
