import { createServer, IncomingMessage, ServerResponse } from "http";

// Test credentials — must match what's used in the test spec
export const TEST_CREDENTIALS = {
  email: "test@example.com",
  password: "Test1234!",
};

// 프로필이 없는 인증 유저 — 프로필이 선택 사항임을 검증하는 E2E용
export const NO_PROFILE_CREDENTIALS = {
  email: "noprofile@example.com",
  password: "Test1234!",
};

// 서버 오류(5xx) 시나리오를 트리거하는 이메일
export const TRIGGER_SERVER_ERROR_EMAIL = "server-error@example.com";

export const MOCK_ACCESS_TOKEN = "mock-access-token-for-testing";
export const MOCK_REFRESH_TOKEN = "mock-refresh-token-for-testing";

export const MOCK_NO_PROFILE_ACCESS_TOKEN = "mock-no-profile-access-token-for-testing";
export const MOCK_NO_PROFILE_REFRESH_TOKEN = "mock-no-profile-refresh-token-for-testing";

// 결제수단(카드)이 이미 등록된 유저 — order 페이지의 "카드 등록 필요" 분기와 분리해서
// 약관 동의 등 다른 결제하기 활성화 조건만 검증할 때 사용
export const MOCK_BILLING_ACCESS_TOKEN = "mock-billing-access-token-for-testing";
export const MOCK_BILLING_REFRESH_TOKEN = "mock-billing-refresh-token-for-testing";

/**
 * 프로필 가입일 — **고정 날짜가 아니라 오늘 기준 상대값**으로 만든다.
 *
 * `WithdrawConfirmSection`의 `daysSince()`가 `new Date()`(실행 시각)로
 * "꼬순박스와 함께한 지 N일째"를 계산한다. `createdAt`을 고정 날짜로 두면 N이 **매일 1씩 증가**해
 * `/mypage/withdraw` 시각회귀 baseline이 만든 날 이후로는 항상 실패한다(2026-08-12 확인 — diff 279px,
 * 그 숫자 한 곳뿐이었다). baseline을 다시 찍어도 다음 날 또 깨지므로 데이터 쪽을 고정해야 한다.
 *
 * 상대값이면 언제 실행해도 항상 같은 일수로 렌더된다.
 */
const MOCK_PROFILE_DAYS_WITH_US = 200;
const MOCK_PROFILE_CREATED_AT = new Date(
  Date.now() - MOCK_PROFILE_DAYS_WITH_US * 86_400_000,
).toISOString();

export const MOCK_PROFILE = {
  id: 1,
  name: "쿠키",
  breed: "포메라니안",
  gender: "female",
  birthDate: "2020-01-01",
  weight: 3.5,
  profileImageUrl: null,
  specialNotes: null,
  createdAt: MOCK_PROFILE_CREATED_AT,
  updatedAt: MOCK_PROFILE_CREATED_AT,
  checklistAnswers: [],
};

// GET /v1/profiles/checklist 응답 — 체크리스트 모달 내부 흐름 E2E용 질문 2개.
// 옵션 라벨은 CTA/펫폼 텍스트와 겹치지 않게 고유값을 사용한다.
export const MOCK_CHECKLIST_QUESTIONS = [
  {
    id: 101,
    text: "어떤 간식을 좋아하나요?",
    shortText: "간식 취향",
    description: null,
    isMultiSelect: false,
    sortOrder: 1,
    options: [
      { id: 1001, text: "육포 간식", slug: "jerky", sortOrder: 1, isExclusive: false },
      { id: 1002, text: "비스킷 간식", slug: "biscuit", sortOrder: 2, isExclusive: false },
    ],
  },
  {
    id: 102,
    text: "알레르기가 있나요?",
    shortText: "알레르기",
    description: null,
    isMultiSelect: false,
    sortOrder: 2,
    options: [
      { id: 2001, text: "알레르기 없음", slug: "none", sortOrder: 1, isExclusive: false },
      { id: 2002, text: "닭고기 알레르기", slug: "chicken", sortOrder: 2, isExclusive: false },
    ],
  },
];

