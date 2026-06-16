import type { Page } from "@playwright/test";
import { TEST_CREDENTIALS, NO_PROFILE_CREDENTIALS, INFLUENCER_CREDENTIALS } from "./mockApiServer";

type Credentials = { email: string; password: string };

/** 지정 계정으로 로그인하고 홈(/)에 도달할 때까지 기다린다. */
export async function login(page: Page, creds: Credentials): Promise<void> {
  await page.goto("/login");
  await page.getByPlaceholder("이메일을 입력하세요").fill(creds.email);
  await page.getByPlaceholder("비밀번호를 입력하세요").fill(creds.password);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await page.waitForURL("/", { timeout: 15_000 });
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
