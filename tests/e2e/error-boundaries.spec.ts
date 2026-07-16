/**
 * API 실패 시 화면 거동 — 시각 회귀 (Visual Regression)
 *
 * mock API 서버에 특정 경로를 500으로 주입한 뒤 리로드하여, 각 화면이 실패를 어떻게
 * 처리하는지를 검증한다.
 *
 * ⚠️ 중요(2026-06-29 확인): 이 앱의 데이터 패칭 쿼리는 거의 전부 `.catch()`로 에러를
 * 흡수한다. 따라서 API 500은 "에러 바운더리(폴백 UI)"를 발동시키지 않고, 해당 영역이
 * 빈/기본 상태로 떨어지는 **graceful degradation**으로 귀결된다(페이지는 죽지 않음).
 * 이 스펙은 그 실제 거동(강등 + 격리 + 미크래시)을 고정한다. 에러 폴백 발동을 보려면
 * 쿼리의 .catch 제거 등 제품 변경이 필요하다(범위 밖).
 *
 * 두 겹으로 검증한다:
 *   1) 기능 단정 — 강등/격리/종착 URL 등 "무엇이 렌더되었는가"를 명시적으로 assert
 *   2) 시각 단정 — toHaveScreenshot()으로 baseline 대비 레이아웃 회귀를 자동 감지
 *
 * baseline 생성/갱신: pnpm test:e2e:update tests/e2e/error-boundaries.spec.ts
 *   → tests/e2e/error-boundaries.spec.ts-snapshots/ 에 {플랫폼}별로 저장된다.
 * ⚠️ 스크린샷은 OS·렌더링 환경에 민감하다. CI(예: Linux) 도입 시 그 환경에서 baseline을
 *    다시 생성해야 한다(Playwright가 파일명에 플랫폼 suffix를 붙여 분리 관리).
 */
import type { Page } from "@playwright/test";
import { test, expect } from "../helpers/fixtures";
import { loginAndGoTo } from "../helpers/auth";

const MOCK_API = "http://localhost:3099";

// 시각 회귀 공통 옵션. animations 비활성화 + 폰트/이미지 안정화는 toHaveScreenshot의
// 프레임 안정화 재시도와 함께 false-positive를 막는다. 1% 픽셀 허용으로 안티앨리어싱 흔들림 흡수.
const SNAPSHOT_OPTS = {
  fullPage: true,
  animations: "disabled",
  maxDiffPixelRatio: 0.01,
} as const;

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

/** 캡처 직전 웹폰트 로드 완료 대기 — FOUT로 인한 스냅샷 false-positive 방지 */
async function prepareForSnapshot(page: Page) {
  await page.evaluate(() => document.fonts.ready);
}

// ── 정착(settle) 대기 ──────────────────────────────────────────────────────────
// networkidle(공식 비권장·flaky)을 쓰지 않고, "무엇이 렌더되면 정착인지"를 페이지별
// 종착 상태에 근거해 결정적으로 기다린다.

const SETTLE_TIMEOUT = 15_000;

/**
 * 마이페이지는 카드별 Suspense(RSC 스트리밍) + 카드 단위 에러 바운더리 구조다.
 * 마지막 카드(문의)는 이 스펙에서 절대 에러를 주입하지 않으므로, 문의 빈 상태가 보이면
 * 그 위 카드(정상/에러 폴백 포함)의 스트리밍이 모두 끝났다는 신호다.
 * (ProfileProvider는 /v1/profiles 실패를 try/catch로 흡수하므로 트리가 죽지 않는다.)
 */
async function waitForMypageSettled(page: Page) {
  await expect(page.getByText("문의 내역이 없습니다.").first()).toBeVisible({
    timeout: SETTLE_TIMEOUT,
  });
}

/** 헤더 네비게이션(레이아웃의 영속 셸)이 보이면 SSR 페이지 렌더가 끝난 것으로 본다. */
async function waitForShell(page: Page) {
  await expect(page.getByRole("navigation").first()).toBeVisible({ timeout: SETTLE_TIMEOUT });
}

// ── 공통 설정 ─────────────────────────────────────────────────────────────────
// ChannelTalk 스크립트 차단은 tests/helpers/fixtures.ts의 공통 page 픽스처가 처리한다.

test.afterEach(async () => {
  // 다음 테스트에 영향을 주지 않도록 주입된 에러 경로를 항상 초기화
  await clearErrors();
});

