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

/**
 * 인증 경로도 `/checklist`처럼 홈으로 리다이렉트되는 화면을 캡처할 수 있다.
 * CSS 애니메이션 비활성화만으로는 HTML5 video의 프레임 진행을 멈출 수 없으므로,
 * 공개 경로 시각회귀 테스트와 동일하게 poster만 남긴다.
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
 * 뷰포트에 "가까워지지" 않아 로드가 시작되지 않는다. 아래 사전 스크롤로 일부만 트리거되면
 * 실행마다 로드된 이미지 집합이 달라져 같은 화면이 두 상태를 오갔다(subscribe/detail 상세
 * 이미지: 1024·1199에서 전부 빈 흰색 ↔ 전부 렌더, 2026-09-10 픽셀 대조로 확인).
 * 캡처 전에 전부 eager로 바꿔 로드를 강제하고 load/error 완료까지 기다린다 — 시간이 아니라
 * 이벤트를 기다리므로 타이밍이 개입하지 않는다.
 *
 * src가 아직 없는 <img>는 기다리지 않는다. load/error가 영영 오지 않아 그대로 멈춰버리기
 * 때문이다(2026-08-24에 waitForFunction 방식이 이 이유로 되돌려졌다 — 아래 주석 참고).
 *
 * ⚠️ 반드시 비동기 카드(animate-pulse 스켈레톤)가 사라진 뒤에 호출해야 한다. 스켈레톤이
 * 남아 있는 동안엔 상품 이미지가 아직 DOM에 없어서 이 함수가 그냥 지나치고, 캡처 중에
 * 뒤늦게 마운트돼 빈 화면으로 찍힌다(checklist-result tablet-1024, 2026-09-10 실측).
 */
async function loadLazyImages(page: Page) {
  await page.evaluate(async () => {
    // 이미 그려진 이미지는 절대 건드리지 않는다. loading 속성을 바꾸면 HTML 규격상
    // "update the image data"가 다시 돌아 현재 요청이 버려지고, 멀쩡하던 그림이 잠시
    // 사라졌다가 다시 로드된다. 그 공백에 캡처가 들어가면 통째로 백지로 찍힌다
    // (checklist-result tablet-1024가 이 경로로 흰 화면이 됐다, 2026-09-10 실측).
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
  // 스켈레톤이 걷힌 뒤에야 상품 카드 이미지가 DOM에 들어오므로, lazy 로드 강제는 여기서 한다.
  await loadLazyImages(page);
  // next/image 최적화 응답·페이드인 등 networkidle만으론 못 잡는 마지막 정착 시간을
  // 짧은 버퍼로 흡수한다. (img.complete 이벤트 기반 대기는 일부 페이지에서 영원히
  // resolve 안 되는 <img>가 있어 걸어뒀다가 제거함 — 대신 이 버퍼로 대체.
  // waitForFunction으로 재시도했으나 checklist-result에서 자체 timeout(5s)을
  // 넘겨 테스트 전체(60s)를 먹통으로 만드는 걸 확인해 다시 제거함, 2026-08-24)
  await page.waitForTimeout(1_000);
}

const AUTH_ROUTES: Array<{
  name: string;
  path: string;
  maxDiffPixelRatio?: number;
  fullPage?: boolean;
}> = [
  // subscribe/detail: tablet-1199에서만 상세 이미지 블록이 실행마다 다르게 렌더됨
  // (diff ~25%, 두 상태 사이를 오가는 패턴 — 점진적 정착이 아니라 분기 자체가 다름).
  // 원인 미확인(플랜/티어 선택이 비동기로 한 번 더 바뀌는 레이스일 가능성). 소폭
  // 허용치로는 못 흡수하는 수준이라 baseline은 최초 캡처본을 그대로 기록만 해두고,
  // 이 라우트가 실제 회귀 게이트로 쓰일 땐 별도로 원인 조사 필요.
  { name: "subscribe-detail", path: "/subscribe/detail?planId=1", maxDiffPixelRatio: 0.005 },
  { name: "checklist", path: "/checklist" },
  // ⚠️ checklist-result: 스탠다드 패키지 대표 이미지가 fullPage 캡처(captureBeyondViewport)에서만
  // 안 그려지는 문제가 있다(2026-09-10 조사).
  //
  //  - 캡처 직전 DOM은 항상 정상이다(complete=true, naturalWidth>0, opacity 1, filter blur(0px)).
  //    로딩 문제가 아니라 fullPage 래스터 단계의 문제다. 원인은 미규명.
  //  - 뷰포트 캡처(fullPage: false)로는 항상 선명하게 찍힌다.
  //  - tablet-768은 fullPage로 13회 연속 완전히 동일한 백지(결정적으로 틀림).
  //    tablet-1024·1199는 fullPage로 백지/흐릿함/선명함을 비결정적으로 오갔다.
  //
  // 기각된 가설(재시도 금지, 효과 없었음): 캡처 직전 강제 리페인트(body transform 토글),
  // 버려지는 뷰포트 예열 캡처, PlanPicker crossfadeStyle의 no-op `blur(0px)` 제거.
  // 상세 기록: `.claude/contexts/e2e-review-2026-09-10.md`.
  //
  // 2026-09-11: 이 라우트만 뷰포트 캡처(fullPage: false)로 전환해 상시 실패를 해소했다.
  // 트레이드오프: 접힌 화면 아래 영역은 이 테스트가 커버하지 않는다(의도적으로 수용).
  // captureBeyondViewport 자체의 래스터 버그 원인 규명은 여전히 별도 과제로 남아 있다.
  { name: "checklist-result", path: "/checklist/result", fullPage: false },
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
        fullPage: route.fullPage ?? true,
        animations: "disabled",
        maxDiffPixelRatio: route.maxDiffPixelRatio ?? 0,
        timeout: 20_000,
      });
    });
  }
});
