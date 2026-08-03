import { env } from "@/shared/config/env";
import { ApiError, type ApiErrorResponse, type ApiResponse } from "./types";
import { tokenStore } from "./token";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * GET 기본 타임아웃(ms) — 백엔드가 응답을 아예 안 보내는 상태(2026-08-03 실제 장애로 확인됨:
 * TCP/TLS는 성공하지만 애플리케이션 레이어가 무응답)에서도 페이지 전체가 무한정 멈추지 않게 한다.
 * 대부분의 목록/상세 조회(fetchProducts 등)는 이미 .catch(() => fallback)로 감싸져 있어
 * 타임아웃으로 인한 AbortError도 자연스럽게 빈 값으로 폴백된다.
 * POST/PUT/PATCH/DELETE(결제 승인 등)는 기본적으로 타임아웃을 걸지 않는다 — 응답이 늦어도
 * 백엔드에서 실제로는 처리가 끝났을 수 있어, 클라이언트가 먼저 포기하면 상태 불일치(이중 결제 등)
 * 위험이 더 크다.
 */
const DEFAULT_GET_TIMEOUT_MS = 5500;

interface RequestOptions extends Omit<RequestInit, "method" | "body"> {
  /** Server Component에서 직접 accessToken을 전달할 때 사용 */
  token?: string;
  /** true이면 401 시 자동 토큰 갱신을 시도하지 않는다 (갱신 요청 자체에 사용) */
  skipRefresh?: boolean;
  /**
   * 요청 타임아웃(ms) 오버라이드. 지정하지 않으면 GET은 DEFAULT_GET_TIMEOUT_MS,
   * 그 외 메서드는 타임아웃 없음. 0을 명시하면 GET도 타임아웃을 끈다.
   * signal을 직접 넘긴 경우(getAuthUser 등)엔 이 옵션을 무시하고 넘겨준 signal을 그대로 쓴다.
   */
  timeoutMs?: number;
}

// 동시 다발 401 → refresh가 여러 번 실행되지 않도록 promise lock
let refreshingPromise: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  if (refreshingPromise) return refreshingPromise;

  refreshingPromise = (async () => {
    const refreshToken = tokenStore.getRefresh();
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${env.apiUrl}/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        tokenStore.clear();
        return null;
      }

      const json: ApiResponse<{ accessToken: string; refreshToken: string }> =
        await res.json();
      tokenStore.setTokens(json.data.accessToken, json.data.refreshToken);
      return json.data.accessToken;
    } catch {
      tokenStore.clear();
      return null;
    } finally {
      refreshingPromise = null;
    }
  })();

  return refreshingPromise;
}

/** 메모리에 accessToken이 없을 때 refreshToken으로 복구한다. 이미 있으면 즉시 true. */
export async function ensureClientAccessToken(): Promise<boolean> {
  if (tokenStore.getAccess()) return true;
  const token = await tryRefresh();
  return Boolean(token);
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const { token, skipRefresh, timeoutMs, signal: callerSignal, ...fetchOptions } = options;

  const effectiveTimeoutMs = timeoutMs ?? (method === "GET" ? DEFAULT_GET_TIMEOUT_MS : 0);
  let internalController: AbortController | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let signal = callerSignal;
  if (!callerSignal && effectiveTimeoutMs > 0) {
    internalController = new AbortController();
    timeoutId = setTimeout(() => internalController!.abort(), effectiveTimeoutMs);
    signal = internalController.signal;
  }

  const doFetch = async (accessToken: string | null) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...fetchOptions.headers,
    };

    const url = `${env.apiUrl}${path}`;
    return fetch(url, {
      ...fetchOptions,
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  };

  try {
    const accessToken = token ?? tokenStore.getAccess();
    let res = await doFetch(accessToken);

    // 401 → 토큰 갱신 후 1회 재시도
    if (res.status === 401 && !skipRefresh && !token) {
      const newToken = await tryRefresh();
      if (newToken) {
        res = await doFetch(newToken);
      }
    }

    if (!res.ok) {
      let errorBody: ApiErrorResponse | undefined;
      try {
        errorBody = await res.json();
      } catch {
        // 응답 바디가 없는 경우 무시
      }
      // 401 UNAUTHORIZED: 액세스 토큰 + 리프레시 토큰 모두 만료/무효 → 강제 로그아웃 신호.
      // skipRefresh(리프레시 요청 자체) 또는 token(SSR 직접 주입) 케이스는 제외한다.
      if (
        res.status === 401 &&
        errorBody?.code === "UNAUTHORIZED" &&
        !skipRefresh &&
        !token &&
        typeof window !== "undefined"
      ) {
        window.dispatchEvent(new CustomEvent("ggosoon:unauthorized"));
      }
      throw new ApiError(
        res.status,
        errorBody?.code ?? "UNKNOWN_ERROR",
        errorBody?.message ?? res.statusText,
        errorBody?.traceId ?? null,
      );
    }

    // 204 No Content
    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return undefined as T;
    }

    const json: ApiResponse<T> = await res.json();
    return json.data;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, undefined, options),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),

  delete: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("DELETE", path, body, options),
};