// ── 마이페이지: 카드 graceful degradation ──────────────────────────────────────
// 마이페이지 카드 로더가 쓰는 서버 쿼리(fetchBillingInfo/fetchActiveSubscription/
// fetchSubscriptions/fetchEligiblePlans/fetchMyReviews/fetchInquiries/
// fetchDeliveryAddresses)는 모두 .catch()로 500을 흡수한다. 따라서 API 실패 시
// 카드 에러 폴백이 아니라 '빈 상태'로 강등되고 페이지는 죽지 않는다. 여기서는 그 불변식을
// 검증한다: 페이지 미크래시 + 주입하지 않은 카드(배송·문의)는 항상 정상(격리).
// (delivery·inquiry는 어떤 테스트에서도 주입하지 않으므로 격리 기준점으로 쓴다.)

test.describe("마이페이지 카드 graceful degradation (/mypage)", () => {
  /** 페이지가 죽지 않고, 주입 대상이 아닌 카드(배송·문의)가 정상임을 확인 */
  async function expectIsolatedAndAlive(page: Page) {
    await expect(page.getByText("배송관리")).toBeVisible();
    await expect(page.getByText("문의 내역이 없습니다.")).toBeVisible();
  }

  test("00 - 정상 상태 (베이스라인)", async ({ page }) => {
    await loginAndGoTo(page, "/mypage");
    await waitForMypageSettled(page);

    // 정상 상태에서는 활성 구독이 표시된다
    await expect(page.getByText("베이직 패키지 BOX 구독중")).toBeVisible();

    await prepareForSnapshot(page);
    await expect(page).toHaveScreenshot("mypage-00-baseline.png", SNAPSHOT_OPTS);
  });

  test("01 - 결제 API(/v1/billing) 실패 → 페이지 정상 + 무관 카드 유지", async ({ page }) => {
    await loginAndGoTo(page, "/mypage");
    await waitForMypageSettled(page);

    // mock의 /v1/billing 은 평소에도 빈 배열이라 결제 카드는 baseline과 사실상 동일하다.
    // 그래도 500 주입 시 fetchBillingInfo의 .catch로 페이지가 죽지 않음을 고정한다.
    await injectErrors(["/v1/billing"]);
    await page.reload();
    await waitForMypageSettled(page);

    await expectIsolatedAndAlive(page);

    await prepareForSnapshot(page);
    await expect(page).toHaveScreenshot("mypage-01-billing-error.png", SNAPSHOT_OPTS);
  });

  test("02 - 구독 API(/v1/subscriptions) 실패 → 구독 카드 빈 상태로 강등, 무관 카드 정상", async ({ page }) => {
    await loginAndGoTo(page, "/mypage");
    await waitForMypageSettled(page);

    // SubscriptionCardLoader·PaymentCardLoader 가 모두 /v1/subscriptions 를 쓰므로
    // 둘 다 빈 상태로 강등된다(에러 폴백 아님).
    await injectErrors(["/v1/subscriptions"]);
    await page.reload();
    await waitForMypageSettled(page);

    // 구독이 빈 상태로 강등 → 활성 구독 문구가 사라짐
    await expect(page.getByText("베이직 패키지 BOX 구독중")).toHaveCount(0);
    await expectIsolatedAndAlive(page);

    await prepareForSnapshot(page);
    await expect(page).toHaveScreenshot("mypage-02-subscription-error.png", SNAPSHOT_OPTS);
  });

  test("03 - 프로필 API(/v1/profiles) 실패 → 프로필 강등, 무관 카드 정상", async ({ page }) => {
    await loginAndGoTo(page, "/mypage");
    await waitForMypageSettled(page);

    // ProfileProvider(클라이언트)·SSR 모두 /v1/profiles 실패를 흡수한다(크래시 없음).
    await injectErrors(["/v1/profiles"]);
    await page.reload();
    await waitForMypageSettled(page);

    await expectIsolatedAndAlive(page);

    await prepareForSnapshot(page);
    await expect(page).toHaveScreenshot("mypage-03-profile-error.png", SNAPSHOT_OPTS);
  });

  test("04 - 결제+구독 API 실패 → 해당 카드 강등, 배송·문의 정상 (격리)", async ({ page }) => {
    await loginAndGoTo(page, "/mypage");
    await waitForMypageSettled(page);

    await injectErrors(["/v1/billing", "/v1/subscriptions"]);
    await page.reload();
    await waitForMypageSettled(page);

    await expect(page.getByText("베이직 패키지 BOX 구독중")).toHaveCount(0);
    await expectIsolatedAndAlive(page);

    await prepareForSnapshot(page);
    await expect(page).toHaveScreenshot("mypage-04-multiple-cards-error.png", SNAPSHOT_OPTS);
  });

  test("05 - 전체 데이터 API 실패 → 카드별 강등, 페이지 미크래시 (라우트 error.tsx 아님)", async ({ page }) => {
    await loginAndGoTo(page, "/mypage");
    await waitForMypageSettled(page);

    // 카드마다 쿼리가 .catch로 흡수하므로 라우트 error.tsx로 버블되지 않고 카드별로 강등된다.
    await injectErrors(["/v1/profiles", "/v1/subscriptions", "/v1/billing"]);
    await page.reload();
    await waitForMypageSettled(page);

    await expect(page.getByText("베이직 패키지 BOX 구독중")).toHaveCount(0);
    await expectIsolatedAndAlive(page);

    await prepareForSnapshot(page);
    await expect(page).toHaveScreenshot("mypage-05-all-error.png", SNAPSHOT_OPTS);
  });
});

