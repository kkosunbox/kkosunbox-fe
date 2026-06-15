import { test, expect } from "@playwright/test";
import { MOCK_ACCESS_TOKEN } from "../helpers/mockApiServer";
import { loginAndGoTo } from "../helpers/auth";

test.describe("체크리스트 — 홈 CTA 버튼", () => {
  // CTA 버튼: "10초 진단하고 우리 아이 맞춤 추천 받기"
  // 비로그인: /login?next=/checklist 직접 이동 (로그인 유도 모달 없음)
  // 로그인(체크리스트 없음): openChecklistForm() → 체크리스트 모달 홈에서 오픈

  test("홈 CTA: 비로그인 → /login 이동", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "10초 진단하고 우리 아이 맞춤 추천 받기" }).first().click();
    await page.waitForURL((url) => url.pathname === "/login", { timeout: 10_000 });
    // /checklist 로 이동하지 않아야 함
    await expect(page).not.toHaveURL("/");
  });

  test("홈 CTA: 비로그인 redirect URL에 next=/checklist 파라미터 포함", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "10초 진단하고 우리 아이 맞춤 추천 받기" }).first().click();
    await page.waitForURL((url) => url.pathname === "/login", { timeout: 10_000 });
    // 로그인 후 체크리스트 흐름으로 이어지도록 next=/checklist
    expect(new URL(page.url()).searchParams.get("next")).toBe("/checklist");
    await expect(page.getByPlaceholder("이메일을 입력하세요")).toBeVisible();
  });

  test("홈 CTA: 로그인(체크리스트 없음) → 체크리스트 모달 오픈", async ({ page }) => {
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
    await page.getByRole("button", { name: "10초 진단하고 우리 아이 맞춤 추천 받기" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10_000 });
  });

  test("홈 CTA: 로그인 → 체크리스트 모달 오픈 + 홈(/) URL 유지", async ({ page }) => {
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
    await page.getByRole("button", { name: "10초 진단하고 우리 아이 맞춤 추천 받기" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL("/");
  });

});

test.describe("체크리스트 페이지 (/checklist) — 인증 가드", () => {

  // ── 비로그인 접근 차단 ──────────────────────────────────────────────

  test("비로그인 사용자가 /checklist 접근 → /login?next=/ 리다이렉트 (무한루프 방지)", async ({ page }) => {
    await page.goto("/checklist");
    await page.waitForURL((url) => url.pathname === "/login", { timeout: 10_000 });

    // 체크리스트는 로그인 필수이므로 next=/checklist로 설정하면 로그인 후 다시 로그인 루프 발생
    // 따라서 next=/ (홈)으로 설정하여 무한 리다이렉트 방지
    const url = new URL(page.url());
    expect(url.searchParams.get("next")).toBe("/");
  });

  test("비로그인 사용자는 체크리스트 폼을 볼 수 없음", async ({ page }) => {
    await page.goto("/checklist");
    await page.waitForURL((url) => url.pathname === "/login", { timeout: 10_000 });

    // 체크리스트 관련 UI가 없어야 함
    await expect(page.getByText("체크리스트 작성하기")).not.toBeVisible();
    await expect(page.getByText("강아지의 특징과 선호하는 간식을 작성해주세요!")).not.toBeVisible();
  });

  // ── 로그인 후 접근 허용 ─────────────────────────────────────────────

  test("로그인된 사용자가 /checklist 접근 → / 로 이동하며 체크리스트 모달 오픈", async ({ page }) => {
    await loginAndGoTo(page, "/checklist");

    // ChecklistRedirectClient가 router.replace("/")를 호출하여 홈으로 이동
    await page.waitForURL("/", { timeout: 10_000 });

    // 체크리스트 모달이 열려야 함
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10_000 });
  });

  test("SSR 쿠키로 로그인된 사용자가 /checklist 직접 접근 → / 로 이동하며 체크리스트 모달 오픈", async ({ page }) => {
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

    // ChecklistRedirectClient가 router.replace("/")를 호출하여 홈으로 이동
    await page.waitForURL("/", { timeout: 10_000 });

    // 체크리스트 모달이 열려야 함
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10_000 });
  });

  // ── ?next= 연동 ──────────────────────────────────────────────────────

  test("/checklist 비로그인 접근 후 로그인 → / 로 이동 (무한루프 방지용 next=/)", async ({ page }) => {
    // 비로그인 상태에서 /checklist 접근 → /login?next=/ 으로 리다이렉트
    // (next=/checklist 이면 로그인 후 다시 /checklist → 로그인 루프 발생)
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

    // next=/ 이므로 홈(/)으로 이동 — 무한 리다이렉트 방지 정책
    await page.waitForURL("/", { timeout: 15_000 });
  });

});
