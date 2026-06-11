import { test, expect } from "@playwright/test";
import { NO_PROFILE_CREDENTIALS } from "../helpers/mockApiServer";
import { loginAndGoTo } from "../helpers/auth";

// ─────────────────────────────────────────────────────────────────────────────
// A. 비밀번호 변경 (/mypage/password)
//
// 레이아웃 주의: PasswordManagementSection은 모바일/데스크톱 DOM을 동시에 렌더링한다.
//   - 모바일 레이아웃(lg:hidden): Desktop Chrome에서 display:none → 비상호작용
//   - 데스크톱 레이아웃(max-md:hidden): Desktop Chrome에서 표시
// 데스크톱 전용 id 속성(#current-password 등)을 사용해 strict mode 위반을 방지한다.
// 버튼·에러 메시지는 두 레이아웃 모두 동일한 텍스트를 가지므로 .last()로 데스크톱 요소를 선택.
// ─────────────────────────────────────────────────────────────────────────────

test.describe("비밀번호 변경 (/mypage/password)", () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoTo(page, "/mypage/password");
  });

  test("현재 비밀번호 빈칸 제출 → 인라인 에러", async ({ page }) => {
    await page.getByRole("button", { name: "변경 완료" }).last().click();
    await expect(page.getByText("현재 비밀번호를 입력해주세요.").last()).toBeVisible();
  });

  test("새 비밀번호 빈칸 제출 → 인라인 에러", async ({ page }) => {
    await page.locator("#current-password").fill("currentPass1!");
    await page.getByRole("button", { name: "변경 완료" }).last().click();
    await expect(page.getByText("새 비밀번호를 입력해주세요.").last()).toBeVisible();
  });

  test("새 비밀번호 8자 미만 → 인라인 에러", async ({ page }) => {
    await page.locator("#current-password").fill("currentPass1!");
    await page.locator("#new-password").fill("short1!");
    await page.getByRole("button", { name: "변경 완료" }).last().click();
    await expect(page.getByText("새 비밀번호는 최소 8자 이상이어야 합니다.").last()).toBeVisible();
  });

  test("비밀번호 확인 불일치 → 인라인 에러", async ({ page }) => {
    await page.locator("#current-password").fill("currentPass1!");
    await page.locator("#new-password").fill("newPassword1!");
    await page.locator("#confirm-password").fill("differentPass1!");
    await page.getByRole("button", { name: "변경 완료" }).last().click();
    await expect(page.getByText("새 비밀번호가 일치하지 않습니다.").last()).toBeVisible();
  });

  test("현재 비밀번호 = 새 비밀번호 동일 → 인라인 에러", async ({ page }) => {
    await page.locator("#current-password").fill("samePassword1!");
    await page.locator("#new-password").fill("samePassword1!");
    await page.locator("#confirm-password").fill("samePassword1!");
    await page.getByRole("button", { name: "변경 완료" }).last().click();
    await expect(
      page.getByText("새 비밀번호를 기존 비밀번호와 다르게 입력해주세요.").last()
    ).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// C. 마이페이지 대시보드 (/mypage)
//
// SSR 구성:
//   fetchProfile     → GET /v1/profiles   (빈 배열이면 profile=null)
//   fetchActiveSubscription → GET /v1/subscriptions
//   fetchBillingInfo → GET /v1/billing
//   fetchInquiries   → GET /v1/inquiries  (.catch() → [])
//   fetchChecklistQuestions → GET /v1/profiles/checklist (.catch() → [])
//
// 미인증: middleware가 /login 으로 리다이렉트 (ggosoon-auth 쿠키 없음)
// 구독 없는 유저: MOCK_NO_PROFILE_ACCESS_TOKEN → /v1/subscriptions = [] → null → "아직 구독 전이시군요!"
// ─────────────────────────────────────────────────────────────────────────────

test.describe("마이페이지 대시보드 (/mypage)", () => {
  test("미인증 접근 → /login 리다이렉트", async ({ page }) => {
    await page.goto("/mypage");
    await page.waitForURL(/\/login/, { timeout: 10_000 });
  });

  test("인증 유저 → 대시보드 주요 섹션 렌더링", async ({ page }) => {
    await loginAndGoTo(page, "/mypage");

    // 프로필명 (h1)
    await expect(page.getByRole("heading", { name: "쿠키", level: 1 })).toBeVisible({
      timeout: 10_000,
    });

    // 활성 구독 → "구독관리" 링크 + 플랜명
    await expect(page.getByRole("link", { name: "구독관리" })).toBeVisible();
    await expect(page.getByText("베이직 패키지 BOX 구독중")).toBeVisible();

    // DeliveryCard 섹션 헤더
    await expect(page.getByText("배송관리")).toBeVisible();

    // 문의 없음 → 빈 상태 메시지
    await expect(page.getByText("문의 내역이 없습니다.")).toBeVisible();
  });

  test("구독 없는 유저 → '아직 구독 전이시군요!' 표시", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("이메일을 입력하세요").fill(NO_PROFILE_CREDENTIALS.email);
    await page.getByPlaceholder("비밀번호를 입력하세요").fill(NO_PROFILE_CREDENTIALS.password);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await page.waitForURL("/", { timeout: 15_000 });
    await page.goto("/mypage");

    await expect(page.getByText("아직 구독 전이시군요!")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("link", { name: "구독하러 가기" })).toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B. 구독 변경 (/mypage/subscription/change)
//
// SSR 리다이렉트 로직:
//   활성 구독 없음 → redirect("/mypage/subscription")
//   활성 구독 있음 → SubscriptionChangePlansSection 렌더링
//
// "구독 없음" 시나리오: NO_PROFILE 유저 사용.
//   /v1/subscriptions → 빈 배열 (MOCK_ACCESS_TOKEN 외 토큰) → subscription=null → redirect
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// D. 애견 프로필 수정 (ChecklistFormModal — /mypage 정보변경)
// ─────────────────────────────────────────────────────────────────────────────

test.describe("애견 프로필 수정 (마이페이지 정보변경)", () => {
  test("/mypage/dog-profile → /mypage 리다이렉트", async ({ page }) => {
    await loginAndGoTo(page, "/mypage/dog-profile");
    await page.waitForURL("/mypage", { timeout: 10_000 });
  });

  // 주의: 모달 본문(ChecklistPetForm)은 체크리스트 질문 로드 후에만 렌더된다.
  // authed + mock API 경로의 데이터 로드 이슈(e2e-test-status.md 분류 B)로
  // 현재 환경에서는 폼 필드 값 사전 채움까지 검증할 수 없어, 모달이
  // editProfile 모드("프로필 작성")로 열리는 것까지만 검증한다.
  test("정보변경 클릭 → 프로필 작성 모달 열림", async ({ page }) => {
    await loginAndGoTo(page, "/mypage");

    await page.getByRole("button", { name: "정보변경" }).first().click();

    const modal = page.getByRole("dialog", { name: "프로필 작성" });
    await expect(modal).toBeVisible({ timeout: 10_000 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B-sub. 구독 변경 (/mypage/subscription/change)
// (이하 원래 describe 유지)
// ─────────────────────────────────────────────────────────────────────────────

test.describe("구독 변경 (/mypage/subscription/change)", () => {
  test("구독 없는 유저 접근 → /mypage/subscription 리다이렉트", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("이메일을 입력하세요").fill(NO_PROFILE_CREDENTIALS.email);
    await page.getByPlaceholder("비밀번호를 입력하세요").fill(NO_PROFILE_CREDENTIALS.password);
    await page.getByRole("button", { name: "로그인", exact: true }).click();
    await page.waitForURL("/", { timeout: 15_000 });
    await page.goto("/mypage/subscription/change");
    await page.waitForURL("/mypage/subscription", { timeout: 10_000 });
  });

  test("활성 구독 유저 접근 → 플랜 변경 화면 렌더링", async ({ page }) => {
    await loginAndGoTo(page, "/mypage/subscription/change");
    // 히어로 이미지의 alt 텍스트로 페이지 진입 확인
    await expect(
      page.getByAltText("기존 구독을 변경하려면 새로운 구독을 선택하세요.")
    ).toBeVisible({ timeout: 10_000 });
  });
});