// ── 구독 플랜 페이지 (/subscribe) ─────────────────────────────────────────────

test.describe("구독 플랜 (/subscribe)", () => {
  test("06 - 정상 상태 (베이스라인)", async ({ page }) => {
    await loginAndGoTo(page, "/subscribe");
    // 플랜 요금이 보이면 플랜 목록 SSR 렌더가 끝난 것
    await expect(page.getByText("39,000원").first()).toBeVisible({ timeout: SETTLE_TIMEOUT });

    await prepareForSnapshot(page);
    await expect(page).toHaveScreenshot("subscribe-06-baseline.png", SNAPSHOT_OPTS);
  });

  test("07 - 플랜 API 실패 → 빈 플랜 레이아웃 (catch 흡수, error.tsx 아님)", async ({ page }) => {
    await loginAndGoTo(page, "/subscribe");
    await expect(page.getByText("39,000원").first()).toBeVisible({ timeout: SETTLE_TIMEOUT });

    // fetchSubscriptionPlans 는 .catch(() => ({ plans: [] })) 로 모든 에러를 흡수한다.
    // 따라서 500 주입 시에도 error.tsx 가 아니라 '플랜 없는' 정상 레이아웃이 렌더된다.
    await injectErrors(["/v1/subscriptions/plans"]);
    await page.reload();
    await waitForShell(page);

    // 플랜이 사라졌음을 확인(요금 미표시)
    await expect(page.getByText("39,000원")).toHaveCount(0);

    await prepareForSnapshot(page);
    await expect(page).toHaveScreenshot("subscribe-07-plans-error.png", SNAPSHOT_OPTS);
  });
});

// ── 주문 페이지 (/order) ──────────────────────────────────────────────────────

test.describe("주문 (/order?planId=1)", () => {
  test("08 - 정상 상태 (베이스라인)", async ({ page }) => {
    await loginAndGoTo(page, "/order?planId=1");
    await expect(page.getByRole("button", { name: "결제하기" }).first()).toBeVisible({
      timeout: SETTLE_TIMEOUT,
    });

    await prepareForSnapshot(page);
    await expect(page).toHaveScreenshot("order-08-baseline.png", SNAPSHOT_OPTS);
  });

  test("09 - 플랜 API 실패 → /subscribe 리다이렉트 (plans=[] 가드)", async ({ page }) => {
    await loginAndGoTo(page, "/order?planId=1");
    await expect(page.getByRole("button", { name: "결제하기" }).first()).toBeVisible({
      timeout: SETTLE_TIMEOUT,
    });

    // plans 는 .catch 로 빈 배열이 되고, planId(1)가 빈 목록에 없으므로 SSR 이
    // /subscribe 로 리다이렉트한다(order/error.tsx 가 아님).
    await injectErrors(["/v1/subscriptions/plans"]);
    await page.reload();
    await page.waitForURL("/subscribe", { timeout: SETTLE_TIMEOUT });
    await waitForShell(page);

    await prepareForSnapshot(page);
    await expect(page).toHaveScreenshot("order-09-plans-error.png", SNAPSHOT_OPTS);
  });

  test("10 - 결제수단 API 실패 → 결제수단 없이 정상 렌더 (catch 흡수)", async ({ page }) => {
    await loginAndGoTo(page, "/order?planId=1");
    await expect(page.getByRole("button", { name: "결제하기" }).first()).toBeVisible({
      timeout: SETTLE_TIMEOUT,
    });

    // fetchBillingInfo 도 .catch(() => ({ billingInfos: [] })) 로 에러를 흡수한다.
    // 따라서 결제수단 없음 상태로 주문 페이지가 정상 렌더된다(error.tsx 가 아님).
    await injectErrors(["/v1/billing"]);
    await page.reload();
    await expect(page.getByRole("button", { name: "결제하기" }).first()).toBeVisible({
      timeout: SETTLE_TIMEOUT,
    });

    await prepareForSnapshot(page);
    await expect(page).toHaveScreenshot("order-10-billing-error.png", SNAPSHOT_OPTS);
  });
});
