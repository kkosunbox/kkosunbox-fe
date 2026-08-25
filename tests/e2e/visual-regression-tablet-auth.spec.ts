import type { Page } from "@playwright/test";
import { test, expect } from "../helpers/fixtures";
import { loginByTokens, TEST_TOKENS } from "../helpers/auth";

/**
 * 태블릿 구간(768–1199px) 시각회귀 baseline — 로그인 필요 경로.
 * 구독 이력이 있는 정상 계정(TEST_TOKENS) 1종만 대상으로 한다.
 * 주문/결제 플로우(order, purchase/order, shop/order, payment/*, success/fail)는
 * 로그인만으론 재현되지 않는 별도 상태라 이번 범위에서 제외.
 * 3개 프로젝트(tablet-768/1024/1199, playwright.config.ts)로 각각 실행된다.
 */

async function waitForStableRender(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  // fullPage 스크린샷이 스크롤을 유발하며 lazy 이미지를 그 시점에 로드시켜
  // 캡처 중간에 레이아웃이 바뀌는 걸 방지 — 미리 끝까지 스크롤해 로드를 끝내둔다.
  // (subscribe/detail 등 상세 이미지가 많은 페이지에서 확인된 케이스, 관련: .claude/contexts/visual-regression-testing.md)
  await page.evaluate(async () => {
    const distance = window.innerHeight;
    const scrollHeight = () => document.body.scrollHeight;
    let y = 0;
    while (y < scrollHeight()) {
      window.scrollTo(0, y);
      y += distance;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  // checklist-result 등 카드가 비동기 데이터(cardReady) 로딩 중엔 animate-pulse
  // 스켈레톤을 렌더하는데, networkidle만으론 이 전환을 못 잡아 스켈레톤 상태 그대로
  // 캡처되는 레이스가 있었다. 스켈레톤이 사라질 때까지 명시적으로 기다린다.
  await page.waitForSelector(".animate-pulse", { state: "detached", timeout: 5_000 });
  // next/image 최적화 응답·페이드인 등 networkidle만으론 못 잡는 마지막 정착 시간을
  // 짧은 버퍼로 흡수한다. (img.complete 이벤트 기반 대기는 일부 페이지에서 영원히
  // resolve 안 되는 <img>가 있어 걸어뒀다가 제거함 — 대신 이 버퍼로 대체.
  // waitForFunction으로 재시도했으나 checklist-result에서 자체 timeout(5s)을
  // 넘겨 테스트 전체(60s)를 먹통으로 만드는 걸 확인해 다시 제거함, 2026-08-24)
  await page.waitForTimeout(1_000);
}

const AUTH_ROUTES: Array<{ name: string; path: string; maxDiffPixelRatio?: number }> = [
  // subscribe/detail: tablet-1199에서만 상세 이미지 블록이 실행마다 다르게 렌더됨
  // (diff ~25%, 두 상태 사이를 오가는 패턴 — 점진적 정착이 아니라 분기 자체가 다름).
  // 원인 미확인(플랜/티어 선택이 비동기로 한 번 더 바뀌는 레이스일 가능성). 소폭
  // 허용치로는 못 흡수하는 수준이라 baseline은 최초 캡처본을 그대로 기록만 해두고,
  // 이 라우트가 실제 회귀 게이트로 쓰일 땐 별도로 원인 조사 필요.
  { name: "subscribe-detail", path: "/subscribe/detail?planId=1", maxDiffPixelRatio: 0.005 },
  { name: "checklist", path: "/checklist" },
  // checklist-result: tablet-768에서만 재현. 스탠다드 패키지 explain 이미지가
  // 캡처 시점에 빈 화면으로 찍힘(diff ~14%, 재실행해도 동일 픽셀 수로 재현).
  // next/image가 768px 전용 sizes 응답을 다른 폭보다 늦게 내려주는 것으로
  // 추정되나 확정은 아님. waitForFunction(img.complete)으로 명시 대기를 시도했다가
  // 자체 timeout(5s)을 못 지키고 테스트 전체를 먹통으로 만들어(위 waitForStableRender
  // 주석 참고) 되돌림 — 원인 조사는 실제 브라우저에서 별도로 필요.
  { name: "checklist-result", path: "/checklist/result" },
  { name: "inquiry", path: "/inquiry" },
  { name: "support-history", path: "/support/history" },
  { name: "address", path: "/address" },
  { name: "delivery", path: "/delivery" },
  { name: "mypage", path: "/mypage" },
  { name: "mypage-password", path: "/mypage/password" },
  { name: "mypage-point", path: "/mypage/point" },
  { name: "mypage-review-write", path: "/mypage/review/write" },
  { name: "mypage-subscription", path: "/mypage/subscription" },
  { name: "mypage-subscription-change", path: "/mypage/subscription/change" },
  { name: "mypage-subscription-detail", path: "/mypage/subscription/detail" },
  { name: "mypage-withdraw", path: "/mypage/withdraw" },
  { name: "mypage-purchase", path: "/mypage/purchase" },
];

test.describe("태블릿 시각회귀 baseline — 로그인 경로 (정상 계정)", () => {
  for (const route of AUTH_ROUTES) {
    test(`${route.name} (${route.path})`, async ({ page }, testInfo) => {
      testInfo.setTimeout(60_000);
      await loginByTokens(page, TEST_TOKENS);
      await page.goto(route.path);
      await waitForStableRender(page);

      await expect(page).toHaveScreenshot(`${route.name}.png`, {
        fullPage: true,
        animations: "disabled",
        maxDiffPixelRatio: route.maxDiffPixelRatio ?? 0,
        timeout: 20_000,
      });
    });
  }
});
