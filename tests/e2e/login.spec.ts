import { test, expect } from "@playwright/test";
import { TEST_CREDENTIALS } from "../helpers/mockApiServer";

test.describe("로그인 플로우", () => {
  // ── 성공 케이스 ──────────────────────────────────────────────────

  test("올바른 자격증명 → 홈 리다이렉트 + 인증된 헤더 표시", async ({ page }) => {
    // 1. 로그인 페이지로 이동
    await page.goto("/login");

    // 2. 이메일 입력
    await page.getByPlaceholder("이메일을 입력하세요").fill(TEST_CREDENTIALS.email);

    // 3. 비밀번호 입력
    await page.getByPlaceholder("비밀번호를 입력하세요").fill(TEST_CREDENTIALS.password);

    // 4. 로그인 버튼 클릭 (type="submit") — exact: true 로 소셜 버튼과 구분
    await page.getByRole("button", { name: "로그인", exact: true }).click();

    // 5. 홈(/)으로 리다이렉트 확인
    await page.waitForURL("/", { timeout: 15_000 });

    // 6. 에러 메시지가 없어야 함
    await expect(
      page.getByText("아이디 또는 비밀번호가 올바르지 않습니다.")
    ).not.toBeVisible();

    // 7. 헤더: "로그인" 링크가 사라지고 프로필 버튼이 나타남
    //    (Button as={Link} href="/login" → <a>로그인</a> 가 보이지 않아야 함)
    await expect(page.getByRole("link", { name: "로그인" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "프로필 메뉴" })).toBeVisible();
  });

  // ── 실패 케이스 ──────────────────────────────────────────────────

  test("잘못된 자격증명 → 에러 메시지 표시, 로그인 페이지 유지", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("이메일을 입력하세요").fill("wrong@example.com");
    await page.getByPlaceholder("비밀번호를 입력하세요").fill("wrongpassword");

    await page.getByRole("button", { name: "로그인", exact: true }).click();

    // 에러 메시지가 나타날 때까지 대기 (loginAction의 401 처리 메시지)
    await expect(
      page.getByText("아이디 또는 비밀번호가 올바르지 않습니다.")
    ).toBeVisible({ timeout: 10_000 });

    // 로그인 페이지에 머물러야 함
    await expect(page).toHaveURL("/login");

    // 인증된 헤더 요소가 없어야 함
    await expect(page.getByRole("button", { name: "프로필 메뉴" })).not.toBeVisible();
  });

  // ── 비밀번호 토글 ────────────────────────────────────────────────

  test("비밀번호 표시/숨기기 토글", async ({ page }) => {
    await page.goto("/login");

    const passwordInput = page.getByPlaceholder("비밀번호를 입력하세요");
    const toggleButton = page.getByRole("button", { name: "비밀번호 보기" });

    // 초기 상태: 비밀번호 숨김
    await expect(passwordInput).toHaveAttribute("type", "password");

    // 토글 클릭 → 비밀번호 표시
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute("type", "text");
    await expect(page.getByRole("button", { name: "비밀번호 숨기기" })).toBeVisible();

    // 다시 클릭 → 비밀번호 숨김
    await page.getByRole("button", { name: "비밀번호 숨기기" }).click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });
});
