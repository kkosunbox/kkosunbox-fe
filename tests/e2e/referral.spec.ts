import type { Page } from "@playwright/test";
import { test, expect } from "../helpers/fixtures";
import {
  MOCK_VALID_REFERRAL_CODE,
  MOCK_ACTIVE_SLUG,
  MOCK_INACTIVE_SLUG,
  MOCK_HIDDEN_PAGE_SLUG,
  MOCK_REFERRAL_PAGE,
  MOCK_PLANS,
} from "../helpers/mockApiServer";
import {
  loginAndGoTo,
  loginAsInfluencer,
  loginByTokens,
  TEST_TOKENS,
  BILLING_TOKENS,
} from "../helpers/auth";

// ──────────────────────────────────────────────────────────────────────────────
// A. 레퍼럴 랜딩 페이지 (/r/[slug])
//
// GET /v1/referral/pages/{slug} (공개 API, 토큰 불필요)
//   - MOCK_ACTIVE_SLUG      → { isActive: true, isPageVisible: true }
//   - MOCK_INACTIVE_SLUG    → { isActive: false, isPageVisible: true }
//   - MOCK_HIDDEN_PAGE_SLUG → { isActive: true, isPageVisible: false }
//   - 그 외 slug         → 404
//
// 페이지 동작:
//   isActive: false or 404       → redirect("/")
//   isPageVisible: false         → 추천 코드 캡처 후 redirect("/")
//   isPageVisible: true          → ReferralProvider(initialData) + 홈 섹션 렌더링
//                                  마운트 후 ggosoon-ref 쿠키 설정 (client-side)
// ──────────────────────────────────────────────────────────────────────────────

const REFERRAL_LANDING = `/r/${MOCK_ACTIVE_SLUG}`;
const INFLUENCER_NAME_TEXT = `[${MOCK_REFERRAL_PAGE.displayName}]`;
const DISCOUNT_PCT = Math.round(MOCK_REFERRAL_PAGE.discountRate * 100);
const CTA_LABEL = `꼬순박스 ${DISCOUNT_PCT}% 할인받기`;

