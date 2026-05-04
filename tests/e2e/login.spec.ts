import { test, expect } from "@playwright/test";
import {
  TEST_CREDENTIALS,
  TRIGGER_SERVER_ERROR_EMAIL,
  MOCK_ACCESS_TOKEN,
  MOCK_REFRESH_TOKEN,
} from "../helpers/mockApiServer";
import { loginAndGoTo } from "../helpers/auth";

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

  // ── 빈 필드 제출 ────────────────────────────────────────────────

  test("이메일/비밀번호 빈 채로 제출 → 에러 메시지 표시 (클라이언트 검증 없음)", async ({ page }) => {
    await page.goto("/login");

    // 아무것도 입력하지 않고 제출 — required 속성 없어서 API까지 도달함
    await page.getByRole("button", { name: "로그인", exact: true }).click();

    await expect(
      page.getByText("아이디 또는 비밀번호가 올바르지 않습니다.")
    ).toBeVisible({ timeout: 10_000 });

    await expect(page).toHaveURL("/login");
  });

  // ── 서버 오류(5xx) ───────────────────────────────────────────────

  test("서버 오류(5xx) → 폴백 에러 메시지 표시, 로그인 페이지 유지", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("이메일을 입력하세요").fill(TRIGGER_SERVER_ERROR_EMAIL);
    await page.getByPlaceholder("비밀번호를 입력하세요").fill("anypassword");
    await page.getByRole("button", { name: "로그인", exact: true }).click();

    // 500 → loginAction의 getErrorMessage fallback (INTERNAL_SERVER_ERROR는 맵에 없음)
    await expect(
      page.getByText("로그인 중 오류가 발생했습니다.")
    ).toBeVisible({ timeout: 10_000 });

    await expect(page).toHaveURL("/login");
  });

  // ── ?next= 리다이렉트 ────────────────────────────────────────────

  test("?next= 파라미터 — 로그인 성공 시 지정 경로로 리다이렉트", async ({ page }) => {
    await page.goto("/login?next=/subscribe");

    await page.getByPlaceholder("이메일을 입력하세요").fill(TEST_CREDENTIALS.email);
    await page.getByPlaceholder("비밀번호를 입력하세요").fill(TEST_CREDENTIALS.password);
    await page.getByRole("button", { name: "로그인", exact: true }).click();

    // "/"가 아닌 "/subscribe"로 이동해야 함
    await page.waitForURL("/subscribe", { timeout: 15_000 });
  });

  // ── 세션 유지 ───────────────────────────────────────────────────

  test("로그인 후 새로고침 — 쿠키 기반 인증 상태 유지", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("이메일을 입력하세요").fill(TEST_CREDENTIALS.email);
    await page.getByPlaceholder("비밀번호를 입력하세요").fill(TEST_CREDENTIALS.password);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await page.waitForURL("/", { timeout: 15_000 });

    // 새로고침 후 SSR이 쿠키로 세션을 복구해야 함
    await page.reload();

    await expect(page.getByRole("button", { name: "프로필 메뉴" })).toBeVisible({
      timeout: 10_000,
    });
  });

  // ── 이미 로그인된 사용자의 /login 접근 (프로덕션 버그 재현) ──────

  test("SSR 쿠키로 로그인 상태인 사용자가 /login 접근 → / 로 리다이렉트", async ({ page }) => {
    // ggosoon-auth 쿠키를 직접 주입해 SSR이 로그인 상태를 인식하도록 설정
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

    await page.goto("/login");

    // 로그인 상태를 감지해 / 로 리다이렉트 되어야 함
    await page.waitForURL("/", { timeout: 10_000 });

    // 헤더에 프로필 버튼이 보여야 함 (로그인 버튼 없음)
    await expect(page.getByRole("button", { name: "프로필 메뉴" })).toBeVisible();
    await expect(page.getByRole("link", { name: "로그인" })).not.toBeVisible();
  });

  test("로그인 성공 후 /login 재접근 → / 로 리다이렉트 (무한루프 버그 재현)", async ({ page }) => {
    // 1. 정상 로그인
    await page.goto("/login");
    await page.getByPlaceholder("이메일을 입력하세요").fill(TEST_CREDENTIALS.email);
    await page.getByPlaceholder("비밀번호를 입력하세요").fill(TEST_CREDENTIALS.password);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await page.waitForURL("/", { timeout: 15_000 });

    // 2. 로그인된 상태에서 헤더의 "로그인" 버튼이 사라짐을 확인
    await expect(page.getByRole("link", { name: "로그인" })).not.toBeVisible();

    // 3. /login 페이지 재접근 (버그 시나리오: 헤더의 로그인 버튼이 잘못 표시되어 클릭하는 경우)
    await page.goto("/login");

    // 4. 로그인 폼이 보이지 않고 / 로 리다이렉트 되어야 함 (무한루프 방지)
    await page.waitForURL("/", { timeout: 10_000 });
    await expect(page.getByRole("button", { name: "프로필 메뉴" })).toBeVisible();
  });

  test("localStorage refreshToken만 있는 경우 /login 접근 → 세션 복구 후 / 로 리다이렉트", async ({ page }) => {
    // localStorage에 refreshToken 주입 (SSR 쿠키는 없음 — 만료된 것처럼 시뮬레이션)
    await page.goto("/");
    await page.evaluate(
      ([key, token]) => localStorage.setItem(key, token),
      ["ggosoon:refresh_token", MOCK_REFRESH_TOKEN],
    );

    // /login 으로 이동
    await page.goto("/login");

    // 클라이언트 세션 복구(refreshToken → accessToken)가 완료되면 / 로 리다이렉트
    await page.waitForURL("/", { timeout: 15_000 });
    await expect(page.getByRole("button", { name: "프로필 메뉴" })).toBeVisible();
  });

  // ── 버튼 비활성화 ────────────────────────────────────────────────

  test("로그인 요청 중 버튼 비활성화 (이중 제출 방지)", async ({ page }) => {
    // Server Action은 브라우저 → Next.js로 POST 요청으로 전달된다.
    // 응답 지연을 걸어 isPending 상태를 안정적으로 관찰한다.
    await page.route(
      (url) => url.pathname === "/login",
      async (route) => {
        if (route.request().method() === "POST") {
          await new Promise<void>((r) => setTimeout(r, 500));
        }
        await route.continue();
      },
    );

    await page.goto("/login");
    await page.getByPlaceholder("이메일을 입력하세요").fill(TEST_CREDENTIALS.email);
    await page.getByPlaceholder("비밀번호를 입력하세요").fill(TEST_CREDENTIALS.password);

    await page.getByRole("button", { name: "로그인", exact: true }).click();

    // isPending 동안 텍스트가 "로그인 중..."으로 바뀌고 disabled 상태여야 함
    await expect(
      page.getByRole("button", { name: "로그인 중...", exact: true })
    ).toBeDisabled();

    // 지연 해제 후 정상 완료 확인
    await page.waitForURL("/", { timeout: 15_000 });
  });

  // ── 세션 만료 처리 ───────────────────────────────────────────────

  test("만료된 쿠키 + 만료된 refreshToken → 비로그인 상태, 홈에 그대로 유지", async ({ page }) => {
    // 만료된 accessToken 쿠키와 유효하지 않은 refreshToken을 주입해
    // 3~4일 방치 후 재접속 시나리오를 시뮬레이션한다.
    await page.goto("/");
    await page.context().addCookies([{
      name: "ggosoon-auth",
      value: "stale-access-token",
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    }]);
    await page.evaluate(() => {
      localStorage.setItem("ggosoon:refresh_token", "stale-refresh-token");
    });

    // 만료된 세션으로 홈 재방문 — SSR은 null 반환, 클라이언트 복구도 실패
    await page.goto("/");

    // 복구 실패 후 비로그인 상태로 표시되어야 함
    await expect(page.getByRole("link", { name: "로그인" })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("button", { name: "프로필 메뉴" })).not.toBeVisible();

    // 비로그인 홈 방문이므로 /login으로 강제 이동하면 안 됨
    await expect(page).toHaveURL("/");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 로그아웃 플로우
// ───────────────────────────────────────────────────���─────────────────────────

test.describe("로그아웃 플로우", () => {
  test("헤더 프로필 드롭다운 로그아웃 → /login 리다이렉트 + 비로그인 헤더", async ({ page }) => {
    // 1. 로그인
    await page.goto("/login");
    await page.getByPlaceholder("이메일을 입력하세요").fill(TEST_CREDENTIALS.email);
    await page.getByPlaceholder("비밀번호를 입력하세요").fill(TEST_CREDENTIALS.password);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await page.waitForURL("/", { timeout: 15_000 });
    await expect(page.getByRole("button", { name: "프로필 메뉴" })).toBeVisible();

    // 2. 프로필 드롭다운 열기
    await page.getByRole("button", { name: "프로필 메뉴" }).click();
    await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();

    // 3. 로그아웃 클릭
    await page.getByRole("button", { name: "로그아웃" }).click();

    // 4. /login 으로 리다이렉트, 비로그인 헤더 상태
    await page.waitForURL("/login", { timeout: 10_000 });
    await expect(page.getByRole("link", { name: "로그인" })).toBeVisible();
    await expect(page.getByRole("button", { name: "프로필 메뉴" })).not.toBeVisible();
  });

  test("로그아웃 후 보호된 경로(/mypage) 직접 접근 → /login 리다이렉트", async ({ page }) => {
    // 1. 로그인
    await page.goto("/login");
    await page.getByPlaceholder("이메일을 입력하세요").fill(TEST_CREDENTIALS.email);
    await page.getByPlaceholder("비밀번호를 입력하세요").fill(TEST_CREDENTIALS.password);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await page.waitForURL("/", { timeout: 15_000 });

    // 2. 로그아웃
    await page.getByRole("button", { name: "프로필 메뉴" }).click();
    await page.getByRole("button", { name: "로그아웃" }).click();
    await page.waitForURL("/login", { timeout: 10_000 });

    // 3. 보호된 경로로 직접 접근 → proxy가 /login 으로 리다이렉트해야 함
    await page.goto("/mypage");
    await page.waitForURL(/\/login/, { timeout: 10_000 });
  });

  test("로그아웃 후 localStorage refreshToken 및 쿠키 정리", async ({ page }) => {
    // 1. 로그인 후 localStorage에 토큰이 저장되었는지 확인
    await page.goto("/login");
    await page.getByPlaceholder("이메일을 입력하세요").fill(TEST_CREDENTIALS.email);
    await page.getByPlaceholder("비밀번호를 입력하세요").fill(TEST_CREDENTIALS.password);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await page.waitForURL("/", { timeout: 15_000 });

    const refreshTokenAfterLogin = await page.evaluate(() =>
      localStorage.getItem("ggosoon:refresh_token")
    );
    expect(refreshTokenAfterLogin).toBeTruthy();

    const cookiesAfterLogin = await page.context().cookies();
    expect(cookiesAfterLogin.some((c) => c.name === "ggosoon-auth")).toBe(true);

    // 2. 로그아웃
    await page.getByRole("button", { name: "프로필 메뉴" }).click();
    await page.getByRole("button", { name: "로그아웃" }).click();
    await page.waitForURL("/login", { timeout: 10_000 });

    // 3. localStorage refreshToken 정리 확인
    const refreshTokenAfterLogout = await page.evaluate(() =>
      localStorage.getItem("ggosoon:refresh_token")
    );
    expect(refreshTokenAfterLogout).toBeNull();

    // 4. ggosoon-auth 쿠키 정리 확인
    const cookiesAfterLogout = await page.context().cookies();
    expect(cookiesAfterLogout.some((c) => c.name === "ggosoon-auth")).toBe(false);
  });

  test("로그인 상태에서 API 401 UNAUTHORIZED → 자동 로그아웃 + /login 리다이렉트", async ({ page }) => {
    // 1. 로그인 후 로그인 상태 확인
    await loginAndGoTo(page, "/");
    await expect(page.getByRole("button", { name: "프로필 메뉴" })).toBeVisible({ timeout: 10_000 });

    // 2. ggosoon:unauthorized 이벤트 수동 발행 — 서버 API 401 UNAUTHORIZED 응답 시뮬레이션
    //    AuthProvider의 이벤트 핸들러가 user !== null 조건을 확인하고 logout()을 호출한다.
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("ggosoon:unauthorized"));
    });

    // 3. /login 으로 자동 리다이렉트
    await page.waitForURL("/login", { timeout: 10_000 });

    // 4. 비로그인 상태로 전환 확인
    await expect(page.getByRole("link", { name: "로그인" })).toBeVisible();
    await expect(page.getByRole("button", { name: "프로필 메뉴" })).not.toBeVisible();
  });
});
