import { env } from "@/shared/config/env";
import { ApiError, type ApiErrorResponse, type ApiResponse } from "./types";
import { tokenStore } from "./token";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions extends Omit<RequestInit, "method" | "body"> {
  /** Server Component에서 직접 accessToken을 전달할 때 사용 */
  token?: string;
  /** true이면 401 시 자동 토큰 갱신을 시도하지 않는다 (갱신 요청 자체에 사용) */
  skipRefresh?: boolean;
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

async function request<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const { token, skipRefresh, ...fetchOptions } = options;

  const doFetch = async (accessToken: string | null) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...fetchOptions.headers,
    };

    const url = `${env.apiUrl}${path}`;
    console.log(`[api] ${method} URL=`, JSON.stringify(url));
    return fetch(url, {
      ...fetchOptions,
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

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
    if (process.env.NODE_ENV === "development") {
      console.warn(`[api] ${method} ${path} ${res.status}`, errorBody ?? res.statusText);
    }
    throw new ApiError(
      res.status,
      errorBody?.code ?? "UNKNOWN_ERROR",
      errorBody?.message ?? res.statusText,
    );
  }

  // 204 No Content
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    if (process.env.NODE_ENV === "development") {
      console.log(`[api] ${method} ${path}`, "(no content)");
    }
    return undefined as T;
  }

  const json: ApiResponse<T> = await res.json();
  if (process.env.NODE_ENV === "development") {
    console.log(`[api] ${method} ${path}`, json.data);
  }
  return json.data;
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
