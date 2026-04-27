import { createServer, IncomingMessage, ServerResponse } from "http";

// Test credentials — must match what's used in the test spec
export const TEST_CREDENTIALS = {
  email: "test@example.com",
  password: "Test1234!",
};

const MOCK_ACCESS_TOKEN = "mock-access-token-for-testing";
const MOCK_REFRESH_TOKEN = "mock-refresh-token-for-testing";

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
      if (body.email === TEST_CREDENTIALS.email && body.password === TEST_CREDENTIALS.password) {
        ok(res, {
          accessToken: MOCK_ACCESS_TOKEN,
          refreshToken: MOCK_REFRESH_TOKEN,
          user: MOCK_USER,
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
      } else {
        err(res, 401, "UNAUTHORIZED");
      }
      return;
    }

    // POST /v1/auth/refresh — return 401 to avoid retry loops
    if (method === "POST" && url === "/v1/auth/refresh") {
      err(res, 401, "UNAUTHORIZED");
      return;
    }

    // GET /v1/profiles — ProfileProvider fetches this after login
    // Return empty list so the header renders with default pet icon (no crash)
    if (method === "GET" && url === "/v1/profiles") {
      ok(res, { profiles: [] });
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
