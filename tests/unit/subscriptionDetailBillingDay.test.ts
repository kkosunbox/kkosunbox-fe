import { describe, expect, it } from "vitest";
import { formatKoreanDate } from "@/widgets/mypage/ui/subscription-detail/helpers";

describe("formatKoreanDate", () => {
  it("YYYY-MM-DD를 YYYY년 M월 D일 형식으로 포맷한다", () => {
    expect(formatKoreanDate("2026-08-15")).toBe("2026년 8월 15일");
  });

  it("date-time 문자열이 와도 날짜 부분만 사용한다", () => {
    expect(formatKoreanDate("2026-08-05T00:00:00.000Z")).toBe("2026년 8월 5일");
  });
});
