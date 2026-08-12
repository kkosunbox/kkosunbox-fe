import { describe, it, expect } from "vitest";
import { resolveSubscriptionCouponDiscount } from "@/features/subscription/lib/couponDiscount";
import { resolveProductCouponDiscount } from "@/features/product/lib/couponDiscount";
import type { CouponInfo } from "@/features/subscription/api/types";
import type { ProductCouponInfo } from "@/features/product/api/types";

// 기준 단가 39,000원 (베이직 플랜)
const UNIT = 39000;

function subCoupon(overrides: Partial<CouponInfo>): CouponInfo {
  return { canUse: true, discountType: "percent", applyCount: 1, discountRate: 10, ...overrides };
}

function productCoupon(overrides: Partial<ProductCouponInfo>): ProductCouponInfo {
  return { canUse: true, discountRate: 10, ...overrides };
}

describe("resolveSubscriptionCouponDiscount (구독 쿠폰 — 정률/정액)", () => {
  it("정률 10% → 단가 1개 기준 floor 할인", () => {
    expect(resolveSubscriptionCouponDiscount(subCoupon({ discountRate: 10 }), UNIT)).toBe(3900);
  });

  it("정률이 나누어떨어지지 않으면 floor(내림)", () => {
    // 33,333 × 7% = 2,333.31 → 2,333
    expect(resolveSubscriptionCouponDiscount(subCoupon({ discountRate: 7 }), 33333)).toBe(2333);
  });

  it("정액 5,000원 → 액수 그대로 할인", () => {
    const info = subCoupon({ discountType: "fixed", discountRate: null, discountAmount: 5000 });
    expect(resolveSubscriptionCouponDiscount(info, UNIT)).toBe(5000);
  });

  it("정액이 단가를 넘으면 단가까지만 할인", () => {
    const info = subCoupon({ discountType: "fixed", discountRate: null, discountAmount: 50000 });
    expect(resolveSubscriptionCouponDiscount(info, UNIT)).toBe(UNIT);
  });

  // dev 실측: `spring30`은 discountType이 "fixed"인데 discountRate(30)도 함께 내려온다.
  // 스펙상 "정액일 때만 discountAmount에 값이 있음"이지만 실제 응답은 두 필드가 다 차 있다.
  // 어느 필드가 채워졌는지로 타입을 추론하면 안 되고, 반드시 discountType으로 분기해야 한다.
  it("정액인데 discountRate도 함께 오면 discountType을 따른다 (정률로 계산하면 안 됨)", () => {
    const info = subCoupon({ discountType: "fixed", discountRate: 30, discountAmount: 10000 });
    expect(resolveSubscriptionCouponDiscount(info, 17900)).toBe(10000); // 정률이면 5,370
  });

  it("정률인데 discountAmount도 함께 오면 정률을 쓴다", () => {
    const info = subCoupon({ discountType: "percent", discountRate: 10, discountAmount: 10000 });
    expect(resolveSubscriptionCouponDiscount(info, 17900)).toBe(1790);
  });

  it("정액인데 discountAmount가 null이면 0", () => {
    const info = subCoupon({ discountType: "fixed", discountRate: null, discountAmount: null });
    expect(resolveSubscriptionCouponDiscount(info, UNIT)).toBe(0);
  });

  it("canUse가 false면 할인 0 (할인율이 실려 와도 무시)", () => {
    expect(resolveSubscriptionCouponDiscount(subCoupon({ canUse: false }), UNIT)).toBe(0);
  });

  it("쿠폰 미적용(null)이면 할인 0", () => {
    expect(resolveSubscriptionCouponDiscount(null, UNIT)).toBe(0);
  });

  it("applyCount는 최초 결제 금액에 영향을 주지 않음", () => {
    const once = resolveSubscriptionCouponDiscount(subCoupon({ applyCount: 1 }), UNIT);
    const many = resolveSubscriptionCouponDiscount(subCoupon({ applyCount: 5 }), UNIT);
    expect(once).toBe(many);
  });
});

// 단건 쿠폰은 **주문상품금액(단가 × 수량)** 기준이다 — 구독(단가 1개)과 규칙이 다르다.
// dev 실측 근거: `summer20` 설명이 "주문 총액의 20% 할인 (최대 1만원)".
describe("resolveProductCouponDiscount (단건 쿠폰 — 정률 + 상한, 주문 총액 기준)", () => {
  const PREMIUM = 33900; // dev 프리미엄 단가

  it("정률 10% → 주문상품금액 기준 floor 할인", () => {
    expect(resolveProductCouponDiscount(productCoupon({ discountRate: 10 }), UNIT)).toBe(3900);
  });

  it("수량 3개 → 단가가 아니라 주문상품금액 전체에 적용", () => {
    // 실측 케이스: 33,900 × 3 = 101,700, summer20(20%, 상한 10,000)
    const info = productCoupon({ discountRate: 20, maxDiscountAmount: 10000 });
    // 101,700 × 20% = 20,340 → 상한 10,000으로 절삭
    expect(resolveProductCouponDiscount(info, PREMIUM * 3)).toBe(10000);
  });

  it("수량 1개에서는 상한에 못 미쳐 그대로 적용 (실측값과 일치)", () => {
    const info = productCoupon({ discountRate: 20, maxDiscountAmount: 10000 });
    expect(resolveProductCouponDiscount(info, PREMIUM)).toBe(6780);
  });

  it("상한이 있으면 상한까지만 할인", () => {
    // 39,000 × 20% = 7,800 이지만 상한 5,000
    const info = productCoupon({ discountRate: 20, maxDiscountAmount: 5000 });
    expect(resolveProductCouponDiscount(info, UNIT)).toBe(5000);
  });

  it("계산된 할인이 상한보다 작으면 상한은 영향 없음", () => {
    const info = productCoupon({ discountRate: 10, maxDiscountAmount: 5000 });
    expect(resolveProductCouponDiscount(info, UNIT)).toBe(3900);
  });

  it("상한이 null(제한 없음)이면 할인율 그대로 적용", () => {
    const info = productCoupon({ discountRate: 20, maxDiscountAmount: null });
    expect(resolveProductCouponDiscount(info, UNIT)).toBe(7800);
  });

  it("100% 쿠폰이어도 주문금액을 넘지 않음", () => {
    expect(resolveProductCouponDiscount(productCoupon({ discountRate: 100 }), UNIT)).toBe(UNIT);
  });

  it("canUse가 false면 할인 0", () => {
    expect(resolveProductCouponDiscount(productCoupon({ canUse: false }), UNIT)).toBe(0);
  });

  it("쿠폰 미적용(null)이면 할인 0", () => {
    expect(resolveProductCouponDiscount(null, UNIT)).toBe(0);
  });
});
