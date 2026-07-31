import type { Page } from "@playwright/test";
import { test, expect } from "../helpers/fixtures";

/**
 * 태블릿 구간(768–1199px) 시각회귀 baseline.
 * 로그인/주문 상태가 필요 없는 공개 경로만 대상으로 한다(로그인·주문 흐름은 별도 스펙에서 다룸).
 * 3개 프로젝트(tablet-768/1024/1199, playwright.config.ts)로 각각 실행된다.
 */

async function waitForStableRender(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
}

const PUBLIC_ROUTES: Array<{ name: string; path: string }> = [
  { name: "home", path: "/" },
  { name: "about", path: "/about" },
  { name: "subscribe-anonymous", path: "/subscribe" },
  { name: "support", path: "/support" },
  { name: "privacy", path: "/privacy" },
  { name: "terms", path: "/terms" },
  { name: "shop", path: "/shop" },
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
