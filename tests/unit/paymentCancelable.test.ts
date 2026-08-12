import { describe, it, expect } from "vitest";
import { isPaymentCancelable } from "@/features/subscription/lib/paymentCancelable";
import type { SubscriptionPaymentDto } from "@/features/subscription/api/types";

function payment(overrides: Partial<SubscriptionPaymentDto>): SubscriptionPaymentDto {
  return {
    id: 1,
    amount: 39000,
    status: "completed",
    displayStatus: "preparing",
    deliveryStatus: "PendingDelivery",
    createdAt: "2026-08-01T00:00:00Z",
    ...overrides,
  } as SubscriptionPaymentDto;
}

describe("isPaymentCancelable", () => {
  it("결제완료 + 배송준비중 → 취소 가능", () => {
    expect(isPaymentCancelable(payment({}))).toBe(true);
  });

  it("결제완료 + 배송중 → 취소 불가 (기존 버그: !== DeliveryCompleted 는 이걸 통과시켰음)", () => {
    expect(isPaymentCancelable(payment({ deliveryStatus: "DeliveryInProgress" }))).toBe(false);
  });

  it("결제완료 + 배송완료 → 취소 불가", () => {
    expect(isPaymentCancelable(payment({ deliveryStatus: "DeliveryCompleted" }))).toBe(false);
  });

  it("배송준비중이어도 결제가 완료되지 않았으면 취소 불가", () => {
    expect(isPaymentCancelable(payment({ status: "pending" }))).toBe(false);
    expect(isPaymentCancelable(payment({ status: "failed" }))).toBe(false);
  });

  it("이미 환불된 건은 취소 불가", () => {
    expect(isPaymentCancelable(payment({ status: "refunded" }))).toBe(false);
  });

  it("deliveryStatus가 없으면 취소 불가", () => {
    expect(isPaymentCancelable(payment({ deliveryStatus: undefined }))).toBe(false);
  });
});
