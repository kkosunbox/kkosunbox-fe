import { test, expect } from "@playwright/test";
import { MOCK_PLANS, MOCK_VALID_COUPON_CODE, NO_PROFILE_CREDENTIALS } from "../helpers/mockApiServer";
import { loginAndGoTo } from "../helpers/auth";

// Basic 플랜(id=1)으로 테스트. monthlyPrice=39,000원 기준으로 쿠폰 할인 계산.
const VALID_PLAN_ID = MOCK_PLANS[0].id;       // 1
const INVALID_PLAN_ID = 999;                  // 플랜 목록에 없는 값

test.describe("주문 페이지 (/order)", () => {

  // ── planId 유효성 리다이렉트 ──────────────────────────────────────

  test("planId 없이 진입 → /subscribe 리다이렉트", async ({ page }) => {
    // 미들웨어 통과를 위해 로그인 필요; planId 없음 → SSR이 /subscribe로 리다이렉트
    await loginAndGoTo(page, "/order");
    await page.waitForURL("/subscribe", { timeout: 10_000 });
  });

  test("planId 음수(-1) 진입 → /subscribe 리다이렉트", async ({ page }) => {
    // 미들웨어 통과를 위해 로그인 필요; planId <= 0 → SSR이 /subscribe로 리다이렉트
    await loginAndGoTo(page, "/order?planId=-1");
    await page.waitForURL("/subscribe", { timeout: 10_000 });
  });

  test("planId가 플랜 목록에 없는 값(999) → /subscribe 리다이렉트", async ({ page }) => {
    // 로그인 후 접근해야 프로필 체크를 통과하고 플랜 체크 단계까지 진입
    await loginAndGoTo(page, `/order?planId=${INVALID_PLAN_ID}`);
    await page.waitForURL("/subscribe", { timeout: 10_000 });
  });

  // ── 프로필 리다이렉트 ─────────────────────────────────────────────

  test("프로필 없는 유저 진입 → /mypage/profile 리다이렉트", async ({ page }) => {
    // NO_PROFILE 유저로 로그인: 미들웨어는 통과하지만 profiles가 빈 배열 → SSR redirect
    await page.goto("/login");
    await page.getByPlaceholder("이메일을 입력하세요").fill(NO_PROFILE_CREDENTIALS.email);
    await page.getByPlaceholder("비밀번호를 입력하세요").fill(NO_PROFILE_CREDENTIALS.password);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await page.waitForURL("/", { timeout: 15_000 });
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);
    await page.waitForURL("/mypage/profile", { timeout: 10_000 });
  });

  // ── 약관 동의 ────────────────────────────────────────────────────

  test("결제하기 버튼 초기 비활성화 + 전체동의 클릭 → 활성화", async ({ page }) => {
    await loginAndGoTo(page, `/order?planId=${VALID_PLAN_ID}`);

    // 약관 미동의 → disabled
    const payButton = page.getByRole("button", { name: "결제하기" }).first();
    await expect(payButton).toBeDisabled({ timeout: 10_000 });

    // 전체동의 체크박스 클릭 (label 안의 button)
    await page.locator("label", { hasText: "모두 동의합니다." }).first().getByRole("button").click();

    // 동의 완료 → enabled
    await expect(payButton).toBeEnabled();
  });

  test("전체동의 후 개별 약관 해제 → 결제하기 비활성화", async ({ page }) => {
    await loginAndGoTo(page, `/order?planId=${VALID_PLAN_ID}`);

    // 전체동의
    await page.locator("label", { hasText: "모두 동의합니다." }).first().getByRole("button").click();
    await expect(page.getByRole("button", { name: "결제하기" }).first()).toBeEnabled();

    // 개별 약관 패널 열기 (inert 해제)
    await page.locator('button[aria-controls="order-agreements-panel"]').first().click();

    // 이용약관만 해제
    await page.locator("label", { hasText: "이용약관 동의 (필수)" }).first().getByRole("button").click();

    // 전체동의가 깨지므로 결제하기 비활성화
    await expect(page.getByRole("button", { name: "결제하기" }).first()).toBeDisabled();
  });

  // ── 쿠폰 ─────────────────────────────────────────────────────────

  test("쿠폰사용 체크박스 → 쿠폰 입력 필드 표시", async ({ page }) => {
    await loginAndGoTo(page, `/order?planId=${VALID_PLAN_ID}`);

    // 초기: 쿠폰 입력 필드 없음
    await expect(page.getByPlaceholder("코드 입력")).toHaveCount(0);

    // 쿠폰사용 체크박스 클릭
    await page.locator("label", { hasText: "쿠폰사용" }).first().getByRole("button").click();

    // 입력 필드 표시 (데스크톱/모바일 각 1개씩 = 총 2개)
    await expect(page.getByPlaceholder("코드 입력").first()).toBeVisible();
  });

  test("유효한 쿠폰 적용 → 할인금액 반영, 총액 변경", async ({ page }) => {
    await loginAndGoTo(page, `/order?planId=${VALID_PLAN_ID}`);

    // 쿠폰 입력 활성화
    await page.locator("label", { hasText: "쿠폰사용" }).first().getByRole("button").click();

    // 쿠폰 코드 입력 후 적용
    await page.getByPlaceholder("코드 입력").first().fill(MOCK_VALID_COUPON_CODE);
    await page.getByRole("button", { name: "쿠폰적용" }).first().click();

    // 10% 할인: 39,000 - 3,900 = 35,100원
    await expect(page.getByText("35,100원").first()).toBeVisible({ timeout: 10_000 });
  });

  test("유효하지 않은 쿠폰 → 에러 메시지 표시", async ({ page }) => {
    await loginAndGoTo(page, `/order?planId=${VALID_PLAN_ID}`);

    await page.locator("label", { hasText: "쿠폰사용" }).first().getByRole("button").click();
    await page.getByPlaceholder("코드 입력").first().fill("INVALID_CODE");
    await page.getByRole("button", { name: "쿠폰적용" }).first().click();

    await expect(
      page.getByText("유효하지 않은 쿠폰 코드입니다.").first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
