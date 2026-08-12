import { describe, it, expect } from "vitest";
import { computeOrderPricing } from "@/features/order";
import {
  referralDiscountAmount,
  referralUnitPrice,
} from "@/features/referral/lib/referralPricing";

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

  it("초대코드 할인금액만 → 단가 1개 기준으로 차감", () => {
    const p = computeOrderPricing({ unitPrice: UNIT, quantity: 1, inviteDiscount: 3900 });
    expect(p.couponDiscount).toBe(0);
    expect(p.inviteDiscount).toBe(3900);
    expect(p.total).toBe(35100);
  });

  it("쿠폰 + 초대코드 → 각각 계산 후 합산", () => {
    const p = computeOrderPricing({
      unitPrice: UNIT,
      quantity: 1,
      couponDiscount: 3900,
      inviteDiscount: 3900,
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
      inviteDiscount: 3900,
    });
    expect(p.basePrice).toBe(117000);
    expect(p.couponDiscount).toBe(3900); // 단가 1개 기준 (수량 무관)
    expect(p.inviteDiscount).toBe(3900);
    expect(p.total).toBe(117000 - 7800); // 109,200
  });

  it("초대코드 할인금액은 referralDiscountAmount()가 계산해 넘긴 값을 그대로 쓴다", () => {
    // 백엔드 청구식 floor(단가 × 요율): 33,333 × 0.15 = 4,999.95 → 4,999
    // (round(단가 × (1−요율))로 단가부터 구하면 5,000이 되어 서버보다 1원 더 깎인다)
    const amount = referralDiscountAmount(33333, { inviteEligible: true, discountRate: 0.15 });
    expect(amount).toBe(4999);
    const q = computeOrderPricing({ unitPrice: 33333, quantity: 1, inviteDiscount: amount });
    expect(q.inviteDiscount).toBe(4999);
    // 플랜 선택 화면이 보여주는 단가와 주문서 총액이 정확히 일치해야 한다
    expect(q.total).toBe(referralUnitPrice(33333, { inviteEligible: true, discountRate: 0.15 }));
  });

  it("할인이 주문상품금액을 초과해도 총액은 0 미만으로 내려가지 않음", () => {
    // 수량 1 + 두 할인 합이 단가를 넘는 극단값
    const p = computeOrderPricing({
      unitPrice: 1000,
      quantity: 1,
      couponDiscount: 1000,
      inviteDiscount: 500,
    });
    expect(p.totalDiscount).toBe(1500);
    expect(p.total).toBe(0);
  });

  it("미적용(null/0)은 할인 0으로 처리", () => {
    const p = computeOrderPricing({
      unitPrice: UNIT,
      quantity: 1,
      couponDiscount: null,
      inviteDiscount: 0,
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
