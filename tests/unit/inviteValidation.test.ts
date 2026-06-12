import { describe, it, expect } from "vitest";
import { ApiError } from "@/shared/lib/api/types";
import {
  isStaleValidationRequest,
  resolveReferralValidationFailure,
  resolveReferralValidationSuccess,
} from "@/features/order";

describe("isStaleValidationRequest", () => {
  it("requestId가 최신이 아니면 stale", () => {
    expect(isStaleValidationRequest(1, 2)).toBe(true);
    expect(isStaleValidationRequest(2, 2)).toBe(false);
  });
});

describe("resolveReferralValidationSuccess", () => {
  it("isApplicable=true → applicable + discountRate", () => {
    expect(resolveReferralValidationSuccess({ isApplicable: true, discountRate: 0.1 })).toEqual({
      status: "applicable",
      blockedMsg: null,
      discountRate: 0.1,
    });
  });

  it("isApplicable=false → blocked", () => {
    expect(resolveReferralValidationSuccess({ isApplicable: false, discountRate: 0 })).toEqual({
      status: "blocked",
      blockedMsg: null,
      discountRate: 0,
    });
  });
});

describe("resolveReferralValidationFailure", () => {
  it("ApiError → blocked + 한국어 메시지", () => {
    const outcome = resolveReferralValidationFailure(
      new ApiError(400, "REFERRAL_CODE_INVALID", "raw"),
    );
    expect(outcome.status).toBe("blocked");
    expect(outcome.blockedMsg).toBe("사용할 수 없는 코드입니다.");
    expect(outcome.discountRate).toBe(0);
  });

  it("네트워크 등 기타 오류 → networkError", () => {
    expect(resolveReferralValidationFailure(new Error("network"))).toEqual({
      status: "networkError",
      blockedMsg: null,
      discountRate: 0,
    });
  });
});
