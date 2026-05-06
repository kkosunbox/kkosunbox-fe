import { test, expect } from "@playwright/test";
import { MOCK_PLANS } from "../helpers/mockApiServer";
import { loginAndGoTo } from "../helpers/auth";

async function dismissChecklistRecommendModalIfVisible(page: import("@playwright/test").Page) {
  const laterButton = page.getByRole("button", { name: "다음에 하기" });
  if (await laterButton.isVisible()) {
    await laterButton.click();
  }
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

    // 데스크톱/모바일 레이아웃이 DOM에 동시 존재하므로 .first()로 strict mode 위반 방지
    for (const plan of MOCK_PLANS) {
      await expect(page.getByText(plan.name).first()).toBeVisible({ timeout: 10_000 });
    }

    // 베이직 플랜 월 요금 (39,000원)
    await expect(page.getByText("39,000원").first()).toBeVisible();
  });

  // ── 추천 배지 ────────────────────────────────────────────────────

  test("isRecommended 플랜에만 '추천' 배지 표시", async ({ page }) => {
    await loginAndGoTo(page, "/subscribe");
    await dismissChecklistRecommendModalIfVisible(page);

    // MOCK_PLANS 중 isRecommended=true는 스탠다드(id=2) 하나뿐
    // 데스크톱/모바일 레이아웃이 동시에 DOM에 존재하므로 1개 플랜 → 총 2개
    // 다른 플랜에 배지가 추가되면 4~6개로 늘어나 테스트가 깨짐
    const badge = page.getByText("추천", { exact: true });
    await expect(badge.first()).toBeVisible({ timeout: 10_000 });
    await expect(badge).toHaveCount(2);
  });

  // ── 빈 플랜 ──────────────────────────────────────────────────────

  test("플랜 API 실패(미인증) → 빈 상태 안내 메시지 표시", async ({ page }) => {
    // 로그인 없이 접근 → mock 401 → fetchSubscriptionPlans .catch() → plans=[]
    await page.goto("/subscribe");

    await expect(
      page.getByText("표시할 구독 플랜이 없습니다. 잠시 후 다시 시도해 주세요.").first()
    ).toBeVisible({ timeout: 10_000 });
  });

  // ── 상세 페이지 이동 ─────────────────────────────────────────────

  test("'제품 상세보기' 클릭 → /subscribe/detail?planId= 이동", async ({ page }) => {
    await loginAndGoTo(page, "/subscribe");
    await dismissChecklistRecommendModalIfVisible(page);

    // sortOrder 순 첫 번째 카드(베이직, id=1)의 버튼 클릭
    await page.getByRole("button", { name: "제품 상세보기" }).first().click();

    await page.waitForURL(/\/subscribe\/detail\?planId=\d+/, { timeout: 10_000 });
  });
});
