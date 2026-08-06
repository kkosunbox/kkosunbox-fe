import type { Page } from "@playwright/test";
import { test, expect } from "../helpers/fixtures";
import {
  MOCK_PLANS,
  MOCK_VALID_COUPON_CODE,
  MOCK_VALID_REFERRAL_CODE,
} from "../helpers/mockApiServer";
import { loginByTokens, TEST_TOKENS, NO_PROFILE_TOKENS, BILLING_TOKENS } from "../helpers/auth";

const REFERRAL_COOKIE = "ggosoon-ref";

// Basic 플랜(id=1)으로 테스트. monthlyPrice=39,000원 기준으로 쿠폰 할인 계산.
const VALID_PLAN_ID = MOCK_PLANS[0].id;       // 1
const INVALID_PLAN_ID = 999;                  // 플랜 목록에 없는 값

// Phase 6 이후 주문 페이지는 단일 CSS Grid로 통합되어 DOM에 요소가 1벌만 존재한다.
// filter({ visible: true })는 동일 텍스트가 합계·행 금액 등 여러 맥락에 나타날 경우를 위한
// 방어 장치로 유지한다.
const visiblePlaceholder = (page: Page, ph: string) =>
  page.getByPlaceholder(ph).filter({ visible: true });
const visibleText = (page: Page, text: string) =>
  page.getByText(text).filter({ visible: true }).first();
// sr-only <input type="checkbox"> 직접 클릭은 Playwright의 pointer-interception 이슈가 있다.
// <label> 전체를 클릭하면 native browser behavior로 checkbox가 toggle되지만,
// 라벨 텍스트에 "보기" 링크(<a target="_blank">)가 붙은 항목(이용약관/개인정보)은
// label의 중앙 클릭 좌표가 그 링크 위에 걸려 토글이 안 될 수 있다.
// label 안의 decorative 체크박스 박스(span[aria-hidden])를 직접 클릭하면
// 링크와 겹치지 않으면서도 label의 암묵적 토글은 그대로 발생해 안정적이다.
const clickCheckbox = (page: Page, label: string) =>
  page.locator("label").filter({ hasText: label }).locator('span[aria-hidden="true"]').click();

