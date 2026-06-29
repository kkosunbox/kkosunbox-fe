import { test, expect, type Page } from "@playwright/test";
import { MOCK_ACCESS_TOKEN } from "../helpers/mockApiServer";
import { loginAndGoTo, loginByTokens, TEST_TOKENS } from "../helpers/auth";

/**
 * 체크리스트 모달을 step 0(펫 프로필 폼)으로 직접 연다. 홈 CTA 분기에 의존하지 않고
 * isNewProfile/editProfile 옵션을 결정적으로 지정하기 위해 커스텀 이벤트를 디스패치한다.
 * - 먼저 홈 CTA가 보일 때까지 기다려 하이드레이션(이벤트 리스너 등록)을 보장한다.
 * - 채널톡 등 다른 dialog가 아니라 체크리스트 펫폼(이름 입력)을 신호로 삼는다.
 * - 모달이 이미 열렸으면 재디스패치하지 않는다(재디스패치 시 복원 effect가 폼을 리셋함).
 */
async function openChecklistForm(
  page: Page,
  detail: Record<string, unknown>,
) {
  await page
    .getByRole("button", { name: "10초 진단하고 우리 아이 맞춤 추천 받기" })
    .first()
    .waitFor({ state: "visible", timeout: 15_000 });
  // 프로필 로드 완료를 보장한다. activeProfile이 늦게 도착하면 복원 effect가
  // step 0에서 재실행되어 입력값을 리셋하므로, 모달을 열기 전에 기다린다.
  await page
    .getByRole("button", { name: "프로필 메뉴" })
    .first()
    .waitFor({ state: "visible", timeout: 15_000 });
  const nameInput = page.getByPlaceholder("이름");
  await expect(async () => {
    if (!(await nameInput.isVisible())) {
      await page.evaluate((d) => {
        window.dispatchEvent(
          new CustomEvent("ggosoon:open-checklist-form", { detail: d }),
        );
      }, detail);
    }
    await expect(nameInput).toBeVisible({ timeout: 1000 });
  }).toPass({ timeout: 15_000 });
}

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

