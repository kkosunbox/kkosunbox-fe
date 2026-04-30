import { createServer, IncomingMessage, ServerResponse } from "http";

// Test credentials — must match what's used in the test spec
export const TEST_CREDENTIALS = {
  email: "test@example.com",
  password: "Test1234!",
};

// 프로필이 없는 인증 유저 — 주문 페이지 "프로필 없음 → /mypage/dog-profile" 리다이렉트 테스트용
export const NO_PROFILE_CREDENTIALS = {
  email: "noprofile@example.com",
  password: "Test1234!",
};

// 서버 오류(5xx) 시나리오를 트리거하는 이메일
export const TRIGGER_SERVER_ERROR_EMAIL = "server-error@example.com";

export const MOCK_ACCESS_TOKEN = "mock-access-token-for-testing";
export const MOCK_REFRESH_TOKEN = "mock-refresh-token-for-testing";

const MOCK_NO_PROFILE_ACCESS_TOKEN = "mock-no-profile-access-token-for-testing";
const MOCK_NO_PROFILE_REFRESH_TOKEN = "mock-no-profile-refresh-token-for-testing";

export const MOCK_PROFILE = {
  id: 1,
  name: "쿠키",
  breed: "포메라니안",
  gender: "female",
  birthDate: "2020-01-01",
  weight: 3.5,
  profileImageUrl: null,
  specialNotes: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  checklistAnswers: [],
};

export const MOCK_ADDRESS = {
  id: 1,
  receiverName: "김테스트",
  phoneNumber: "01012345678",
  zipCode: "12345",
  address: "서울시 강남구 테스트로 123",
  addressDetail: "101호",
  memo: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

// 유효한 쿠폰 코드 — 10% 할인
export const MOCK_VALID_COUPON_CODE = "TEST10";

export const MOCK_SUBSCRIPTION = {
  id: 1,
  userId: 1,
  petProfileId: 1,
  deliveryAddressId: 1,
  plan: {
    id: 1,
    name: "베이직 패키지 BOX",
    monthlyPrice: 39000,
    sortOrder: 1,
    isRecommended: false,
    description: "가볍게 시작하는 간식 구성",
  },
  status: "active" as const,
  nextBillingDate: "2026-05-01",
  isActive: true,
};

export const MOCK_PLANS = [
  {
    id: 1,
    name: "베이직 패키지 BOX",
    monthlyPrice: 39000,
    sortOrder: 1,
    isRecommended: false,
    description: "가볍게 시작하는 간식 구성",
  },
  {
    id: 2,
    name: "스탠다드 패키지 BOX",
    monthlyPrice: 59000,
    sortOrder: 2,
    isRecommended: true,
    description: "건강까지 챙기는 균형 잡힌 간식 구성",
  },
  {
    id: 3,
    name: "프리미엄 패키지 BOX",
    monthlyPrice: 79000,
    sortOrder: 3,
    isRecommended: false,
    description: "특별한 식사형 박스",
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
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? "";
    const method = req.method ?? "GET";

    // CORS preflight
    if (method === "OPTIONS") {
      res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type, Authorization" });
      res.end();
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
      } else {
        // loginAction treats 401 as "아이디 또는 비밀번호가 올바르지 않습니다."
        err(res, 401, "UNAUTHORIZED", "Invalid credentials");
      }
      return;
    }

    // GET /v1/auth/user — called by getAuthUser() (server-side) on each page render
    if (method === "GET" && url === "/v1/auth/user") {
      const auth = req.headers.authorization ?? "";
      if (auth === `Bearer ${MOCK_ACCESS_TOKEN}`) {
        ok(res, MOCK_USER);
      } else if (auth === `Bearer ${MOCK_NO_PROFILE_ACCESS_TOKEN}`) {
        ok(res, MOCK_NO_PROFILE_USER);
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
      } else {
        err(res, 401, "UNAUTHORIZED");
      }
      return;
    }

    // GET /v1/profiles — SSR(fetchProfiles) + 클라이언트(ProfileProvider) 양쪽에서 호출
    // 인증 토큰이 없으면 빈 배열 → order 페이지 SSR에서 /mypage/dog-profile 리다이렉트 트리거
    if (method === "GET" && url === "/v1/profiles") {
      const auth = req.headers.authorization ?? "";
      if (auth === `Bearer ${MOCK_ACCESS_TOKEN}`) {
        ok(res, { profiles: [MOCK_PROFILE] });
      } else {
        ok(res, { profiles: [] });
      }
      return;
    }

    // GET /v1/delivery-addresses — order 페이지 배송지 목록
    if (method === "GET" && url === "/v1/delivery-addresses") {
      const auth = req.headers.authorization ?? "";
      if (auth === `Bearer ${MOCK_ACCESS_TOKEN}`) {
        ok(res, { addresses: [MOCK_ADDRESS] });
      } else {
        ok(res, { addresses: [] });
      }
      return;
    }

    // GET /v1/billing — order 페이지 결제수단 (없음 → null)
    if (method === "GET" && url === "/v1/billing") {
      ok(res, { billingInfos: [] });
      return;
    }

    // POST /v1/subscriptions/coupon/info — 쿠폰 검증
    if (method === "POST" && url === "/v1/subscriptions/coupon/info") {
      const body = await readBody(req) as Record<string, string>;
      if (body.code?.toUpperCase() === MOCK_VALID_COUPON_CODE) {
        ok(res, { name: "테스트 쿠폰", discountRate: 10, canUse: true });
      } else {
        ok(res, { canUse: false, discountRate: 0, unavailableReason: "유효하지 않은 쿠폰 코드입니다." });
      }
      return;
    }

    // GET /v1/subscriptions — 활성 구독 조회 (mypage, 구독 변경 등)
    if (method === "GET" && url === "/v1/subscriptions") {
      const auth = req.headers.authorization ?? "";
      if (auth === `Bearer ${MOCK_ACCESS_TOKEN}`) {
        ok(res, { subscriptions: [MOCK_SUBSCRIPTION] });
      } else {
        ok(res, { subscriptions: [] });
      }
      return;
    }

    // GET /v1/inquiries — 문의 목록 (없으면 .catch()가 [] 폴백, 여기서는 빈 배열 반환)
    if (method === "GET" && url === "/v1/inquiries") {
      ok(res, { inquiries: [] });
      return;
    }

    // GET /v1/profiles/checklist — 체크리스트 질문 (비로그인 허용, 없으면 .catch()가 [] 폴백)
    if (method === "GET" && url === "/v1/profiles/checklist") {
      ok(res, { questions: [] });
      return;
    }

    // GET /v1/subscriptions/plans — subscribe 페이지 플랜 목록
    // 인증 토큰이 없으면 401 → fetchSubscriptionPlans의 .catch()가 빈 배열로 폴백
    if (method === "GET" && url.startsWith("/v1/subscriptions/plans")) {
      const auth = req.headers.authorization ?? "";
      if (auth === `Bearer ${MOCK_ACCESS_TOKEN}`) {
        ok(res, { plans: MOCK_PLANS });
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
