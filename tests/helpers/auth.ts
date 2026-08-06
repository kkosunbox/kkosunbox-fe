import type { Page } from "@playwright/test";
import {
  TEST_CREDENTIALS,
  NO_PROFILE_CREDENTIALS,
  INFLUENCER_CREDENTIALS,
  MOCK_ACCESS_TOKEN,
  MOCK_REFRESH_TOKEN,
  MOCK_NO_PROFILE_ACCESS_TOKEN,
  MOCK_NO_PROFILE_REFRESH_TOKEN,
  MOCK_BILLING_ACCESS_TOKEN,
  MOCK_BILLING_REFRESH_TOKEN,
} from "./mockApiServer";

type Credentials = { email: string; password: string };

/**
 * /login 페이지는 모바일·데스크톱 마크업이 뷰포트와 무관하게 항상 함께 DOM에 존재하고
 * (하나는 CSS로만 숨김) 플레이스홀더 문구가 동일해서, 스코프 없는 getByPlaceholder는
 * strict mode violation(2 elements)으로 항상 실패한다. 실제로 보이는 쪽만 골라야 한다.
 */
export function loginEmailInput(page: Page) {
  return page.locator('input[placeholder="이메일을 입력하세요"]:visible');
}
export function loginPasswordInput(page: Page) {
  return page.locator('input[placeholder="비밀번호를 입력하세요"]:visible');
}
/** 위와 같은 이유로, /login 폼 에러 메시지도 실제로 보이는 쪽만 골라야 한다. */
export function loginErrorMessage(page: Page, text: string) {
  return page.locator("p:visible", { hasText: text });
}

export const TEST_TOKENS = { accessToken: MOCK_ACCESS_TOKEN, refreshToken: MOCK_REFRESH_TOKEN };
export const NO_PROFILE_TOKENS = {
  accessToken: MOCK_NO_PROFILE_ACCESS_TOKEN,
  refreshToken: MOCK_NO_PROFILE_REFRESH_TOKEN,
};
/** 결제수단(카드)이 이미 등록된 유저 — 약관 동의 등 카드 등록과 무관한 결제하기 활성화 조건 검증용 */
export const BILLING_TOKENS = {
  accessToken: MOCK_BILLING_ACCESS_TOKEN,
  refreshToken: MOCK_BILLING_REFRESH_TOKEN,
};

/**
 * 쿠키·localStorage에 직접 토큰을 주입해 인증 상태를 설정한다.
 * UI 로그인 플로우를 거치지 않으므로 빠르고 타이밍 이슈가 없다.
 * 인증 플로우 자체를 검증하지 않는 테스트에서 사용한다.
 *
 * 사용법:
 *   await loginByTokens(page, TEST_TOKENS);
 *   await page.goto("/order?planId=1");
 */
export async function loginByTokens(
  page: Page,
  tokens: { accessToken: string; refreshToken: string },
): Promise<void> {
  // addInitScript는 이후 모든 page.goto() 직전에 실행되므로 localStorage 경쟁 조건이 없다
  await page.addInitScript(
    `window.localStorage.setItem("ggosoon:refresh_token", ${JSON.stringify(tokens.refreshToken)});`,
  );

  // SSR이 읽는 인증 쿠키
  await page.context().addCookies([
    {
      name: "ggosoon-auth",
      value: tokens.accessToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);
}

/** 지정 계정으로 로그인하고 홈(/)에 도달할 때까지 기다린다. */
export async function login(page: Page, creds: Credentials): Promise<void> {
  await page.goto("/login");
  await loginEmailInput(page).fill(creds.email);
  await loginPasswordInput(page).fill(creds.password);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await page.waitForURL("/", { timeout: 15_000 });
  // refreshToken이 localStorage에 저장될 때까지 대기 (UI 로그인 타이밍 이슈 방지)
  await page.waitForFunction(() => !!localStorage.getItem("ggosoon:refresh_token"), {
    timeout: 5_000,
  });
}

/**
 * 로그인 후 지정 경로로 이동한다. (구독 이력이 있는 test 계정)
 * 로그인이 필요한 페이지 테스트의 공통 사전 작업.
 */
export async function loginAndGoTo(page: Page, path: string): Promise<void> {
  await login(page, TEST_CREDENTIALS);
  await page.goto(path);
}

/** 구독 이력이 없는 프로필 미보유 계정으로 로그인하고 홈에 도달할 때까지 기다린다. */
export async function loginAsNoProfile(page: Page): Promise<void> {
  await login(page, NO_PROFILE_CREDENTIALS);
}

/** 인플루언서 계정(isInfluencer: true)으로 로그인하고 홈에 도달할 때까지 기다린다. */
export async function loginAsInfluencer(page: Page): Promise<void> {
  await login(page, INFLUENCER_CREDENTIALS);
}
