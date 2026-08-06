import { describe, it, expect } from "vitest";
import { computeStartDateRange, formatDateToYMD } from "@/features/order";

describe("computeStartDateRange", () => {
  it("오늘이 8월 6일 → 최소 8월 7일, 최대 9월 30일", () => {
    const { minDate, maxDate } = computeStartDateRange(new Date(2026, 7, 6));
    expect(formatDateToYMD(minDate)).toBe("2026-08-07");
    expect(formatDateToYMD(maxDate)).toBe("2026-09-30");
  });

  it("월말(8월 31일) 기준 → 최소 9월 1일, 최대 9월 30일", () => {
    const { minDate, maxDate } = computeStartDateRange(new Date(2026, 7, 31));
    expect(formatDateToYMD(minDate)).toBe("2026-09-01");
    expect(formatDateToYMD(maxDate)).toBe("2026-09-30");
  });

  it("연말(12월 20일) 기준 → 연도 경계를 넘어 다음 해 1월 말일까지", () => {
    const { minDate, maxDate } = computeStartDateRange(new Date(2026, 11, 20));
    expect(formatDateToYMD(minDate)).toBe("2026-12-21");
    expect(formatDateToYMD(maxDate)).toBe("2027-01-31");
  });
});

describe("formatDateToYMD", () => {
  it("Date를 YYYY-MM-DD로 변환한다", () => {
    expect(formatDateToYMD(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