test.describe("주문 페이지 (/order)", () => {

  // ── planId 유효성 리다이렉트 ──────────────────────────────────────

  test("planId 없이 진입 → /subscribe 리다이렉트", async ({ page }) => {
    // 미들웨어 통과를 위해 로그인 필요; planId 없음 → SSR이 /subscribe로 리다이렉트
    await loginByTokens(page, TEST_TOKENS);
    await page.goto("/order");
    await page.waitForURL("/subscribe", { timeout: 10_000 });
  });

  test("planId 음수(-1) 진입 → /subscribe 리다이렉트", async ({ page }) => {
    // 미들웨어 통과를 위해 로그인 필요; planId <= 0 → SSR이 /subscribe로 리다이렉트
    await loginByTokens(page, TEST_TOKENS);
    await page.goto("/order?planId=-1");
    await page.waitForURL("/subscribe", { timeout: 10_000 });
  });

  test("planId가 플랜 목록에 없는 값(999) → /subscribe 리다이렉트", async ({ page }) => {
    // 로그인 후 접근해야 프로필 체크를 통과하고 플랜 체크 단계까지 진입
    await loginByTokens(page, TEST_TOKENS);
    await page.goto(`/order?planId=${INVALID_PLAN_ID}`);
    await page.waitForURL("/subscribe", { timeout: 10_000 });
  });

  // ── 프로필 없는 유저도 정상 진입 ────────────────────────────────────
  // 정책 변경: 애견 프로필은 선택 사항이므로 프로필 0개여도 주문 페이지 정상 렌더

  test("프로필 없는 유저 진입 → 가드 없이 주문 페이지 렌더", async ({ page }) => {
    await loginByTokens(page, NO_PROFILE_TOKENS);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);
    // 가드 모달 없이 결제하기 버튼이 보여야 한다
    await expect(page.getByRole("button", { name: "결제하기" }).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  // ── 약관 동의 ────────────────────────────────────────────────────

  test("결제하기 버튼 초기 비활성화 + 전체동의 클릭 → 활성화", async ({ page }) => {
    // 약관 동의만으로 활성화되는지 보는 테스트라 카드는 이미 등록된 유저로 로그인한다.
    await loginByTokens(page, BILLING_TOKENS);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);

    // 약관 미동의 → disabled
    const payButton = page.getByRole("button", { name: "결제하기" }).first();
    await expect(payButton).toBeDisabled({ timeout: 10_000 });

    // 전체동의 체크박스 클릭
    await clickCheckbox(page, "모두 동의합니다.");

    // 동의 완료 → enabled
    await expect(payButton).toBeEnabled();
  });

  test("전체동의 후 개별 약관 해제 → 결제하기 비활성화", async ({ page }) => {
    await loginByTokens(page, BILLING_TOKENS);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);

    // 전체동의
    await clickCheckbox(page, "모두 동의합니다.");
    await expect(page.getByRole("button", { name: "결제하기" }).first()).toBeEnabled();

    // 동의 상세 패널은 기본 열림(agreeOpen) — 토글을 누르면 닫혀 이후 단계가 실패함

    // 이용약관만 해제
    await clickCheckbox(page, "이용약관 동의 (필수)");

    // 전체동의가 깨지므로 결제하기 비활성화
    await expect(page.getByRole("button", { name: "결제하기" }).first()).toBeDisabled();
  });

  // ── 쿠폰 ─────────────────────────────────────────────────────────

  test("쿠폰사용 체크박스 → 쿠폰 입력 필드 표시", async ({ page }) => {
    await loginByTokens(page, TEST_TOKENS);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);

    // 초기: 쿠폰 입력 필드 없음
    await expect(page.getByPlaceholder("코드 입력")).toHaveCount(0);

    // 쿠폰사용 체크박스 클릭
    await clickCheckbox(page, "쿠폰사용");

    // 입력 필드 표시
    await expect(visiblePlaceholder(page, "코드 입력")).toBeVisible();
  });

  test("유효한 쿠폰 적용 → 할인금액 반영, 총액 변경", async ({ page }) => {
    await loginByTokens(page, TEST_TOKENS);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);

    // 쿠폰 입력 활성화
    await clickCheckbox(page, "쿠폰사용");

    // 쿠폰 코드 입력 후 적용
    await visiblePlaceholder(page, "코드 입력").fill(MOCK_VALID_COUPON_CODE);
    await page.getByRole("button", { name: "쿠폰적용" }).first().click();

    // 10% 할인: 39,000 - 3,900 = 35,100원
    await expect(visibleText(page, "35,100원")).toBeVisible({ timeout: 10_000 });
  });

  test("유효하지 않은 쿠폰 → 에러 메시지 표시", async ({ page }) => {
    await loginByTokens(page, TEST_TOKENS);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);

    await clickCheckbox(page, "쿠폰사용");
    await visiblePlaceholder(page, "코드 입력").fill("INVALID_CODE");
    await page.getByRole("button", { name: "쿠폰적용" }).first().click();

    await expect(visibleText(page, "유효하지 않은 쿠폰 코드입니다.")).toBeVisible({
      timeout: 10_000,
    });
  });
});

// ── 구독 시작일 (from=purchase 진입) ─────────────────────────────────
// 단건 구매 관리의 구독 유도 배너(SubscribePromoBanner)를 통해 진입했을 때만
// (?planId=..&from=purchase) 노출되는 필드. 일반 진입에는 렌더되지 않는다.
test.describe("주문 페이지 구독 시작일 섹션", () => {
  test("일반 진입(from 파라미터 없음) → 구독 시작일 섹션 렌더되지 않음", async ({ page }) => {
    await loginByTokens(page, TEST_TOKENS);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);
    await expect(page.getByRole("button", { name: "결제하기" }).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("구독 시작일", { exact: true })).toHaveCount(0);
  });

  test("from=purchase 진입 → 구독 시작일 섹션 렌더, 날짜 선택기는 기본 비활성", async ({ page }) => {
    await loginByTokens(page, TEST_TOKENS);
    await page.goto(`/order?planId=${VALID_PLAN_ID}&from=purchase`);

    await expect(visibleText(page, "구독 시작일")).toBeVisible({ timeout: 10_000 });
    await expect(visibleText(page, "지금 바로 첫 구독 상품 받기")).toBeVisible();
    await expect(visibleText(page, "다음 배송부터 시작")).toBeVisible();

    // 기본값은 "지금 바로 첫 구독 상품 받기" → 날짜 선택기 비활성
    await expect(page.getByRole("button", { name: "배송 날짜" })).toBeDisabled();
  });

  test("다음 배송부터 시작 선택 → 날짜 선택기 활성화", async ({ page }) => {
    await loginByTokens(page, TEST_TOKENS);
    await page.goto(`/order?planId=${VALID_PLAN_ID}&from=purchase`);

    await visibleText(page, "다음 배송부터 시작").click();
    await expect(page.getByRole("button", { name: "배송 날짜" })).toBeEnabled();
  });

  test("다음 배송부터 시작 선택 + 날짜 미선택 → 결제하기 클릭 시 에러 메시지", async ({ page }) => {
    // 카드·배송지가 모두 등록된 계정으로, 구독 시작일 검증만 단독으로 관찰한다.
    await loginByTokens(page, BILLING_TOKENS);
    await page.goto(`/order?planId=${VALID_PLAN_ID}&from=purchase`);

    await clickCheckbox(page, "모두 동의합니다.");
    await visibleText(page, "다음 배송부터 시작").click();

    await page.getByRole("button", { name: "결제하기" }).first().click();
    await expect(visibleText(page, "구독 시작일을 선택해 주세요.")).toBeVisible({
      timeout: 10_000,
    });
  });
});

