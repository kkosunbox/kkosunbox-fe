import { describe, expect, it } from "vitest";
import type { BillingInfo } from "@/features/billing/api/types";
import {
  formatCardLabel,
  getCardName,
  getCardTypeLabel,
  getLastFourDigits,
} from "@/features/billing/lib/formatBillingLabel";

function billing(overrides: Partial<BillingInfo> = {}): BillingInfo {
  return {
    id: 2,
    userId: 1,
    lastFourDigits: "2801",
    cardCompany: "신한",
    cardType: "신용",
    ownerType: "개인",
    authenticatedAt: "2026-07-27T02:46:22.325Z",
    isActive: true,
    createdAt: "2026-07-27T02:46:22.325Z",
    ...overrides,
  };
}

describe("getCardName", () => {
  it("실제 카드사명이 있으면 그대로 쓴다", () => {
    expect(getCardName(billing())).toBe("신한");
  });

  it("카드사명이 null이면 카드 타입으로 대체한다", () => {
    expect(getCardName(billing({ cardCompany: null }))).toBe("신용카드");
    expect(getCardName(billing({ cardCompany: null, cardType: "체크" }))).toBe("체크카드");
  });

  it("테스트 환경 더미 카드사명(모의카드)은 카드 타입으로 대체한다", () => {
    expect(getCardName(billing({ cardCompany: "모의카드" }))).toBe("신용카드");
  });

  it("카드사명·카드 타입이 모두 없으면 중립 라벨을 쓴다", () => {
    expect(getCardName(billing({ cardCompany: null, cardType: null }))).toBe("카드");
  });

  it("알 수 없는 카드 타입도 중립 라벨로 떨어뜨린다", () => {
    expect(getCardName(billing({ cardCompany: null, cardType: "미확인" }))).toBe("카드");
  });
});

describe("getCardTypeLabel", () => {
  it("신용/체크/기프트를 라벨로 변환한다", () => {
    expect(getCardTypeLabel(billing({ cardType: "신용" }))).toBe("신용카드");
    expect(getCardTypeLabel(billing({ cardType: "체크" }))).toBe("체크카드");
    expect(getCardTypeLabel(billing({ cardType: "기프트" }))).toBe("기프트카드");
  });
});

describe("getLastFourDigits", () => {
  it("값이 없으면 마스킹 문자를 쓴다", () => {
    expect(getLastFourDigits(billing({ lastFourDigits: null }))).toBe("****");
    expect(getLastFourDigits(billing({ lastFourDigits: "  " }))).toBe("****");
  });

  it("백엔드가 마스킹한 형태(280*)도 그대로 표시한다", () => {
    expect(getLastFourDigits(billing({ lastFourDigits: "280*" }))).toBe("280*");
  });
});

describe("formatCardLabel", () => {
  it("어떤 필드가 비어도 'null'을 노출하지 않는다", () => {
    expect(formatCardLabel(billing({ cardCompany: null, lastFourDigits: null }))).toBe(
      "신용카드 (****-****-****-****)",
    );
  });

  it("실제 로그로 확인된 응답(cardCompany null, lastFourDigits 280*)을 표시한다", () => {
    expect(formatCardLabel(billing({ cardCompany: null, lastFourDigits: "280*" }))).toBe(
      "신용카드 (****-****-****-280*)",
    );
  });
});