export const MOCK_ADDRESS = {
  id: 1,
  nickname: "우리집",
  receiverName: "김테스트",
  phoneNumber: "01012345678",
  zipCode: "12345",
  address: "서울시 강남구 테스트로 123",
  addressDetail: "101호",
  memo: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

// POST /v1/billing/register, PUT /v1/billing/update 응답 — 카드 등록 팝업 완료 시뮬레이션용
export const MOCK_BILLING_INFO = {
  id: 1,
  userId: 1,
  lastFourDigits: "1234",
  cardCompany: "테스트카드",
  cardType: "신용",
  ownerType: "individual",
  authenticatedAt: "2026-01-01T00:00:00.000Z",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

// 유효한 쿠폰 코드 — 10% 할인
export const MOCK_VALID_COUPON_CODE = "TEST10";

// 적용 가능한 초대(레퍼럴) 코드 — 10% 할인(discountRate=0.1).
// 이 외의 코드는 /v1/referral/validate가 400 REFERRAL_CODE_INVALID로 응답한다.
export const MOCK_VALID_REFERRAL_CODE = "FRIEND10";

// 인플루언서 계정 — isInfluencer: true, /mypage/point 접근 가능
export const INFLUENCER_CREDENTIALS = {
  email: "influencer@example.com",
  password: "Test1234!",
};
export const MOCK_INFLUENCER_ACCESS_TOKEN = "mock-influencer-access-token";
const MOCK_INFLUENCER_REFRESH_TOKEN = "mock-influencer-refresh-token";

// 레퍼럴 랜딩 페이지 슬러그
export const MOCK_ACTIVE_SLUG = "test-influencer";
export const MOCK_INACTIVE_SLUG = "inactive-influencer";

// GET /v1/referral/pages/{slug} 응답
export const MOCK_REFERRAL_PAGE = {
  referralCode: MOCK_VALID_REFERRAL_CODE,
  displayName: "테스트인플루언서",
  profileImageUrl: null as string | null,
  discountRate: 0.1,
  isActive: true,
};

// GET /v1/referral/me 응답 (인플루언서 전용)
export const MOCK_MY_REFERRAL_CODE = {
  referralCode: MOCK_VALID_REFERRAL_CODE,
  slug: MOCK_ACTIVE_SLUG,
  referralLink: `https://dev.kkosunbox.com/r/${MOCK_ACTIVE_SLUG}`,
};

// GET /v1/points/balance 응답
export const MOCK_POINT_BALANCE = {
  totalAmount: 2270,
  monthlyAmount: 800,
  year: 2026,
  month: 6,
};

export const MOCK_SUBSCRIPTION = {
  id: 1,
  userId: 1,
  petProfileId: 1,
  deliveryAddressId: 1,
  plan: {
    id: 1,
    name: "베이직 패키지 BOX",
    monthlyPrice: 39000,
    originalPrice: 49000,
    discountRate: 20,
    sortOrder: 1,
    isRecommended: false,
    averageRating: 4.6,
    description: "가볍게 시작하는 간식 구성",
    tags: [],
  },
  status: "active" as const,
  nextBillingDate: "2026-05-01",
  isActive: true,
  isPaused: false,
  // 할인 없는 구독 — 실결제액이 정가(39,000원)와 같은 케이스
  lastPaidAmount: 39000,
};

export const MOCK_PLANS = [
  {
    id: 1,
    name: "베이직 패키지 BOX",
    monthlyPrice: 39000,
    originalPrice: 49000,
    discountRate: 20,
    sortOrder: 1,
    isRecommended: false,
    averageRating: 4.6,
    description: "가볍게 시작하는 간식 구성",
    tags: [],
  },
  {
    id: 2,
    name: "스탠다드 패키지 BOX",
    monthlyPrice: 59000,
    originalPrice: 74000,
    discountRate: 20,
    sortOrder: 2,
    isRecommended: true,
    averageRating: 4.8,
    description: "건강까지 챙기는 균형 잡힌 간식 구성",
    tags: [],
  },
  {
    id: 3,
    name: "프리미엄 패키지 BOX",
    monthlyPrice: 79000,
    originalPrice: 99000,
    discountRate: 20,
    sortOrder: 3,
    isRecommended: false,
    averageRating: 4.7,
    description: "특별한 식사형 박스",
    tags: [],
  },
];

const MOCK_USER = {
  id: 1,
  email: TEST_CREDENTIALS.email,
  status: "active",
  lastLoginAt: "2026-01-01T00:00:00.000Z",
  isAllowTerms: true,
  isAllowPrivacy: true,
  isAllowMarketing: false,
  isInfluencer: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const MOCK_NO_PROFILE_USER = {
  id: 2,
  email: NO_PROFILE_CREDENTIALS.email,
  status: "active",
  lastLoginAt: "2026-01-01T00:00:00.000Z",
  isAllowTerms: true,
  isAllowPrivacy: true,
  isAllowMarketing: false,
  isInfluencer: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const MOCK_INFLUENCER_USER = {
  id: 3,
  email: INFLUENCER_CREDENTIALS.email,
  status: "active",
  lastLoginAt: "2026-01-01T00:00:00.000Z",
  isAllowTerms: true,
  isAllowPrivacy: true,
  isAllowMarketing: false,
  isInfluencer: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (chunk: Buffer) => { raw += chunk.toString(); });
    req.on("end", () => {
      try { resolve(JSON.parse(raw)); } catch { resolve({}); }
    });
  });
}

// 백엔드 공통 응답 형식: { result: true, data: T }
// apiClient는 json.data를 꺼내서 반환하므로 반드시 이 형식으로 감싸야 한다
function ok(res: ServerResponse, data: unknown) {
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify({ result: true, data }));
}