// ── 초대코드 섹션 (레퍼럴) ─────────────────────────────────────────
// 노출/잠금은 (초대링크 진입 여부) × (구독 이력 여부)로 결정된다.
//  - TEST_TOKENS 계정(test@example.com)   → 구독 1건 존재 = 이력 있음
//  - NO_PROFILE_TOKENS 계정               → 구독 0건       = 이력 없음
//  - 초대링크 진입은 ggosoon-ref 쿠키 주입으로 시뮬레이션
test.describe("주문 페이지 초대코드 섹션 (레퍼럴)", () => {
  const setRefCookie = (page: Page, value: string) =>
    page.context().addCookies([
      { name: REFERRAL_COOKIE, value, domain: "localhost", path: "/" },
    ]);

  const invitePlaceholder = "초대코드를 입력해주세요.";

  // ── 4-모드 매트릭스 ────────────────────────────────────────────

  test("일반 진입 + 구독 이력 있음 → 섹션 가림(hidden)", async ({ page }) => {
    await loginByTokens(page, TEST_TOKENS);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);
    await expect(page.getByRole("button", { name: "결제하기" }).first()).toBeVisible({
      timeout: 10_000,
    });
    // 섹션 자체가 렌더되지 않으므로 어떤 레이아웃에도 타이틀이 없다.
    await expect(page.getByText("초대코드 입력", { exact: true })).toHaveCount(0);
  });

  test("초대링크 진입 + 구독 이력 있음 → 입력 없이 안내 문구(ineligible)", async ({ page }) => {
    await loginByTokens(page, TEST_TOKENS);
    await setRefCookie(page, MOCK_VALID_REFERRAL_CODE);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);

    await expect(
      visibleText(page, "초대코드는 첫 구독 시에만 사용 가능합니다.")
    ).toBeVisible({ timeout: 10_000 });
    // 입력 필드는 렌더되지 않는다.
    await expect(page.getByPlaceholder(invitePlaceholder)).toHaveCount(0);
  });

  test("일반 진입 + 구독 이력 없음 → 입력 영역 노출(open)", async ({ page }) => {
    await loginByTokens(page, NO_PROFILE_TOKENS);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);

    const input = visiblePlaceholder(page, invitePlaceholder);
    await expect(input).toBeVisible({ timeout: 10_000 });
    await expect(input).toBeEnabled();
  });

  test("초대링크 진입 + 구독 이력 없음 → 코드 자동입력·잠김 + 할인 반영(locked)", async ({ page }) => {
    await loginByTokens(page, NO_PROFILE_TOKENS);
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
    await loginByTokens(page, NO_PROFILE_TOKENS);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);

    await visiblePlaceholder(page, invitePlaceholder).fill(MOCK_VALID_REFERRAL_CODE);
    await page.getByRole("button", { name: "코드적용" }).first().click();

    await expect(visibleText(page, "35,100원")).toBeVisible({ timeout: 10_000 });
  });

  test("open: 유효하지 않은 초대코드 → '사용할 수 없는 코드입니다.'", async ({ page }) => {
    await loginByTokens(page, NO_PROFILE_TOKENS);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);

    await visiblePlaceholder(page, invitePlaceholder).fill("BADCODE");
    await page.getByRole("button", { name: "코드적용" }).first().click();

    await expect(visibleText(page, "사용할 수 없는 코드입니다.")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("locked + 무효 코드 → 탈출구(코드 삭제) 후 입력 활성화", async ({ page }) => {
    await loginByTokens(page, NO_PROFILE_TOKENS);
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
    await loginByTokens(page, NO_PROFILE_TOKENS);
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
    await loginByTokens(page, NO_PROFILE_TOKENS);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);

    // 쿠폰 10% (3,900) 적용 → 35,100원
    await clickCheckbox(page, "쿠폰사용");
    await visiblePlaceholder(page, "코드 입력").fill(MOCK_VALID_COUPON_CODE);
    await page.getByRole("button", { name: "쿠폰적용" }).first().click();
    await expect(visibleText(page, "35,100원")).toBeVisible({ timeout: 10_000 });

    // 초대코드 10% (3,900) 추가 → 합산 7,800 → 31,200원
    await visiblePlaceholder(page, invitePlaceholder).fill(MOCK_VALID_REFERRAL_CODE);
    await page.getByRole("button", { name: "코드적용" }).first().click();
    await expect(visibleText(page, "31,200원")).toBeVisible({ timeout: 10_000 });
  });
});