test.describe("체크리스트 — 모달 내부 흐름 (신규 프로필 작성)", () => {

  test("펫폼 검증 → 질문 응답 → 결과 페이지(tier=standard) 이동", async ({ page }) => {
    await loginByTokens(page, TEST_TOKENS);
    await page.goto("/");
    await openChecklistForm(page, { isNewProfile: true });

    // step 0: 펫 프로필 폼. 이름 미입력이면 CTA disabled
    const petForm = page.getByRole("dialog", { name: "프로필 작성" });
    await expect(petForm).toBeVisible();
    const startCta = petForm.getByRole("button", { name: "체크리스트 작성하기" });
    await expect(startCta).toBeDisabled();

    await petForm.getByPlaceholder("이름").fill("테스트강아지");
    await expect(startCta).toBeEnabled();
    await startCta.click();

    // step 1: 첫 질문. 미응답이면 "다음" disabled
    const qModal = page.getByRole("dialog", { name: "체크리스트 작성" });
    const nextCta = qModal.getByRole("button", { name: "다음", exact: true });
    await expect(nextCta).toBeDisabled();
    await qModal.getByRole("button", { name: "육포 간식" }).click();
    await expect(nextCta).toBeEnabled();
    await nextCta.click();

    // step 2: 마지막 질문 → CTA "결과보기"
    const resultCta = qModal.getByRole("button", { name: "결과보기" });
    await expect(resultCta).toBeDisabled();
    await qModal.getByRole("button", { name: "알레르기 없음" }).click();
    await expect(resultCta).toBeEnabled();
    await resultCta.click();

    // 제출 → 프로필 생성 + 추천 플랜 조회 후 결과 페이지로 이동
    await page.waitForURL((url) => url.pathname === "/checklist/result", { timeout: 15_000 });
    expect(new URL(page.url()).searchParams.get("tier")).toBe("standard");
  });

  test("질문 단계에서 뒤로가기·진행바로 스텝 이동", async ({ page }) => {
    await loginByTokens(page, TEST_TOKENS);
    await page.goto("/");
    await openChecklistForm(page, { isNewProfile: true });

    const petForm = page.getByRole("dialog", { name: "프로필 작성" });
    await petForm.getByPlaceholder("이름").fill("이동테스트");
    await petForm.getByRole("button", { name: "체크리스트 작성하기" }).click();

    const qModal = page.getByRole("dialog", { name: "체크리스트 작성" });
    // Q1 응답 후 Q2로 진행
    await qModal.getByRole("button", { name: "육포 간식" }).click();
    await qModal.getByRole("button", { name: "다음", exact: true }).click();
    await expect(qModal.getByRole("button", { name: "결과보기" })).toBeVisible();

    // 뒤로가기 → Q1 (마지막이 아니므로 "다음"이 보임)
    await qModal.getByRole("button", { name: "이전 단계로" }).click();
    await expect(qModal.getByRole("button", { name: "다음", exact: true })).toBeVisible();
    // 이전 선택이 유지되어 즉시 진행 가능
    await expect(qModal.getByRole("button", { name: "다음", exact: true })).toBeEnabled();

    // 진행바로 방문했던 Q2로 점프 → 마지막이므로 "결과보기"
    await qModal.getByRole("button", { name: "2단계로 이동" }).click();
    await expect(qModal.getByRole("button", { name: "결과보기" })).toBeVisible();
  });

  test("질문 단계 미저장 상태에서 닫기 → 확인 모달 → '계속 작성하기'로 유지, '닫기'로 종료", async ({ page }) => {
    // 미저장 가드는 step>0(질문 단계)부터 변경분을 추적한다(useChecklistDraft.isDirty).
    await loginByTokens(page, TEST_TOKENS);
    await page.goto("/");
    await openChecklistForm(page, { isNewProfile: true });

    const petForm = page.getByRole("dialog", { name: "프로필 작성" });
    await petForm.getByPlaceholder("이름").fill("미저장변경");
    await petForm.getByRole("button", { name: "체크리스트 작성하기" }).click();

    // 질문 단계 진입 → 입력한 내용이 미저장 상태로 추적됨
    const qModal = page.getByRole("dialog", { name: "체크리스트 작성" });
    await expect(qModal.getByRole("button", { name: "다음", exact: true })).toBeVisible();

    // X 버튼 → 미저장 확인 모달
    await qModal.getByRole("button", { name: "닫기" }).click();
    const confirm = page.getByRole("dialog", { name: "작성중인 내용이 있습니다!" });
    await expect(confirm).toBeVisible();

    // "계속 작성하기" → 확인만 닫히고 폼은 유지
    await confirm.getByRole("button", { name: "계속 작성하기" }).click();
    await expect(confirm).toBeHidden();
    await expect(qModal).toBeVisible();

    // 다시 닫기 → "닫기"로 폼 종료
    await qModal.getByRole("button", { name: "닫기" }).click();
    await expect(confirm).toBeVisible();
    await confirm.getByRole("button", { name: "닫기" }).click();
    await expect(qModal).toBeHidden();
  });

});

test.describe("체크리스트 — 프로필 편집 저장 모드 (editProfile)", () => {

  test("기존 값 프리필 + '저장' → 프로필 수정 후 모달 닫힘(네비게이션 없음)", async ({ page }) => {
    await loginByTokens(page, TEST_TOKENS);
    await page.goto("/");
    await openChecklistForm(page, { editProfile: true });

    const petForm = page.getByRole("dialog", { name: "프로필 작성" });
    await expect(petForm).toBeVisible();
    // MOCK_PROFILE 이름 "쿠키"로 프리필
    await expect(petForm.getByPlaceholder("이름")).toHaveValue("쿠키");

    // 편집 모드는 CTA가 "저장"
    const saveCta = petForm.getByRole("button", { name: "저장", exact: true });
    await expect(saveCta).toBeVisible();

    await petForm.getByPlaceholder("이름").fill("쿠키수정");
    await saveCta.click();

    // 저장 후 모달 닫힘 + 결과 페이지로 이동하지 않음
    await expect(petForm).toBeHidden();
    await expect(page).toHaveURL("/");
  });

});
