import { test, expect, type Page } from "@playwright/test";
import {
  MOCK_PLANS,
  MOCK_VALID_COUPON_CODE,
  MOCK_VALID_REFERRAL_CODE,
  TEST_CREDENTIALS,
} from "../helpers/mockApiServer";
import { login, loginAndGoTo, loginAsNoProfile } from "../helpers/auth";

const REFERRAL_COOKIE = "ggosoon-ref";

// Basic 플랜(id=1)으로 테스트. monthlyPrice=39,000원 기준으로 쿠폰 할인 계산.
const VALID_PLAN_ID = MOCK_PLANS[0].id;       // 1
const INVALID_PLAN_ID = 999;                  // 플랜 목록에 없는 값

// 주문 페이지는 태블릿/데스크탑/모바일 레이아웃을 각각(반응형) 렌더하므로 같은 요소가 DOM에
// 여러 벌 존재한다(보이지 않는 복사본 포함). 텍스트·placeholder 로케이터는 보이는 것만 한정한다.
// (getByRole은 기본적으로 숨김 요소를 제외하므로 버튼은 getByRole로 찾는다.)
const visiblePlaceholder = (page: Page, ph: string) =>
  page.getByPlaceholder(ph).filter({ visible: true }).first();
const visibleText = (page: Page, text: string) =>
  page.getByText(text).filter({ visible: true }).first();

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

  // ── 프로필 없는 유저도 정상 진입 ────────────────────────────────────
  // 정책 변경: 애견 프로필은 선택 사항이므로 프로필 0개여도 주문 페이지 정상 렌더

  test("프로필 없는 유저 진입 → 가드 없이 주문 페이지 렌더", async ({ page }) => {
    await loginAsNoProfile(page);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);
    // 가드 모달 없이 결제하기 버튼이 보여야 한다
    await expect(page.getByRole("button", { name: "결제하기" }).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  // ── 약관 동의 ────────────────────────────────────────────────────

  test("결제하기 버튼 초기 비활성화 + 전체동의 클릭 → 활성화", async ({ page }) => {
    await loginAndGoTo(page, `/order?planId=${VALID_PLAN_ID}`);

    // 약관 미동의 → disabled
    const payButton = page.getByRole("button", { name: "결제하기" }).first();
    await expect(payButton).toBeDisabled({ timeout: 10_000 });

    // 전체동의 체크박스 클릭 (접근성 이름이 있는 버튼)
    await page.getByRole("button", { name: "모두 동의합니다." }).first().click();

    // 동의 완료 → enabled
    await expect(payButton).toBeEnabled();
  });

  test("전체동의 후 개별 약관 해제 → 결제하기 비활성화", async ({ page }) => {
    await loginAndGoTo(page, `/order?planId=${VALID_PLAN_ID}`);

    // 전체동의
    await page.getByRole("button", { name: "모두 동의합니다." }).first().click();
    await expect(page.getByRole("button", { name: "결제하기" }).first()).toBeEnabled();

    // 동의 상세 패널은 기본 열림(agreeOpen) — 토글을 누르면 닫혀 이후 단계가 실패함

    // 이용약관만 해제
    await page.getByRole("button", { name: "이용약관 동의 (필수)" }).first().click();

    // 전체동의가 깨지므로 결제하기 비활성화
    await expect(page.getByRole("button", { name: "결제하기" }).first()).toBeDisabled();
  });

  // ── 쿠폰 ─────────────────────────────────────────────────────────

  test("쿠폰사용 체크박스 → 쿠폰 입력 필드 표시", async ({ page }) => {
    await loginAndGoTo(page, `/order?planId=${VALID_PLAN_ID}`);

    // 초기: 쿠폰 입력 필드 없음
    await expect(page.getByPlaceholder("코드 입력")).toHaveCount(0);

    // 쿠폰사용 체크박스 클릭
    await page.getByRole("button", { name: "쿠폰사용" }).first().click();

    // 입력 필드 표시 (보이는 레이아웃 기준)
    await expect(visiblePlaceholder(page, "코드 입력")).toBeVisible();
  });

  test("유효한 쿠폰 적용 → 할인금액 반영, 총액 변경", async ({ page }) => {
    await loginAndGoTo(page, `/order?planId=${VALID_PLAN_ID}`);

    // 쿠폰 입력 활성화
    await page.getByRole("button", { name: "쿠폰사용" }).first().click();

    // 쿠폰 코드 입력 후 적용
    await visiblePlaceholder(page, "코드 입력").fill(MOCK_VALID_COUPON_CODE);
    await page.getByRole("button", { name: "쿠폰적용" }).first().click();

    // 10% 할인: 39,000 - 3,900 = 35,100원
    await expect(visibleText(page, "35,100원")).toBeVisible({ timeout: 10_000 });
  });

  test("유효하지 않은 쿠폰 → 에러 메시지 표시", async ({ page }) => {
    await loginAndGoTo(page, `/order?planId=${VALID_PLAN_ID}`);

    await page.getByRole("button", { name: "쿠폰사용" }).first().click();
    await visiblePlaceholder(page, "코드 입력").fill("INVALID_CODE");
    await page.getByRole("button", { name: "쿠폰적용" }).first().click();

    await expect(visibleText(page, "유효하지 않은 쿠폰 코드입니다.")).toBeVisible({
      timeout: 10_000,
    });
  });
});

