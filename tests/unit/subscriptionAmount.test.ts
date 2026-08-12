import { describe, expect, it } from "vitest";
import {
  subscriptionPaidAmount,
  totalSubscriptionPaidAmount,
} from "@/features/subscription/lib/subscriptionAmount";
import type { UserSubscriptionDto } from "@/features/subscription/api/types";

function sub(overrides: Partial<UserSubscriptionDto> = {}): UserSubscriptionDto {
  return {
    id: 1,
    userId: 1,
    petProfileId: 1,
    deliveryAddressId: 1,
    plan: {
      id: 3,
      name: "프리미엄 패키지 BOX",
      monthlyPrice: 28900,
      sortOrder: 3,
      isRecommended: false,
      averageRating: 4.8,
      tags: [],
    },
    quantity: 6,
    status: "active",
    nextBillingDate: "2026-09-11",
    isActive: true,
    isPaused: false,
    ...overrides,
  };
}

describe("subscriptionPaidAmount", () => {
  it("서버가 내려준 lastPaidAmount를 그대로 쓴다", () => {
    expect(subscriptionPaidAmount(sub({ lastPaidAmount: 170510 }))).toBe(170510);
  });

  it("정가(monthlyPrice × quantity)로 대체하지 않는다 — 할인 소진 전후 값이 다르기 때문", () => {
    // 프리미엄 6BOX 정가는 173,400원이지만 welcome10(applyCount 1) 적용분은 170,510원
    const withCoupon = sub({ lastPaidAmount: 170510 });
    expect(subscriptionPaidAmount(withCoupon)).not.toBe(
      withCoupon.plan.monthlyPrice * withCoupon.quantity,
    );
  });

  it("결제 이력이 없으면(null) null — 정가로 채우지 않는다", () => {
    expect(subscriptionPaidAmount(sub({ status: "scheduled", lastPaidAmount: null }))).toBeNull();
  });

  it("필드 자체가 없는 응답(구버전 백엔드)도 null로 다룬다", () => {
    expect(subscriptionPaidAmount(sub())).toBeNull();
  });

  it("0원 결제는 null이 아니라 0으로 유지된다", () => {
    expect(subscriptionPaidAmount(sub({ lastPaidAmount: 0 }))).toBe(0);
  });
});

describe("totalSubscriptionPaidAmount", () => {
  it("여러 구독의 실결제액을 합산한다", () => {
    const total = totalSubscriptionPaidAmount([
      sub({ id: 1, lastPaidAmount: 170510 }),
      sub({ id: 2, lastPaidAmount: 39000 }),
    ]);
    expect(total).toBe(209510);
  });

  it("결제 이력이 없는 구독은 합계에서 제외한다", () => {
    const total = totalSubscriptionPaidAmount([
      sub({ id: 1, lastPaidAmount: 39000 }),
      sub({ id: 2, status: "scheduled", lastPaidAmount: null }),
    ]);
    expect(total).toBe(39000);
  });

  it("합산할 값이 하나도 없으면 null — 호출부가 '-'로 표시할 수 있게", () => {
    expect(totalSubscriptionPaidAmount([sub({ lastPaidAmount: null })])).toBeNull();
    expect(totalSubscriptionPaidAmount([])).toBeNull();
  });

  it("전부 0원이면 null이 아니라 0", () => {
    expect(totalSubscriptionPaidAmount([sub({ lastPaidAmount: 0 })])).toBe(0);
  });
});
