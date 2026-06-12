import { describe, it, expect } from "vitest";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { ApiError } from "@/shared/lib/api/types";

const apiError = (code: string) => new ApiError(400, code, "raw backend message");

describe("getErrorMessage — 레퍼럴(초대코드) 에러 매핑", () => {
  it("코드 레벨 에러 4종은 모두 '사용할 수 없는 코드입니다.'로 통일", () => {
    for (const code of [
      "REFERRAL_CODE_INVALID",
      "REFERRAL_SELF_REFERRAL",
      "REFERRAL_NOT_INFLUENCER",
      "REFERRAL_CONTRACT_EXPIRED",
    ]) {
      expect(getErrorMessage(apiError(code))).toBe("사용할 수 없는 코드입니다.");
    }
  });

  it("첫 구독 아님은 별도 문구", () => {
    expect(getErrorMessage(apiError("REFERRAL_NOT_FIRST_SUBSCRIPTION"))).toBe(
      "첫 구독 시에만 사용 가능합니다.",
    );
  });

  it("매핑 없는 코드는 fallback 반환 (백엔드 원문 비노출)", () => {
    expect(getErrorMessage(apiError("UNKNOWN_REFERRAL_CODE"), "사용할 수 없는 코드입니다.")).toBe(
      "사용할 수 없는 코드입니다.",
    );
  });

  it("ApiError가 아니면 fallback 반환", () => {
    expect(getErrorMessage(new Error("network"), "기본 메시지")).toBe("기본 메시지");
  });
});
