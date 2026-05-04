import { test, expect } from "@playwright/test";
import { MOCK_ACCESS_TOKEN } from "../helpers/mockApiServer";
import { loginAndGoTo } from "../helpers/auth";

test.describe("체크리스트 — 버튼 클릭 가드 (비로그인 → 로그인 유도 모달)", () => {

  // ── 홈 페이지 체크리스트 버튼 ────────────────────────────────────

  test("홈 체크리스트 버튼: 비로그인 → 로그인 유도 모달 표시", async ({ page }) => {
    await page.goto("/");

    // '체크리스트 작성하기' 버튼 클릭
    await page.getByRole("button", { name: "체크리스트 작성하기" }).click();

    // 로그인 유도 모달이 나타나야 함
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText("로그인이 필요해요")).toBeVisible();
    await expect(page.getByText("체크리스트 작성은 로그인 후 이용할 수 있어요.")).toBeVisible();

    // /checklist 로 이동하지 않아야 함
    await expect(page).toHaveURL("/");
  });

  test("홈 체크리스트 버튼: 비로그인 모달 → '로그인 하러 가기' 클릭 → /login?next=/checklist", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "체크리스트 작성하기" }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });

    await page.getByRole("button", { name: "로그인 하러 가기" }).click();

    await page.waitForURL((url) => url.pathname === "/login", { timeout: 10_000 });
    expect(new URL(page.url()).searchParams.get("next")).toBe("/checklist");
  });

  test("홈 체크리스트 버튼: 비로그인 모달 → '취소' 클릭 → 홈 유지", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "체크리스트 작성하기" }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5_000 });

    await page.getByRole("button", { name: "취소" }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page).toHaveURL("/");
  });

  test("홈 체크리스트 버튼: 로그인 상태 → 모달 없이 /checklist 이동", async ({ page }) => {
    await page.context().addCookies([{
      name: "ggosoon-auth",
      value: MOCK_ACCESS_TOKEN,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    }]);

    await page.goto("/");
    await page.getByRole("button", { name: "체크리스트 작성하기" }).click();

    await page.waitForURL("/checklist", { timeout: 10_000 });
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

});

test.describe("체크리스트 페이지 (/checklist) — 인증 가드", () => {

  // ── 비로그인 접근 차단 ──────────────────────────────────────────────

  test("비로그인 사용자가 /checklist 접근 → /login?next=/checklist 리다이렉트", async ({ page }) => {
    await page.goto("/checklist");
    await page.waitForURL((url) => url.pathname === "/login", { timeout: 10_000 });

    // next 파라미터가 /checklist로 설정되어 있어야 함
    const url = new URL(page.url());
    expect(url.searchParams.get("next")).toBe("/checklist");
  });

  test("비로그인 사용자는 체크리스트 폼을 볼 수 없음", async ({ page }) => {
    await page.goto("/checklist");
    await page.waitForURL((url) => url.pathname === "/login", { timeout: 10_000 });

    // 체크리스트 관련 UI가 없어야 함
    await expect(page.getByText("체크리스트 작성하기")).not.toBeVisible();
    await expect(page.getByText("강아지의 특징과 선호하는 간식을 작성해주세요!")).not.toBeVisible();
  });

  // ── 로그인 후 접근 허용 ─────────────────────────────────────────────

  test("로그인된 사용자는 /checklist 접근 가능", async ({ page }) => {
    await loginAndGoTo(page, "/checklist");

    // URL이 /checklist여야 함 (리다이렉트 없음)
    await expect(page).toHaveURL("/checklist");

    // 체크리스트 히어로 섹션이 렌더링 되어야 함
    await expect(
      page.getByRole("region", { name: "체크리스트 페이지 소개" })
    ).toBeVisible({ timeout: 10_000 });
  });

  test("SSR 쿠키로 로그인된 사용자는 /checklist 직접 접근 가능", async ({ page }) => {
    await page.context().addCookies([
      {
        name: "ggosoon-auth",
        value: MOCK_ACCESS_TOKEN,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    await page.goto("/checklist");

    // 리다이렉트 없이 체크리스트 페이지에 머물러야 함
    await expect(page).toHaveURL("/checklist");
    await expect(
      page.getByRole("region", { name: "체크리스트 페이지 소개" })
    ).toBeVisible({ timeout: 10_000 });
  });

  // ── ?next= 연동 ──────────────────────────────────────────────────────

  test("/login?next=/checklist 에서 로그인 → /checklist 로 리다이렉트", async ({ page }) => {
    // 비로그인 상태에서 체크리스트 접근 시 next 파라미터가 보존되어 로그인 후 되돌아와야 함
    await page.goto("/checklist");
    await page.waitForURL((url) => url.pathname === "/login", { timeout: 10_000 });

    // 로그인 수행
    await page.getByPlaceholder("이메일을 입력하세요").fill(
      (await import("../helpers/mockApiServer")).TEST_CREDENTIALS.email
    );
    await page.getByPlaceholder("비밀번호를 입력하세요").fill(
      (await import("../helpers/mockApiServer")).TEST_CREDENTIALS.password
    );
    await page.getByRole("button", { name: "로그인", exact: true }).click();

    // next=/checklist 이므로 /checklist 로 이동해야 함
    await page.waitForURL("/checklist", { timeout: 15_000 });
    await expect(
      page.getByRole("region", { name: "체크리스트 페이지 소개" })
    ).toBeVisible({ timeout: 10_000 });
  });

});
