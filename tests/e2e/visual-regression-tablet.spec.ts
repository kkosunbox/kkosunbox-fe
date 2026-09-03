import type { Page } from "@playwright/test";
import { test, expect } from "../helpers/fixtures";

/**
 * 태블릿 구간(768–1199px) 시각회귀 baseline.
 * 로그인/주문 상태가 필요 없는 공개 경로만 대상으로 한다(로그인·주문 흐름은 별도 스펙에서 다룸).
 * 3개 프로젝트(tablet-768/1024/1199, playwright.config.ts)로 각각 실행된다.
 */

/**
 * hero 영상(widgets/home/hero/ui/HeroSection.tsx)은 캡처 시점의 재생 위치가 실행마다 달라
 * `maxDiffPixelRatio: 0` 비교를 반드시 깨뜨린다. `animations: "disabled"`는 CSS 애니메이션·트랜지션만
 * 끄고 HTML5 video 재생은 막지 못하므로 여기서 직접 정지시킨다.
 *
 * 숨기기만 해도 되는 이유: video 바로 아래에 poster `<img>`가 같은 위치(`absolute inset-0`)·같은
 * `object-cover object-center`로 항상 깔려 있고, 그 poster가 영상의 첫 프레임이다. 따라서 hero의 구도는
 * 유지된 채 영상 프레임의 랜덤성만 빠진다. 그라디언트 오버레이·헤딩·CTA는 video 위에 얹힌 별개
 * 엘리먼트라 그대로 검증된다.
 *
 * mask 옵션을 쓰지 않는 이유: video가 `absolute inset-0`이라 bounding box가 hero 전체(100svh)다.
 * 마스킹하면 그 위의 오버레이·헤딩·CTA까지 통째로 가려진다.
 */
async function freezeVideos(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll("video").forEach((video) => {
      video.pause();
      video.style.display = "none";
    });
  });
}

async function waitForStableRender(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await freezeVideos(page);
}

const PUBLIC_ROUTES: Array<{ name: string; path: string }> = [
  { name: "home", path: "/" },
  { name: "about", path: "/about" },
  { name: "subscribe-anonymous", path: "/subscribe" },
  { name: "support", path: "/support" },
  { name: "privacy", path: "/privacy" },
  { name: "terms", path: "/terms" },
  { name: "purchase", path: "/purchase" },
  { name: "purchase-detail-basic", path: "/purchase/detail?tier=basic" },
  { name: "purchase-detail-standard", path: "/purchase/detail?tier=standard" },
  { name: "purchase-detail-premium", path: "/purchase/detail?tier=premium" },
  { name: "login", path: "/login" },
  { name: "register", path: "/register" },
  { name: "forgot-password", path: "/forgot-password" },
];

test.describe("태블릿 시각회귀 baseline — 공개 경로", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.name} (${route.path})`, async ({ page }) => {
      await page.goto(route.path);
      await waitForStableRender(page);

      await expect(page).toHaveScreenshot(`${route.name}.png`, {
        fullPage: true,
        animations: "disabled",
        maxDiffPixelRatio: 0,
      });
    });
  }
});
