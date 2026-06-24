/**
 * 에러 바운더리 시각 검증
 *
 * mock API 서버에 특정 경로를 500 에러로 주입한 뒤 페이지를 리로드하여
 * 각 에러 바운더리(카드 단위 / 라우트 단위)가 실제로 동작하는지 확인한다.
 *
 * 스크린샷은 tests/e2e/screenshots/error-boundaries/ 에 저장된다.
 * 테스트를 실행한 뒤 스크린샷을 직접 열어 레이아웃·메시지를 확인한다.
 *
 * 실행: pnpm test tests/e2e/error-boundaries.spec.ts
 */
import { test } from "@playwright/test";
import type { Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import { loginAndGoTo } from "../helpers/auth";

const MOCK_API = "http://localhost:3099";
const SCREENSHOTS_DIR = path.join(__dirname, "screenshots", "error-boundaries");

// ── 헬퍼 ──────────────────────────────────────────────────────────────────────

/** mock API 서버에서 지정 경로를 500 에러로 주입 */
async function injectErrors(endpoints: string[]) {
  await fetch(`${MOCK_API}/v1/__test/fail`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoints }),
  });
}

/** 주입된 에러 경로 전체 해제 */
async function clearErrors() {
  await fetch(`${MOCK_API}/v1/__test/fail`, { method: "DELETE" });
}

/** 페이지 스크린샷 저장 (항상 실행됨) */
async function snap(page: Page, filename: string) {
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, filename),
    fullPage: true,
  });
}

/** 페이지 이동 후 모든 네트워크 요청이 끝날 때까지 대기 */
async function goAndSettle(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
}

// ── 공통 설정 ─────────────────────────────────────────────────────────────────

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
});

test.afterEach(async () => {
  // 다음 테스트에 영향을 주지 않도록 주입된 에러 경로를 항상 초기화
  await clearErrors();
});

// ── 마이페이지 ────────────────────────────────────────────────────────────────

test.describe("마이페이지 (/mypage)", () => {
  test("00 - 정상 상태 (베이스라인)", async ({ page }) => {
    await loginAndGoTo(page, "/mypage");
    await page.waitForLoadState("networkidle");
    await snap(page, "mypage-00-baseline.png");
  });

  test("01 - 결제관리 카드 API 실패 → 카드 에러 폴백 + 나머지 카드 정상", async ({ page }) => {
    await loginAndGoTo(page, "/mypage");
    await page.waitForLoadState("networkidle");

    await injectErrors(["/v1/billing"]);
    await page.reload();
    await page.waitForLoadState("networkidle");

    await snap(page, "mypage-01-billing-error.png");
  });

  test("02 - 구독카드 API 실패 → 카드 에러 폴백", async ({ page }) => {
    await loginAndGoTo(page, "/mypage");
    await page.waitForLoadState("networkidle");

    // /v1/subscriptions 는 SubscriptionCardLoader 와 PaymentCardLoader 가
    // 모두 사용하므로 두 카드가 함께 에러 폴백을 보일 수 있다
    await injectErrors(["/v1/subscriptions"]);
    await page.reload();
    await page.waitForLoadState("networkidle");

    await snap(page, "mypage-02-subscription-error.png");
  });

  test("03 - 프로필 섹션 API 실패 → 섹션 에러 폴백", async ({ page }) => {
    await loginAndGoTo(page, "/mypage");
    await page.waitForLoadState("networkidle");

    // ProfileProvider (클라이언트) 도 /v1/profiles 를 호출하므로
    // 카드 영역에도 영향이 있을 수 있다 — 스크린샷으로 확인
    await injectErrors(["/v1/profiles"]);
    await page.reload();
    await page.waitForLoadState("networkidle");

    await snap(page, "mypage-03-profile-error.png");
  });

  test("04 - 복수 API 실패 → 복수 카드 에러 폴백 (격리 확인)", async ({ page }) => {
    await loginAndGoTo(page, "/mypage");
    await page.waitForLoadState("networkidle");

    await injectErrors(["/v1/billing", "/v1/subscriptions"]);
    await page.reload();
    await page.waitForLoadState("networkidle");

    // 배송관리·문의관리 카드는 정상이어야 함 — 스크린샷으로 확인
    await snap(page, "mypage-04-multiple-cards-error.png");
  });

  test("05 - 전체 카드 API 실패 → error.tsx 또는 개별 폴백", async ({ page }) => {
    await loginAndGoTo(page, "/mypage");
    await page.waitForLoadState("networkidle");

    await injectErrors(["/v1/profiles", "/v1/subscriptions", "/v1/billing"]);
    await page.reload();
    await page.waitForLoadState("networkidle");

    await snap(page, "mypage-05-all-error.png");
  });
});

// ── 구독 플랜 페이지 (/subscribe) ─────────────────────────────────────────────

test.describe("구독 플랜 (/subscribe)", () => {
  test("06 - 정상 상태 (베이스라인)", async ({ page }) => {
    await loginAndGoTo(page, "/subscribe");
    await page.waitForLoadState("networkidle");
    await snap(page, "subscribe-06-baseline.png");
  });

  test("07 - 플랜 API 실패 → route-level error.tsx 또는 재시도 UI", async ({ page }) => {
    await loginAndGoTo(page, "/subscribe");
    await page.waitForLoadState("networkidle");

    // plans 는 .catch(() => []) 처리 여부에 따라 결과가 다름:
    //   - catch 없음 → error.tsx 표시 ("구독 플랜 정보를 불러오지 못했습니다.")
    //   - catch 있음 → 빈 배열 폴백 UI 표시
    await injectErrors(["/v1/subscriptions/plans"]);
    await page.reload();
    await page.waitForLoadState("networkidle");

    await snap(page, "subscribe-07-plans-error.png");
  });
});

// ── 주문 페이지 (/order) ──────────────────────────────────────────────────────

test.describe("주문 (/order?planId=1)", () => {
  test("08 - 정상 상태 (베이스라인)", async ({ page }) => {
    await loginAndGoTo(page, "/order?planId=1");
    await page.waitForLoadState("networkidle");
    await snap(page, "order-08-baseline.png");
  });

  test("09 - 플랜 API 실패 → route-level error.tsx (구독 플랜으로 링크 포함)", async ({ page }) => {
    await loginAndGoTo(page, "/order?planId=1");
    await page.waitForLoadState("networkidle");

    await injectErrors(["/v1/subscriptions/plans"]);
    await page.reload();
    await page.waitForLoadState("networkidle");

    await snap(page, "order-09-plans-error.png");
  });

  test("10 - 결제수단 API 실패 → route-level error.tsx", async ({ page }) => {
    await loginAndGoTo(page, "/order?planId=1");
    await page.waitForLoadState("networkidle");

    await injectErrors(["/v1/billing"]);
    await page.reload();
    await page.waitForLoadState("networkidle");

    await snap(page, "order-10-billing-error.png");
  });
});