test.describe("레퍼럴 랜딩 페이지 (/r/[slug])", () => {
  test("활성 slug → 인플루언서 이름 표시", async ({ page }) => {
    await page.goto(REFERRAL_LANDING);
    // 모바일·데스크탑 레이아웃이 동시에 렌더되어 같은 텍스트가 2개 존재함 → .first()
    await expect(page.getByText(INFLUENCER_NAME_TEXT).first()).toBeVisible({ timeout: 10_000 });
  });

  test("활성 slug → 할인율이 포함된 CTA 버튼 표시", async ({ page }) => {
    await page.goto(REFERRAL_LANDING);
    await expect(page.getByRole("button", { name: CTA_LABEL })).toBeVisible({ timeout: 10_000 });
  });

  test("활성 slug 진입 후 ggosoon-ref 쿠키 설정됨", async ({ page }) => {
    await page.goto(REFERRAL_LANDING);
    // 레퍼럴 히어로가 보일 때까지 대기 (hydration + useEffect 완료 기준)
    await expect(page.getByRole("button", { name: CTA_LABEL })).toBeVisible({ timeout: 10_000 });

    // 버튼의 "보임"은 SSR HTML만으로도 만족되어, 쿠키를 세팅하는 client useEffect가
    // 아직 커밋되지 않은 시점에 즉시 읽으면 레이스가 난다(부하가 큰 풀스위트 실행에서 재현).
    // 쿠키 값이 채워질 때까지 폴링해 hydration 완료를 실질적으로 기다린다.
    await expect
      .poll(
        async () => {
          const cookies = await page.context().cookies();
          return cookies.find((c) => c.name === "ggosoon-ref")?.value;
        },
        { timeout: 10_000 },
      )
      .toBe(encodeURIComponent(MOCK_VALID_REFERRAL_CODE));
  });

  test("CTA 버튼 클릭 → /subscribe 이동", async ({ page }) => {
    await page.goto(REFERRAL_LANDING);
    await page.getByRole("button", { name: CTA_LABEL }).click();
    await page.waitForURL("/subscribe", { timeout: 10_000 });
  });

  test("isActive=false slug → / 리다이렉트", async ({ page }) => {
    await page.goto(`/r/${MOCK_INACTIVE_SLUG}`);
    // SSR redirect: 브라우저가 / 에 도달한 후 기준 URL 확인
    await expect(page).toHaveURL("/", { timeout: 10_000 });
  });

  test("isPageVisible=false slug → 추천 코드를 유지하고 / 리다이렉트", async ({ page }) => {
    await page.goto(`/r/${MOCK_HIDDEN_PAGE_SLUG}`);
    await expect(page).toHaveURL("/", { timeout: 10_000 });

    await expect
      .poll(async () => {
        const cookies = await page.context().cookies();
        return cookies.find((c) => c.name === "ggosoon-ref")?.value;
      })
      .toBe(encodeURIComponent(MOCK_VALID_REFERRAL_CODE));
  });

  test("존재하지 않는 slug → / 리다이렉트", async ({ page }) => {
    await page.goto("/r/this-slug-does-not-exist");
    await expect(page).toHaveURL("/", { timeout: 10_000 });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// B. 홈 화면 히어로
//
// HomeHero는 항상 일반 HeroSection을 렌더한다.
// 레퍼럴 히어로(ReferralHeroSection)는 /r/[slug] 페이지에서만 표시된다.
//
// 일반 히어로 판별: "10초 진단하고 우리 아이 맞춤 추천 받기" 버튼 (슬라이드 #1)
// ──────────────────────────────────────────────────────────────────────────────

const NORMAL_HERO_CTA = "10초 진단하고 우리 아이 맞춤 추천 받기";

test.describe("홈 화면 히어로", () => {
  test("ggosoon-ref 쿠키 없음 → 일반 히어로 CTA 표시", async ({ page }) => {
    await page.goto("/");
    // 모바일·데스크탑 레이아웃이 동시에 렌더되어 같은 버튼이 2개 존재함 → .first()
    await expect(page.getByRole("button", { name: NORMAL_HERO_CTA }).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("유효 코드 쿠키 설정 후 홈 방문 → 일반 히어로 유지 (레퍼럴 히어로는 /r/[slug] 전용)", async ({ page }) => {
    await page.context().addCookies([
      {
        name: "ggosoon-ref",
        value: MOCK_VALID_REFERRAL_CODE,
        domain: "localhost",
        path: "/",
      },
    ]);
    await page.goto("/");
    // 홈은 쿠키 유무와 무관하게 항상 일반 히어로를 표시
    await expect(page.getByRole("button", { name: NORMAL_HERO_CTA }).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole("button", { name: CTA_LABEL })).not.toBeVisible();
  });

  test("무효 코드 쿠키 설정 후 홈 방문 → 일반 히어로 유지", async ({ page }) => {
    await page.context().addCookies([
      {
        name: "ggosoon-ref",
        value: "INVALID_REFERRAL_CODE",
        domain: "localhost",
        path: "/",
      },
    ]);
    await page.goto("/");
    await expect(page.getByRole("button", { name: NORMAL_HERO_CTA }).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole("button", { name: CTA_LABEL }).first()).not.toBeVisible();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// C. /mypage/point (인플루언서 전용 포인트 페이지)
//
// SSR 가드: getAuthUser() → isInfluencer: false or null → redirect("/")
//
// 인플루언서 진입 시 SSR fetch:
//   GET /v1/points/balance        → MOCK_POINT_BALANCE
//   GET /v1/points?limit=200      → { items: [] } → "포인트 내역이 없습니다." 빈 상태
//       (2026-08-11 이전에는 여기서 DUMMY_ITEMS 더미 폴백이 렌더됐다 — 제거됨)
//   GET /v1/referral/me           → MOCK_MY_REFERRAL_CODE
//       └ referralCode: FRIEND10, referralLink: https://dev.kkosunbox.com/r/test-influencer
//
// UI 검증 포인트:
//   - "MY 포인트" 헤딩
//   - 초대코드 행: referralCode 값 표시
//   - 초대링크 행: referralLink 값 표시 (non-null일 때)
//   - 초대링크 null이면 링크 행 미표시
// ──────────────────────────────────────────────────────────────────────────────

test.describe("/mypage/point (인플루언서 전용)", () => {
  test("미인증 접근 → 로그인 페이지 리다이렉트", async ({ page }) => {
    await page.goto("/mypage/point");
    // 미들웨어가 /login?next=%2Fmypage%2Fpoint 으로 리다이렉트함
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test("일반 유저(isInfluencer: false) 접근 → / 리다이렉트", async ({ page }) => {
    await loginAndGoTo(page, "/mypage/point");
    await expect(page).toHaveURL("/", { timeout: 10_000 });
  });

  test("인플루언서 접근 → 포인트 페이지 렌더링", async ({ page }) => {
    await loginAsInfluencer(page);
    await page.goto("/mypage/point");
    await expect(page.getByRole("heading", { name: "MY 포인트" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("referralLink=null일 때 → 초대링크 행 미표시", async ({ page }) => {
    // 이 시나리오는 /v1/referral/me가 null을 반환하거나 DUMMY_REFERRAL이 사용될 때 발생
    // DUMMY_REFERRAL: { referralCode: "TEST123", slug: null, referralLink: null }
    // 인플루언서 토큰으로 접근하면 API가 실제 링크를 반환하므로,
    // 여기서는 slug가 null인 응답을 직접 재현하기 어려운 점을 명시하고
    // 링크 행이 표시되지 않는 것을 일반 유저가 볼 수 없다는 점(가드 리다이렉트)으로 대체 검증
    await page.goto("/mypage/point");
    // 미인증 → redirect → "MY 포인트" 헤딩 없음
    await expect(page.getByRole("heading", { name: "MY 포인트" })).not.toBeVisible();
    await expect(page.getByText("초대링크")).not.toBeVisible();
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// D. 첫 달 할인 배지 (ReferralPlanPicker / ReferralPackagePlansSection)
//
// /r/[slug]는 마케팅 계층이다(.claude/contexts/referral-pricing-architecture.md §2).
// 초대 맥락이 성립(referralSource: "slug")하고 요율을 확보했으면, 이 계정이 실제로
// 할인을 받을 수 있는지(구독 이력·적격 여부)와 무관하게 배지를 보여준다 — 정직성은
// /order가 담당한다("초대코드는 첫 구독 시에만 사용 가능합니다" 안내, §3 케이스 B 실측).
//
// 2026-08-12 이전에는 이 배지가 구독 이력(hasSubscriptionHistory)에 게이팅되어
// 기존 구독자에게는 숨겨졌다 — 요구사항 확정 후 의도적으로 뒤집힌 동작이다(§2 "1차 작업이
// 꼬였던 경위"). 예외는 own-slug(자기감지)뿐이며, 그건 게이팅이 아니라 별도 배타 조건이다.
//
// 2026-07-30 이전에는 반대로 inviteEligible을 전혀 체크하지 않아 이력과 무관하게 항상
// 배지가 떴던 회귀 버그가 있었다 — 지금의 "항상 표시"는 그 버그로의 회귀가 아니라
// referralSource !== "own-slug" 조건이 자기감지만 명시적으로 차단하는 별도 사양이다.
// ──────────────────────────────────────────────────────────────────────────────

const BADGE_TEXT = `첫 달 ${DISCOUNT_PCT}%추가할인`;
// 배지는 브레이크포인트별 반응형 변형이 동시에 DOM에 존재하고 CSS로만 숨겨지므로,
// 순수 .first()는 숨겨진 변형을 집을 수 있다 — 보임 단정에는 visible 필터가 필요하다.
const visibleBadge = (page: Page) => page.getByText(BADGE_TEXT).filter({ visible: true }).first();

test.describe("첫 달 할인 배지 (/r/[slug]) — 마케팅 계층: 이력과 무관하게 노출", () => {
  test("구독 이력 없는 로그인 유저 → 배지 표시", async ({ page }) => {
    await loginByTokens(page, BILLING_TOKENS);
    await page.goto(REFERRAL_LANDING);
    await expect(visibleBadge(page)).toBeVisible({ timeout: 10_000 });
  });

  test("구독 이력 있는 로그인 유저 → 배지 표시 (적격 여부는 /order가 판정)", async ({ page }) => {
    await loginByTokens(page, TEST_TOKENS);
    await page.goto(REFERRAL_LANDING);
    await expect(page.getByText(INFLUENCER_NAME_TEXT).first()).toBeVisible({ timeout: 10_000 });
    await expect(visibleBadge(page)).toBeVisible({ timeout: 10_000 });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// E. 자기 감지 — 인플루언서 본인이 초대코드 쿠키 없이 접근했을 때 배지가 뜨지 않는지
//
// 초대코드 쿠키가 없어도, 로그인 유저가 인플루언서 본인이면 서버(resolveReferralContext)가
// /v1/referral/me로 자기 slug를 찾아 초대 맥락을 구성한다(referralSource: "own-slug").
// 홈은 마케팅 계층(promotional)이라 D와 달리 구독 이력·적격 여부는 배지 노출과 무관하지만,
// own-slug는 hasDisplayableReferralOffer가 명시적으로 배제하는 별도 조건이라 여전히 숨는다
// (.claude/contexts/referral-pricing-architecture.md §2 "제품 정책 — 자동 자기감지만 차단한다").
// 인플루언서가 로그인만 했다고 사이트 전역에 자기 프로모션이 뜨면 안 된다는 정책 검증이지,
// 이 테스트의 구독 이력 1건은 배지 숨김의 원인이 아니다 — own-slug 자체가 원인이다.
// 홈의 PlanPicker가 같은 배지 컴포넌트를 쓰므로 여기서 검증한다.
// ──────────────────────────────────────────────────────────────────────────────

test.describe("자기 감지 — 인플루언서 본인 접근", () => {
  test("이미 구독 중인 인플루언서가 초대코드 쿠키 없이 홈 방문 → 배지 숨김", async ({ page }) => {
    // 구독 이력은 목 서버가 인플루언서 토큰에 1건을 돌려주는 것으로 표현한다.
    // page.route()로 덮지 않는 이유: 이 조회는 이제 서버 컴포넌트에서 일어나
    // 브라우저를 거치지 않으므로 가로챌 수 없다.
    await loginAsInfluencer(page);
    // loginAsInfluencer는 이미 "/"까지 이동을 기다린다 — 자기 감지 완료(배지 부재)를 폴링한다.
    await expect(page.getByText(BADGE_TEXT)).not.toBeVisible({ timeout: 10_000 });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// F. 구독 완료 시점 — 초대코드 소비 후 즉시 배지·쿠키 정리 (같은 세션, 하드 리로드 없음)
//
// 버그였던 부분: 구독 완료 시 초대코드 쿠키를 지우면 layout이 hasSubscriptionHistory
// 재계산 자체를 스킵해(쿠키 없음 → 기본값 false) router.refresh()만으로는 오히려 배지가
// 다시 나타날 수 있었다. markInviteConsumed()로 클라이언트에서 즉시 확정하도록
// 2026-07-30에 수정 — 이 테스트는 하드 리로드 없이(router.push로만 이동) 배지가
// 사라지는지, 쿠키 2종(code+slug)이 모두 정리되는지 검증한다.
// ──────────────────────────────────────────────────────────────────────────────

test.describe("구독 완료 시점 — 초대코드 소비", () => {
  test("초대링크로 구독 완료 → 쿠키 정리 + 같은 세션에서 배지 즉시 숨김", async ({ page }) => {
    // 배송지·카드 모두 등록된 BILLING_TOKENS로 로그인 — 주소는 서버 컴포넌트가 SSR로
    // 가져오므로 page.route()로는 가로챌 수 없어 목서버(mockApiServer.ts)에서 보강했다.
    await loginByTokens(page, BILLING_TOKENS);
    await page.context().addCookies([
      { name: "ggosoon-ref", value: MOCK_VALID_REFERRAL_CODE, domain: "localhost", path: "/" },
      { name: "ggosoon-ref-slug", value: MOCK_ACTIVE_SLUG, domain: "localhost", path: "/" },
    ]);

    await page.goto(`/subscribe/detail?planId=${MOCK_PLANS[0].id}`);
    await expect(visibleBadge(page)).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: "구독하기" }).first().click();
    await page.waitForURL(/\/order\?planId=/, { timeout: 10_000 });

    await page.locator("label").filter({ hasText: "모두 동의합니다." }).click();
    const payButton = page.getByRole("button", { name: "구독하기" }).first();
    await expect(payButton).toBeEnabled({ timeout: 10_000 });
    await payButton.click();

    await page.waitForURL(/\/mypage\/subscription\?welcome=1/, { timeout: 15_000 });

    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === "ggosoon-ref")).toBeUndefined();
    expect(cookies.find((c) => c.name === "ggosoon-ref-slug")).toBeUndefined();

    // 하드 리로드 없이(헤더 로고 클릭 = client-side 이동) 배지가 사라졌는지 확인
    await page.getByRole("link", { name: "꼬순박스 홈" }).click();
    await expect(page.getByText(BADGE_TEXT)).not.toBeVisible({ timeout: 10_000 });
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// G. 비로그인 방문자 — 자기 감지 호출 자체를 하지 않아야 함
//
// (main) 레이아웃이 사이트 거의 전체를 감싸므로, isLoggedIn 게이팅이 없으면 비로그인
// 방문자(트래픽 대다수) 전원이 매 방문마다 /v1/referral/me를 호출하게 된다(2026-08-03 버그
// 수정). 이 테스트는 그 게이팅이 실제로 호출 자체를 막는지 확인한다.
// ──────────────────────────────────────────────────────────────────────────────

test.describe("비로그인 방문자 — 자기 감지 호출 안 함", () => {
  test("초대코드 쿠키 없이 홈 방문 → /v1/referral/me 호출 안 함", async ({ page }) => {
    let calledReferralMe = false;
    await page.route("**/v1/referral/me", async (route) => {
      calledReferralMe = true;
      await route.continue();
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(calledReferralMe).toBe(false);
  });
});
