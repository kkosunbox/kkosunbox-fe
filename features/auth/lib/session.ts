import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "./constants";
import { apiClient } from "@/shared/lib/api";
import type { User } from "../api/types";
import type { AuthUser } from "../model/types";
import { toAuthUser } from "./mapUser";

/** 쿠키에서 accessToken을 추출합니다. Server Component 전용. */
export async function getServerToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

/**
 * Server Component에서 현재 로그인 유저를 조회합니다.
 * 쿠키의 accessToken으로 /v1/auth/user를 호출해 검증합니다.
 * 5초 내 응답 없으면 null 반환 — 루트 레이아웃 블로킹 방지.
 *
 * `cache()`로 요청 단위 메모이즈한다 — 루트 layout·mypage layout·개별 page가 각자 호출해
 * 같은 요청에서 같은 API를 여러 번 때리고 있었다. 렌더를 막는 왕복이라 손해가 그대로 쌓인다.
 */
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const user = await apiClient.get<User>("/v1/auth/user", {
      token,
      skipRefresh: true,
      signal: controller.signal,
    });
    return toAuthUser(user);
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
});
