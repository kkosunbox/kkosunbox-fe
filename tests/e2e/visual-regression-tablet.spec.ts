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

/**
 * next/image 기본값(loading="lazy")인 이미지는 fullPage 캡처(captureBeyondViewport)로는
 * 뷰포트에 "가까워지지" 않아 로드가 시작되지 않고, 캡처 도중 뒤늦게 도착하면 연속
 * 스크린샷 두 장이 서로 달라 "two consecutive stable screenshots" 실패가 난다
 * (home 갤러리 y≈2540, about 갤러리 y≈3315 구간에서 2026-09-10 실측). 캡처 전에 전부
 * eager로 바꿔 로드를 강제하고 load/error 완료까지 기다린다 — 시간이 아니라 이벤트를
 * 기다리므로 타이밍이 개입하지 않는다.
 */
async function loadLazyImages(page: Page) {
  await page.evaluate(async () => {
    // 이미 그려진 이미지는 절대 건드리지 않는다. loading 속성을 바꾸면 HTML 규격상
    // "update the image data"가 다시 돌아 현재 요청이 버려지고, 멀쩡하던 그림이 잠시
    // 사라졌다가 다시 로드된다. 그 공백에 캡처가 들어가면 통째로 백지로 찍힌다.
    const pending = Array.from(document.images).filter(
      (img) => img.loading === "lazy" && !img.complete,
    );
    for (const img of pending) img.loading = "eager";
    await Promise.all(
      pending.map((img) => {
        // src가 아직 없는 <img>는 load/error가 영영 오지 않으므로 기다리지 않는다.
        if (!img.getAttribute("src") && !img.getAttribute("srcset")) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        });
      }),
    );
  });
  // eager 전환으로 새로 시작된 요청(next/image 최적화 응답 포함)까지 끝났는지 확인한다.
  await page.waitForLoadState("networkidle");
}

async function waitForStableRender(page: Page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await freezeVideos(page);
  await loadLazyImages(page);
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
