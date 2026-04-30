import { test, expect } from "@playwright/test";
import { NO_PROFILE_CREDENTIALS } from "../helpers/mockApiServer";
import { loginAndGoTo } from "../helpers/auth";

// ─────────────────────────────────────────────────────────────────────────────
// A. 비밀번호 변경 (/mypage/password)
//
// 레이아웃 주의: PasswordManagementSection은 모바일/데스크톱 DOM을 동시에 렌더링한다.
//   - 모바일 레이아웃(md:hidden): Desktop Chrome에서 display:none → 비상호작용
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
// 미인증: middleware가 /login 으로 리다이렉트 (auth-token 쿠키 없음)
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
// D. 애견 프로필 관리 (/mypage/dog-profile)
//
// SSR 구성:
//   fetchProfile(token)            → GET /v1/profiles    → MOCK_PROFILE (name:"쿠키", weight:3.5, gender:"female")
//   fetchActiveSubscription(token) → GET /v1/subscriptions → MOCK_SUBSCRIPTION
//
// 레이아웃 주의: ProfileManagementSection은 모바일/데스크톱 DOM을 동시에 렌더링한다.
//   - 모바일 레이아웃(md:hidden): Desktop Chrome에서 display:none → 비상호작용
//   - 데스크톱 레이아웃(max-md:hidden): Desktop Chrome에서 표시
// 입력 필드: 데스크톱 #d-name / #d-weight, 모바일 #m-name / #m-weight
// 버튼·에러: .last()로 데스크톱 요소 선택 (모바일 DOM이 앞, 데스크톱이 뒤)
// ─────────────────────────────────────────────────────────────────────────────

test.describe("애견 프로필 관리 (/mypage/dog-profile)", () => {
  test("기존 프로필 → 페이지 렌더링 및 필드 사전 채움", async ({ page }) => {
    await loginAndGoTo(page, "/mypage/dog-profile");

    await expect(page.getByRole("heading", { name: "프로필 관리" }).last()).toBeVisible({
      timeout: 10_000,
    });

    // 이름·품종·몸무게: MOCK_PROFILE 값으로 사전 채움
    await expect(page.locator("#d-name")).toHaveValue("쿠키");
    await expect(page.locator("#d-breed")).toHaveValue("포메라니안");
    await expect(page.locator("#d-weight")).toHaveValue("3.5kg");
  });

  test("몸무게 입력 → 숫자만 유지하고 포커스 해제 시 kg 표시", async ({ page }) => {
    await loginAndGoTo(page, "/mypage/dog-profile");

    await page.locator("#d-weight").clear();
    await page.locator("#d-weight").fill("abc12.3kg");
    await expect(page.locator("#d-weight")).toHaveValue("12.3");

    await page.locator("#d-name").focus();
    await expect(page.locator("#d-weight")).toHaveValue("12.3kg");
  });

  test("강아지 품종 검색 모달 → 세부 품종 선택 시 input 반영", async ({ page }) => {
    await loginAndGoTo(page, "/mypage/dog-profile?new=true");

    await page.getByRole("button", { name: "검색" }).last().click();
    await expect(page.getByRole("dialog", { name: "강아지 품종 검색" })).toBeVisible();

    await page.getByPlaceholder("예) 포메라니안, Pomeranian").fill("비숑");
    await page.getByRole("button", { name: /비숑 프리제/ }).click();

    await expect(page.locator("#d-breed")).toHaveValue("비숑 프리제");
  });

  test("새 프로필 등록 모드 (?new=true) → '프로필 등록' 제목 + 빈 폼", async ({ page }) => {
    await loginAndGoTo(page, "/mypage/dog-profile?new=true");

    await expect(page.getByRole("heading", { name: "프로필 등록" }).last()).toBeVisible({
      timeout: 10_000,
    });

    // isNewProfile=true → 폼 초기값 비어있음
    await expect(page.locator("#d-name")).toHaveValue("");
    await expect(page.locator("#d-breed")).toHaveValue("");
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
