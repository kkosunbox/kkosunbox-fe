import { describe, it, expect } from "vitest";
import { computeCenteredPosition } from "@/shared/lib/popup";

describe("computeCenteredPosition", () => {
  it("주모니터에 있는 창 → 창 중앙에 위치", () => {
    // 1920×1080 창, 480×700 팝업
    const p = computeCenteredPosition({
      dualLeft: 0,
      dualTop: 0,
      viewWidth: 1920,
      viewHeight: 1080,
      width: 480,
      height: 700,
    });
    expect(p).toEqual({ left: 720, top: 190 });
  });

  it("보조 모니터에 있는 창 → 그 모니터 안에서 중앙 (screen 기준으로 계산하면 주모니터로 날아감)", () => {
    const p = computeCenteredPosition({
      dualLeft: 1920, // 오른쪽 보조 모니터
      dualTop: 0,
      viewWidth: 1280,
      viewHeight: 1024,
      width: 480,
      height: 700,
    });
    expect(p.left).toBe(1920 + 400);
    expect(p.top).toBe(162);
  });

  // 실제 사용자 환경에서 발견된 회귀 — 왼쪽에 놓인 보조 모니터는 availLeft가 -1920이다.
  // 0으로 클램프하면 팝업이 주모니터 왼쪽 끝으로 튀어나간다.
  it("주모니터 왼쪽에 놓인 모니터(음수 좌표) → 음수 좌표를 그대로 유지", () => {
    const p = computeCenteredPosition({
      dualLeft: -1920,
      dualTop: 54,
      viewWidth: 1920,
      viewHeight: 1032,
      width: 500,
      height: 600,
    });
    expect(p).toEqual({ left: -1210, top: 270 });
  });

  it("위쪽에 놓인 모니터(음수 top)도 그대로 유지", () => {
    const p = computeCenteredPosition({
      dualLeft: 0,
      dualTop: -1080,
      viewWidth: 1920,
      viewHeight: 1080,
      width: 500,
      height: 600,
    });
    expect(p.top).toBe(-840);
  });

  it("창보다 큰 팝업 → 창 좌상단보다 살짝 바깥으로 계산 (브라우저가 화면 안으로 보정)", () => {
    const p = computeCenteredPosition({
      dualLeft: 0,
      dualTop: 0,
      viewWidth: 400,
      viewHeight: 500,
      width: 650,
      height: 700,
    });
    expect(p).toEqual({ left: -125, top: -100 });
  });

  it("화면(작업표시줄 제외) 기준 중앙 — 창 크기를 못 읽을 때 쓰는 폴백 경로", () => {
    // 1920×1080 화면, 작업표시줄 48px → availHeight 1032. Daum 팝업 500×500 기준.
    const p = computeCenteredPosition({
      dualLeft: 0,
      dualTop: 0,
      viewWidth: 1920,
      viewHeight: 1032,
      width: 500,
      height: 500,
    });
    expect(p).toEqual({ left: 710, top: 266 });
  });

  it("소수점 좌표는 반올림", () => {
    const p = computeCenteredPosition({
      dualLeft: 0,
      dualTop: 0,
      viewWidth: 1001,
      viewHeight: 1001,
      width: 500,
      height: 500,
    });
    expect(Number.isInteger(p.left)).toBe(true);
    expect(Number.isInteger(p.top)).toBe(true);
    expect(p.left).toBe(251);
  });
});