// 에러 응답: apiClient는 res.ok가 false면 code/message만 읽는다
function err(res: ServerResponse, status: number, code: string, message = "") {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify({ result: false, code, message, traceId: "mock" }));
}

/**
 * Starts a minimal HTTP server that stubs only the API endpoints
 * needed for login E2E tests. Returns a stop function for teardown.
 */
export async function startMockApiServer(port: number): Promise<() => Promise<void>> {
  // 테스트별 에러 주입: POST /v1/__test/fail 로 추가, DELETE 로 전체 해제
  const failingPaths = new Set<string>();

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? "";
    const method = req.method ?? "GET";

    // CORS preflight — PATCH/DELETE는 단순요청이 아니므로 Allow-Methods 명시 필요
    if (method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      });
      res.end();
      return;
    }

    // 테스트 전용 어드민: 에러 주입 경로 설정/해제
    if (url === "/v1/__test/fail") {
      if (method === "POST") {
        const body = await readBody(req) as { endpoints?: string[] };
        (body.endpoints ?? []).forEach((p) => failingPaths.add(p));
      } else if (method === "DELETE") {
        failingPaths.clear();
      }
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({ ok: true, failing: [...failingPaths] }));
      return;
    }

    // 주입된 경로는 500 반환 (인증 엔드포인트 제외)
    const pathname = url.split("?")[0];
    if (failingPaths.has(pathname)) {
      err(res, 500, "INTERNAL_SERVER_ERROR", "Simulated API failure for testing");
      return;
    }

    // POST /v1/auth/login — core login endpoint
    if (method === "POST" && url === "/v1/auth/login") {
      const body = await readBody(req) as Record<string, string>;
      if (body.email === TRIGGER_SERVER_ERROR_EMAIL) {
        err(res, 500, "INTERNAL_SERVER_ERROR", "Internal server error");
      } else if (body.email === TEST_CREDENTIALS.email && body.password === TEST_CREDENTIALS.password) {
        ok(res, {
          accessToken: MOCK_ACCESS_TOKEN,
          refreshToken: MOCK_REFRESH_TOKEN,
          user: MOCK_USER,
        });
      } else if (body.email === NO_PROFILE_CREDENTIALS.email && body.password === NO_PROFILE_CREDENTIALS.password) {
        ok(res, {
          accessToken: MOCK_NO_PROFILE_ACCESS_TOKEN,
          refreshToken: MOCK_NO_PROFILE_REFRESH_TOKEN,
          user: MOCK_NO_PROFILE_USER,
        });
      } else if (body.email === INFLUENCER_CREDENTIALS.email && body.password === INFLUENCER_CREDENTIALS.password) {
        ok(res, {
          accessToken: MOCK_INFLUENCER_ACCESS_TOKEN,
          refreshToken: MOCK_INFLUENCER_REFRESH_TOKEN,
          user: MOCK_INFLUENCER_USER,
        });
      } else {
        // loginAction treats 401 as "아이디 또는 비밀번호가 올바르지 않습니다."
        err(res, 401, "UNAUTHORIZED", "Invalid credentials");
      }
      return;
    }

    // POST /v1/auth/{google|naver|kakao} — 소셜 로그인 (OAuth code 교환)
    // 실제 백엔드는 외부 IdP 왕복이 있어 느리다. 그 지연이 콜백 페이지의 서버 액션과
    // AuthProvider 부트스트랩 사이의 순서를 결정하므로, 재현을 위해 약간의 지연을 둔다.
    if (method === "POST" && /^\/v1\/auth\/(google|naver|kakao)$/.test(url)) {
      const body = await readBody(req) as Record<string, string>;
      if (!body.code) {
        err(res, 400, "BAD_REQUEST", "code is required");
        return;
      }
      await new Promise((r) => setTimeout(r, 150));
      ok(res, {
        accessToken: MOCK_ACCESS_TOKEN,
        refreshToken: MOCK_REFRESH_TOKEN,
        user: MOCK_USER,
        isNewUser: false,
      });
      return;
    }

    // GET /v1/auth/user — called by getAuthUser() (server-side) on each page render
    if (method === "GET" && url === "/v1/auth/user") {
      const auth = req.headers.authorization ?? "";
      if (auth === `Bearer ${MOCK_ACCESS_TOKEN}` || auth === `Bearer ${MOCK_BILLING_ACCESS_TOKEN}`) {
        ok(res, MOCK_USER);
      } else if (auth === `Bearer ${MOCK_NO_PROFILE_ACCESS_TOKEN}`) {
        ok(res, MOCK_NO_PROFILE_USER);
      } else if (auth === `Bearer ${MOCK_INFLUENCER_ACCESS_TOKEN}`) {
        ok(res, MOCK_INFLUENCER_USER);
      } else {
        err(res, 401, "UNAUTHORIZED");
      }
      return;
    }

    // POST /v1/auth/refresh
    // MOCK_REFRESH_TOKEN → 새 토큰 발급 (세션 복구 시나리오)
    // 그 외 → 401 (retry loop 방지)
    if (method === "POST" && url === "/v1/auth/refresh") {
      const body = await readBody(req) as Record<string, string>;
      if (body.refreshToken === MOCK_REFRESH_TOKEN) {
        ok(res, { accessToken: MOCK_ACCESS_TOKEN, refreshToken: MOCK_REFRESH_TOKEN });
      } else if (body.refreshToken === MOCK_NO_PROFILE_REFRESH_TOKEN) {
        ok(res, {
          accessToken: MOCK_NO_PROFILE_ACCESS_TOKEN,
          refreshToken: MOCK_NO_PROFILE_REFRESH_TOKEN,
        });
      } else if (body.refreshToken === MOCK_INFLUENCER_REFRESH_TOKEN) {
        ok(res, {
          accessToken: MOCK_INFLUENCER_ACCESS_TOKEN,
          refreshToken: MOCK_INFLUENCER_REFRESH_TOKEN,
        });
      } else if (body.refreshToken === MOCK_BILLING_REFRESH_TOKEN) {
        ok(res, {
          accessToken: MOCK_BILLING_ACCESS_TOKEN,
          refreshToken: MOCK_BILLING_REFRESH_TOKEN,
        });
      } else {
        err(res, 401, "UNAUTHORIZED");
      }
      return;
    }

    // GET /v1/profiles — SSR(fetchProfiles) + 클라이언트(ProfileProvider) 양쪽에서 호출
    // NO_PROFILE 토큰이면 빈 배열 — 프로필 없이도 주문/구독이 가능해야 함
    if (method === "GET" && url === "/v1/profiles") {
      const auth = req.headers.authorization ?? "";
      if (auth === `Bearer ${MOCK_ACCESS_TOKEN}`) {
        ok(res, { profiles: [MOCK_PROFILE] });
      } else {
        ok(res, { profiles: [] });
      }
      return;
    }

    // POST /v1/profiles — 프로필 생성 (체크리스트 제출의 신규 프로필 경로)
    // 응답은 생성된 Profile. submit은 응답의 id만 사용한다.
    if (method === "POST" && url === "/v1/profiles") {
      const body = (await readBody(req)) as { name?: string };
      ok(res, { ...MOCK_PROFILE, id: 2, name: body.name ?? MOCK_PROFILE.name });
      return;
    }

    // PATCH /v1/profiles/:id — 프로필 수정 (editProfile 저장 / 체크리스트 재작성)
    if (method === "PATCH" && /^\/v1\/profiles\/\d+$/.test(url)) {
      const body = (await readBody(req)) as { name?: string };
      ok(res, { ...MOCK_PROFILE, name: body.name ?? MOCK_PROFILE.name });
      return;
    }

    // GET /v1/delivery-addresses — order 페이지 배송지 목록
    // MOCK_ACCESS_TOKEN·MOCK_BILLING_ACCESS_TOKEN(카드+배송지 모두 있는 결제 플로우 e2e용) → 배송지 1건
    if (method === "GET" && url === "/v1/delivery-addresses") {
      const auth = req.headers.authorization ?? "";
      if (auth === `Bearer ${MOCK_ACCESS_TOKEN}` || auth === `Bearer ${MOCK_BILLING_ACCESS_TOKEN}`) {
        ok(res, { addresses: [MOCK_ADDRESS] });
      } else {
        ok(res, { addresses: [] });
      }
      return;
    }

    // GET /v1/billing — order 페이지 결제수단. MOCK_BILLING_ACCESS_TOKEN만 등록된 카드 있음.
    if (method === "GET" && url === "/v1/billing") {
      const auth = req.headers.authorization ?? "";
      if (auth === `Bearer ${MOCK_BILLING_ACCESS_TOKEN}`) {
        ok(res, { billingInfos: [MOCK_BILLING_INFO] });
      } else {
        ok(res, { billingInfos: [] });
      }
      return;
    }

    // POST /v1/billing/register, PUT /v1/billing/update — 카드 등록 팝업(/payment/billing/success)이 호출.
    // authKey·customerKey 값은 검증하지 않고(실제 Toss 인증은 e2e 범위 밖) 항상 성공 응답한다.
    if (method === "POST" && url === "/v1/billing/register") {
      ok(res, MOCK_BILLING_INFO);
      return;
    }
    if (method === "PUT" && url === "/v1/billing/update") {
      ok(res, MOCK_BILLING_INFO);
      return;
    }

    // POST /v1/subscriptions/coupon/info — 쿠폰 검증
    if (method === "POST" && url === "/v1/subscriptions/coupon/info") {
      const body = await readBody(req) as Record<string, string>;
      if (body.code?.toUpperCase() === MOCK_VALID_COUPON_CODE) {
        ok(res, {
          name: "테스트 쿠폰",
          discountType: "percent",
          discountRate: 10,
          applyCount: 1,
          canUse: true,
        });
      } else {
        ok(res, {
          canUse: false,
          discountType: "percent",
          discountRate: 0,
          applyCount: 0,
          unavailableReason: "유효하지 않은 쿠폰 코드입니다.",
        });
      }
      return;
    }

    // GET /v1/subscriptions — 구독 목록 조회 (취소 건 포함, 구독 이력 판정에 사용)
    // MOCK_ACCESS_TOKEN(test 유저) → 구독 1건(이력 있음)
    // NO_PROFILE 토큰 등 그 외 → 빈 배열(이력 없음)
    if (method === "GET" && url === "/v1/subscriptions") {
      const auth = req.headers.authorization ?? "";
      if (auth === `Bearer ${MOCK_ACCESS_TOKEN}`) {
        ok(res, { subscriptions: [MOCK_SUBSCRIPTION] });
      } else {
        ok(res, { subscriptions: [] });
      }
      return;
    }

    // POST /v1/subscriptions — 구독 생성 (referralCode 포함 가능).
    // trackPurchase가 응답의 subscription.id를 바로 읽으므로 null이면 안 된다.
    if (method === "POST" && url === "/v1/subscriptions") {
      ok(res, { subscription: { ...MOCK_SUBSCRIPTION, id: 2 } });
      return;
    }

    // GET /v1/referral/validate?code=XXX — 초대코드 적용 가능 여부
    // 유효 → 200 { isApplicable: true, discountRate: 0.1 }
    // 그 외 → 400 REFERRAL_CODE_INVALID (사유별 에러 코드 계약)
    if (method === "GET" && url.startsWith("/v1/referral/validate")) {
      const code = new URL(url, "http://localhost").searchParams.get("code") ?? "";
      if (code.toUpperCase() === MOCK_VALID_REFERRAL_CODE) {
        ok(res, { isApplicable: true, discountRate: 0.1 });
      } else {
        err(res, 400, "REFERRAL_CODE_INVALID", "invalid referral code");
      }
      return;
    }

    // GET /v1/inquiries — 문의 목록 (없으면 .catch()가 [] 폴백, 여기서는 빈 배열 반환)
    if (method === "GET" && url === "/v1/inquiries") {
      ok(res, { inquiries: [] });
      return;
    }

    // POST /v1/inquiries — 문의 등록 (연락처 검증은 프론트 책임, 목서버는 그대로 수용)
    if (method === "POST" && url === "/v1/inquiries") {
      const body = await readBody(req) as { title: string; content: string; contact?: string };
      ok(res, {
        inquiry: {
          id: 9001,
          title: body.title,
          content: body.content,
          status: "pending",
          isAnswered: false,
          createdAt: new Date().toISOString(),
          contact: body.contact,
        },
      });
      return;
    }

    // DELETE /v1/inquiries/:id — 문의 삭제
    if (method === "DELETE" && /^\/v1\/inquiries\/\d+$/.test(url)) {
      ok(res, {});
      return;
    }

    // GET /v1/profiles/checklist — 체크리스트 질문 (비로그인 허용)
    if (method === "GET" && url === "/v1/profiles/checklist") {
      ok(res, { questions: MOCK_CHECKLIST_QUESTIONS });
      return;
    }

    // GET /v1/subscriptions/plans — subscribe 페이지 플랜 목록
    // 인증된 토큰(일반·NO_PROFILE·BILLING 모두)이면 동일한 플랜 목록 반환,
    // 그 외에는 401 → fetchSubscriptionPlans의 .catch()가 빈 배열로 폴백
    if (method === "GET" && url.startsWith("/v1/subscriptions/plans")) {
      const auth = req.headers.authorization ?? "";
      if (
        auth === `Bearer ${MOCK_ACCESS_TOKEN}` ||
        auth === `Bearer ${MOCK_NO_PROFILE_ACCESS_TOKEN}` ||
        auth === `Bearer ${MOCK_BILLING_ACCESS_TOKEN}`
      ) {
        ok(res, { plans: MOCK_PLANS });
      } else {
        err(res, 401, "UNAUTHORIZED");
      }
      return;
    }

    // GET /v1/referral/pages/{slug} — 인플루언서 초대 페이지 (공개 API)
    // 특정 slug만 처리하고 나머지는 404
    if (method === "GET" && url === `/v1/referral/pages/${MOCK_ACTIVE_SLUG}`) {
      ok(res, MOCK_REFERRAL_PAGE);
      return;
    }
    if (method === "GET" && url === `/v1/referral/pages/${MOCK_INACTIVE_SLUG}`) {
      ok(res, { ...MOCK_REFERRAL_PAGE, isActive: false });
      return;
    }
    if (method === "GET" && url.startsWith("/v1/referral/pages/")) {
      err(res, 404, "INFLUENCER_PROFILE_NOT_FOUND");
      return;
    }

    // GET /v1/referral/me — 내 레퍼럴 코드 (인플루언서 전용)
    if (method === "GET" && url === "/v1/referral/me") {
      const auth = req.headers.authorization ?? "";
      if (auth === `Bearer ${MOCK_INFLUENCER_ACCESS_TOKEN}`) {
        ok(res, MOCK_MY_REFERRAL_CODE);
      } else {
        err(res, 403, "FORBIDDEN");
      }
      return;
    }

    // GET /v1/points/balance — 포인트 잔액 (인플루언서 토큰만 정상 응답)
    // 반드시 /v1/points 보다 앞에 위치해야 한다
    if (method === "GET" && url.startsWith("/v1/points/balance")) {
      const auth = req.headers.authorization ?? "";
      if (auth === `Bearer ${MOCK_INFLUENCER_ACCESS_TOKEN}`) {
        ok(res, MOCK_POINT_BALANCE);
      } else {
        err(res, 401, "UNAUTHORIZED");
      }
      return;
    }

    // GET /v1/points — 포인트 적립/사용 내역 (인플루언서 토큰만 정상 응답)
    if (method === "GET" && url.startsWith("/v1/points")) {
      const auth = req.headers.authorization ?? "";
      if (auth === `Bearer ${MOCK_INFLUENCER_ACCESS_TOKEN}`) {
        ok(res, { items: [], total: 0, page: 1, limit: 200 });
      } else {
        err(res, 401, "UNAUTHORIZED");
      }
      return;
    }

    // Everything else
    err(res, 404, "NOT_FOUND");
  });

  await new Promise<void>((resolve) => server.listen(port, resolve));
  console.log(`[Mock API] http://localhost:${port}`);

  return () => new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve()))
  );
}
