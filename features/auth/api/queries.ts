/**
 * 서버 전용 인증 데이터 패칭.
 * "server-only" 임포트로 클라이언트 번들에 포함되면 빌드 에러 발생.
 */
import "server-only";
import { apiClient } from "@/shared/lib/api";
import type { User } from "./types";

function serverOpts(token?: string) {
  return { token, skipRefresh: true } as const;
}

/** 현재 로그인 유저 정보 */
export async function fetchUser(token?: string): Promise<User | null> {
  return apiClient
    .get<User>("/v1/auth/user", serverOpts(token))
    .catch(() => null);
}
