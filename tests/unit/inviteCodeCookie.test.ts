import { describe, it, expect } from "vitest";
import { isValidInviteCode } from "@/features/referral/lib";

describe("isValidInviteCode", () => {
  it("영숫자 코드는 유효", () => {
    expect(isValidInviteCode("A3KX8P2B")).toBe(true);
    expect(isValidInviteCode("FRIEND10")).toBe(true);
  });

  it("하이픈·언더스코어 허용", () => {
    expect(isValidInviteCode("abc-123")).toBe(true);
    expect(isValidInviteCode("abc_123")).toBe(true);
  });

  it("빈 문자열은 무효", () => {
    expect(isValidInviteCode("")).toBe(false);
  });

  it("64자는 유효, 65자는 무효 (길이 경계)", () => {
    expect(isValidInviteCode("a".repeat(64))).toBe(true);
    expect(isValidInviteCode("a".repeat(65))).toBe(false);
  });

  it("공백·특수문자는 무효 (쿠키 인젝션 방지)", () => {
    expect(isValidInviteCode("bad code")).toBe(false);
    expect(isValidInviteCode("code;inject")).toBe(false);
    expect(isValidInviteCode("코드")).toBe(false);
    expect(isValidInviteCode("a=b")).toBe(false);
  });
});
