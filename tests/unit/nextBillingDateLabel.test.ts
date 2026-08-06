import { describe, it, expect } from "vitest";
import { getNextBillingDateLabel } from "@/features/subscription/lib/nextBillingDateLabel";

describe("getNextBillingDateLabel", () => {
  it("오늘 이후 날짜 → YYYY.MM.DD 그대로", () => {
    expect(getNextBillingDateLabel("2026-08-30", "2026-08-06")).toBe("2026.08.30");
  });

  it("오늘 날짜 → YYYY.MM.DD 그대로(과거 취급 안 함)", () => {
    expect(getNextBillingDateLabel("2026-08-06", "2026-08-06")).toBe("2026.08.06");
  });

  it("오늘보다 과거 → 매달 N일로 대체", () => {
    expect(getNextBillingDateLabel("2026-04-16", "2026-08-06")).toBe("매달 16일");
  });

  it("null → '-'", () => {
    expect(getNextBillingDateLabel(null, "2026-08-06")).toBe("-");
  });

  it("형식이 깨진 문자열 → '-'", () => {
    expect(getNextBillingDateLabel("not-a-date", "2026-08-06")).toBe("-");
  });
});
