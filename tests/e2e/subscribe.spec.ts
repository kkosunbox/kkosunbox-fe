import { test, expect } from "../helpers/fixtures";
import { MOCK_PLANS } from "../helpers/mockApiServer";
import { loginAndGoTo } from "../helpers/auth";

async function dismissChecklistRecommendModalIfVisible(page: import("@playwright/test").Page) {
  // 프로필 로드 후 모달이 뜰 수 있으므로 waitFor로 대기 후 dismiss
  const laterButton = page.getByRole("button", { name: "다음에 하기" });
  try {
    await laterButton.waitFor({ state: "visible", timeout: 5_000 });
    await laterButton.click();
  } catch {
    // 타임아웃 내 모달 미노출 — 체크리스트 완료 상태 또는 이미 닫힌 경우
  }
}

/** 반응형 변형으로 중복 렌더된 숨김 가격이 아닌, 사용자가 실제 보는 가격을 선택한다. */
function visiblePrice(page: import("@playwright/test").Page, price: string) {
  return page.getByText(price, { exact: true }).filter({ visible: true }).first();
}

test.describe("구독 플랜 목록 (/subscribe)", () => {
  // ── 정상 렌더링 ──────────────────────────────────────────────────
  test("프로필은 있지만 체크리스트 미완료면 추천 모달 노출", async ({ page }) => {
    await loginAndGoTo(page, "/subscribe");
    await expect(page.getByRole("button", { name: "체크리스트 작성하기" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("플랜 카드 3개 렌더링 및 월 요금 표시", async ({ page }) => {
    await loginAndGoTo(page, "/subscribe");
    await dismissChecklistRecommendModalIfVisible(page);

    // 플랜 이름은 데스크탑 카드 버튼으로 확인
    // (모바일 섹션 paragraph는 DOM에 hidden 상태로 존재하므로 button으로 한정)
    for (const plan of MOCK_PLANS) {
      await expect(
        page.locator("button").filter({ hasText: plan.name }).first()
      ).toBeVisible({ timeout: 10_000 });
    }

    // 베이직 플랜 월 요금 (39,000원)
    await expect(visiblePrice(page, "39,000원")).toBeVisible();
  });

  // ── 원가/할인가 표시 ────────────────────────────────────────────

  test("각 플랜 카드에 원가 및 할인가 표시", async ({ page }) => {
    await loginAndGoTo(page, "/subscribe");
    await dismissChecklistRecommendModalIfVisible(page);

    // 베이직(49,000원), 스탠다드(74,000원)의 실제 노출 가격을 확인한다.
    await expect(visiblePrice(page, "49,000원")).toBeVisible({ timeout: 10_000 });
    await expect(visiblePrice(page, "74,000원")).toBeVisible({ timeout: 10_000 });
  });

  // ── 빈 플랜 ──────────────────────────────────────────────────────

  test("플랜 API 실패(미인증) → 플랜 카드 요금 정보 미표시 (plans=[] 폴백)", async ({ page }) => {
    // 로그인 없이 접근 → mock 401 → fetchSubscriptionPlans .catch() → plans=[]
    await page.goto("/subscribe");

    // 페이지 로드 완료 확인 (데스크탑/모바일 nav가 동시에 DOM에 존재하므로 .first())
    await expect(page.getByRole("navigation").first()).toBeVisible({ timeout: 10_000 });

    // plans=[] 이므로 API에서 받은 가격 정보가 없어야 함
    await expect(page.getByText("39,000원")).not.toBeVisible();
  });

  // ── 상세 페이지 이동 ─────────────────────────────────────────────

  test("패키지 선택 후 '제품 보러가기' 클릭 → 선택한 상세로 이동", async ({ page }) => {
    await loginAndGoTo(page, "/subscribe");
    await dismissChecklistRecommendModalIfVisible(page);

    const basic = MOCK_PLANS[0];
    const card = page.getByRole("button").filter({ hasText: basic.name });
    await card.click();
    await expect(card).toHaveAttribute("aria-pressed", "true");
    const detailLink = page.getByRole("link", { name: "제품 보러가기" });
    await expect(detailLink).toHaveAttribute("href", `/subscribe/detail?planId=${basic.id}`);
    await detailLink.click();

    await page.waitForURL(/\/subscribe\/detail\?planId=\d+/, { timeout: 10_000 });
  });

  test("시안 기본 선택과 전체 구성 비교표 표시", async ({ page }) => {
    await loginAndGoTo(page, "/subscribe");
    await dismissChecklistRecommendModalIfVisible(page);
    await expect(page.getByRole("button").filter({ hasText: "스탠다드 패키지" })).toHaveAttribute("aria-pressed", "true");
    const table = page.getByRole("table", { name: "베이직, 스탠다드, 프리미엄 패키지 간식 구성 비교" });
    await expect(table).toBeVisible();
    await expect(table.getByRole("columnheader")).toHaveCount(4);
    await expect(table.getByRole("rowheader")).toHaveCount(6);
  });

  test("tier 진입 파라미터는 기본 스탠다드 선택보다 우선", async ({ page }) => {
    await loginAndGoTo(page, "/subscribe?tier=Premium");
    await dismissChecklistRecommendModalIfVisible(page);
    await expect(page.getByRole("button").filter({ hasText: "프리미엄 패키지" })).toHaveAttribute("aria-pressed", "true");
  });
});