// ── 카드 등록 팝업 흐름 ───────────────────────────────────────────
// 실제 Toss 카드 인증은 외부 호스팅 페이지라 e2e 범위 밖 — 팝업이 우리 앱의
// /payment?mode=direct로 열리는지, 등록 완료 브릿지(/payment/billing/success)로
// "돌아왔을 때" 메인 탭의 billing이 갱신되어 결제하기가 활성화되는지까지만 검증한다.
test.describe("카드 등록 팝업 흐름", () => {
  test("카드 미등록 상태 → 결제하기 비활성화, 카드 등록 완료 후 활성화", async ({ page }) => {
    await loginByTokens(page, TEST_TOKENS);
    await page.goto(`/order?planId=${VALID_PLAN_ID}`);

    await clickCheckbox(page, "모두 동의합니다.");
    const payButton = page.getByRole("button", { name: "결제하기" }).first();
    // 약관에 모두 동의해도 카드 미등록이면 결제하기는 계속 비활성 — 팝업으로 유도하지 않는다.
    await expect(payButton).toBeDisabled();
    await expect(visibleText(page, "결제 수단을 등록해야 결제할 수 있어요.")).toBeVisible();

    const [popup] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("button", { name: "카드 등록" }).first().click(),
    ]);
    await popup.waitForLoadState("domcontentloaded");
    expect(popup.url()).toContain("/payment?mode=direct");

    // 등록 완료 후 돌아오는 성공 브릿지로 바로 이동해 "Toss 인증 완료"를 시뮬레이션한다.
    // 이 페이지는 로드되자마자 스스로 window.close()를 호출하므로 "load"까지 기다리면 레이스로 끊긴다.
    await popup.goto(
      "/payment/billing/success?authKey=mock-auth-key&customerKey=mock-customer-key",
      { waitUntil: "commit" },
    );
    await popup.waitForEvent("close", { timeout: 10_000 });

    // 팝업이 브로드캐스트로 알리면 메인 탭이 billing을 다시 조회해 결제하기가 활성화된다.
    await expect(payButton).toBeEnabled({ timeout: 10_000 });
  });
});

// ── 레퍼럴 링크 캡처 (미들웨어 proxy.ts) ────────────────────────────
test.describe("레퍼럴 링크 캡처 (미들웨어)", () => {
  test("?r=CODE 진입 → r 제거 리다이렉트 + 쿠키 저장", async ({ page }) => {
    await page.goto("/?r=ABC123");

    await expect(page).toHaveURL(/localhost:\d+\/$/);
    expect(page.url()).not.toContain("r=");

    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === REFERRAL_COOKIE)?.value).toBe("ABC123");
  });

  test("형식이 잘못된 ?r → 쿠키 미저장(r만 제거)", async ({ page }) => {
    await page.goto("/?r=bad%20code");

    await expect(page).toHaveURL(/localhost:\d+\/$/);
    expect(page.url()).not.toContain("r=");

    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === REFERRAL_COOKIE)).toBeUndefined();
  });
});
