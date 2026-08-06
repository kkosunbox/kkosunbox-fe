import { describe, it, expect } from "vitest";
import {
  getSubscriptionDisplayBucket,
  isScheduledSubscription,
} from "@/features/subscription/lib/subscriptionDisplayBucket";
import type { SubscriptionStatus } from "@/features/subscription/api/types";

describe("getSubscriptionDisplayBucket", () => {
  it("active → active", () => {
    expect(getSubscriptionDisplayBucket("active")).toBe("active");
  });

  it("scheduled(시작 예약, 첫 결제 전) → active 취급", () => {
    expect(getSubscriptionDisplayBucket("scheduled")).toBe("active");
  });

  it.each<SubscriptionStatus>(["cancelled", "paymentFailed", "suspended"])(
    "%s → ended",
    (status) => {
      expect(getSubscriptionDisplayBucket(status)).toBe("ended");
    },
  );
});

describe("isScheduledSubscription", () => {
  it("scheduled만 true", () => {
    expect(isScheduledSubscription("scheduled")).toBe(true);
    expect(isScheduledSubscription("active")).toBe(false);
    expect(isScheduledSubscription("cancelled")).toBe(false);
  });
});