// ── 초대코드 섹션 (레퍼럴) ─────────────────────────────────────────
// 노출/잠금은 (초대링크 진입 여부) × (구독 이력 여부)로 결정된다.
//  - test 유저(test@example.com)   → 구독 1건 존재 = 이력 있음
//  - noprofile 유저                → 구독 0건       = 이력 없음
//  - 초대링크 진입은 ggosoon-ref 쿠키 주입으로 시뮬레이션
test.describe("주문 페이지 초대코드 섹션 (레퍼럴)", () => {
  const setRefCookie = (page: Page, value: string) =>
    page.context().addCookies([
      { name: REFERRAL_COOKIE, value, domain: "localhost", path: "/" },
    ]);

  const invitePlaceholder = "초대코드를 입력해주세요.";

  // ── 4-모드 매트릭스 ────────────────────────────────────────────

  test("일반 진입 + 구독 이력 있음 → 섹션 가림(hidden)", async ({ page }) => {
    await loginAndGoTo(page, `/order?planId=${VALID_PLAN_ID}`);
    await expect(page.getByRole("button", { name: "결제하기" }).first()).toBeVisible({
      timeout: 10_000,
    });
    // 섹션 자체가 렌더되지 않으므로 어떤 레이아웃에도 타이틀이 없다.
    await expect(page.getByText("초대코드 입력", { exact: true })).toHaveCount(0);
  });

  test("초대링크 진입 + 구독 이력 있음 → 입력 없이 안내 문구(ineligible)", async ({ page }) => {
    await login(page, TEST_CREDENTIALS);
    await setRefCookie(page, MOCK_VALID_REFERRAL_CODE);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);

    await expect(
      visibleText(page, "초대코드는 첫 구독 시에만 사용 가능합니다.")
    ).toBeVisible({ timeout: 10_000 });
    // 입력 필드는 어떤 레이아웃에도 렌더되지 않는다.
    await expect(page.getByPlaceholder(invitePlaceholder)).toHaveCount(0);
  });

  test("일반 진입 + 구독 이력 없음 → 입력 영역 노출(open)", async ({ page }) => {
    await loginAsNoProfile(page);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);

    const input = visiblePlaceholder(page, invitePlaceholder);
    await expect(input).toBeVisible({ timeout: 10_000 });
    await expect(input).toBeEnabled();
  });

  test("초대링크 진입 + 구독 이력 없음 → 코드 자동입력·잠김 + 할인 반영(locked)", async ({ page }) => {
    await loginAsNoProfile(page);
    await setRefCookie(page, MOCK_VALID_REFERRAL_CODE);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);

    const input = visiblePlaceholder(page, invitePlaceholder);
    await expect(input).toHaveValue(MOCK_VALID_REFERRAL_CODE, { timeout: 10_000 });
    await expect(input).toBeDisabled();
    // 자동 검증·적용: 39,000 - 3,900(10%) = 35,100원
    await expect(visibleText(page, "35,100원")).toBeVisible({ timeout: 10_000 });
  });

  // ── open 모드 직접 입력/적용 ────────────────────────────────────

  test("open: 유효한 초대코드 적용 → 할인 반영", async ({ page }) => {
    await loginAsNoProfile(page);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);

    await visiblePlaceholder(page, invitePlaceholder).fill(MOCK_VALID_REFERRAL_CODE);
    await page.getByRole("button", { name: "코드적용" }).first().click();

    await expect(visibleText(page, "35,100원")).toBeVisible({ timeout: 10_000 });
  });

  test("open: 유효하지 않은 초대코드 → '사용할 수 없는 코드입니다.'", async ({ page }) => {
    await loginAsNoProfile(page);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);

    await visiblePlaceholder(page, invitePlaceholder).fill("BADCODE");
    await page.getByRole("button", { name: "코드적용" }).first().click();

    await expect(visibleText(page, "사용할 수 없는 코드입니다.")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("locked + 무효 코드 → 탈출구(코드 삭제) 후 입력 활성화", async ({ page }) => {
    await loginAsNoProfile(page);
    await setRefCookie(page, "BADCODE");
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);

    const input = visiblePlaceholder(page, invitePlaceholder);
    await expect(input).toBeDisabled();
    await expect(visibleText(page, "사용할 수 없는 코드입니다.")).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole("button", { name: "코드 삭제" }).first().click();
    await expect(input).toBeEnabled();
    await expect(input).toHaveValue("");
  });

  test("로그아웃 후에도 ggosoon-ref 쿠키 유지", async ({ page }) => {
    await loginAsNoProfile(page);
    await setRefCookie(page, "ABC123");
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);
    await expect(page.getByRole("button", { name: "결제하기" }).first()).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole("button", { name: "프로필 메뉴" }).click();
    await page.getByRole("button", { name: "로그아웃" }).click();
    await page.waitForURL(/\/login/, { timeout: 10_000 });

    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === REFERRAL_COOKIE)?.value).toBe("ABC123");
  });

  test("open: 쿠폰 + 초대코드 할인 합산 → 총액 반영", async ({ page }) => {
    await loginAsNoProfile(page);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);

    // 쿠폰 10% (3,900) 적용 → 35,100원
    await page.getByRole("button", { name: "쿠폰사용" }).first().click();
    await visiblePlaceholder(page, "코드 입력").fill(MOCK_VALID_COUPON_CODE);
    await page.getByRole("button", { name: "쿠폰적용" }).first().click();
    await expect(visibleText(page, "35,100원")).toBeVisible({ timeout: 10_000 });

    // 초대코드 10% (3,900) 추가 → 합산 7,800 → 31,200원
    await visiblePlaceholder(page, invitePlaceholder).fill(MOCK_VALID_REFERRAL_CODE);
    await page.getByRole("button", { name: "코드적용" }).first().click();
    await expect(visibleText(page, "31,200원")).toBeVisible({ timeout: 10_000 });
  });
});

// ── 레퍼럴 링크 캡처 (미들웨어 proxy.ts) ────────────────────────────
test.describe("레퍼럴 링크 캡처 (미들웨어)", () => {
  test("?ref=CODE 진입 → ref 제거 리다이렉트 + 쿠키 저장", async ({ page }) => {
    await page.goto("/?ref=ABC123");

    await expect(page).toHaveURL(/localhost:\d+\/$/);
    expect(page.url()).not.toContain("ref");

    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === REFERRAL_COOKIE)?.value).toBe("ABC123");
  });

  test("형식이 잘못된 ?ref → 쿠키 미저장(ref만 제거)", async ({ page }) => {
    await page.goto("/?ref=bad%20code");

    await expect(page).toHaveURL(/localhost:\d+\/$/);
    expect(page.url()).not.toContain("ref");

    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === REFERRAL_COOKIE)).toBeUndefined();
  });
});
