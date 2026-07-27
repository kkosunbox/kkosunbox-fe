import { describe, expect, it } from "vitest";
import {
  computeNextBillingDate,
  formatKoreanDate,
} from "@/widgets/mypage/ui/subscription-detail/helpers";

describe("computeNextBillingDate", () => {
  it("선택한 날짜가 오늘보다 늦으면(또는 같으면) 이번 달로 계산한다", () => {
    const from = new Date(2026, 6, 10); // 2026-07-10
    expect(computeNextBillingDate(15, from)).toEqual(new Date(2026, 6, 15));
    expect(computeNextBillingDate(10, from)).toEqual(new Date(2026, 6, 10));
  });

  it("선택한 날짜가 오늘보다 이르면 다음 달로 계산한다", () => {
    const from = new Date(2026, 6, 20); // 2026-07-20
    expect(computeNextBillingDate(15, from)).toEqual(new Date(2026, 7, 15));
  });

  it("연말에 다음 달로 넘어가면 연도가 바뀐다", () => {
    const from = new Date(2026, 11, 20); // 2026-12-20
    expect(computeNextBillingDate(5, from)).toEqual(new Date(2027, 0, 5));
  });
});

describe("formatKoreanDate", () => {
  it("YYYY년 M월 D일 형식으로 포맷한다", () => {
    expect(formatKoreanDate(new Date(2026, 7, 15))).toBe("2026년 8월 15일");
  });
});
