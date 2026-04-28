import type { Page } from "@playwright/test";
import { TEST_CREDENTIALS } from "./mockApiServer";

/**
 * 로그인 후 지정 경로로 이동한다.
 * 로그인이 필요한 페이지 테스트의 공통 사전 작업.
 */
export async function loginAndGoTo(page: Page, path: string): Promise<void> {
  await page.goto("/login");
  await page.getByPlaceholder("이메일을 입력하세요").fill(TEST_CREDENTIALS.email);
  await page.getByPlaceholder("비밀번호를 입력하세요").fill(TEST_CREDENTIALS.password);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await page.waitForURL("/", { timeout: 15_000 });
  await page.goto(path);
}
