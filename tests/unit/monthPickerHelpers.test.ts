import { describe, expect, it, vi } from "vitest";
import { shouldCloseMonthPicker } from "@/widgets/mypage/ui/point-history/monthPickerHelpers";

function boundary({ visible, contains }: { visible: boolean; contains: boolean }) {
  return {
    getClientRects: vi.fn(() => ({ length: visible ? 1 : 0 })),
    contains: vi.fn(() => contains),
  };
}

describe("shouldCloseMonthPicker", () => {
  const target = {} as Node;

  it("보이는 picker 내부 클릭이면 닫지 않는다", () => {
    expect(shouldCloseMonthPicker(boundary({ visible: true, contains: true }), target)).toBe(false);
  });

  it("보이는 picker 바깥 클릭이면 닫는다", () => {
    expect(shouldCloseMonthPicker(boundary({ visible: true, contains: false }), target)).toBe(true);
  });

  it("CSS로 숨겨진 반대쪽 배너는 닫기 판정을 하지 않는다", () => {
    expect(shouldCloseMonthPicker(boundary({ visible: false, contains: false }), target)).toBe(false);
  });

  it("배너 ref가 아직 없으면 닫지 않는다", () => {
    expect(shouldCloseMonthPicker(null, target)).toBe(false);
  });
});
