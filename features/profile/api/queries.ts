/**
 * 서버 전용 프로필 데이터 패칭.
 * "server-only" 임포트로 클라이언트 번들에 포함되면 빌드 에러 발생.
 */
import "server-only";
import { apiClient } from "@/shared/lib/api";
import type { Profile } from "./types";

function serverOpts(token?: string) {
  return { token, skipRefresh: true } as const;
}

/** 로그인 유저의 프로필 목록 */
export async function fetchProfiles(token?: string): Promise<Profile[]> {
  const data = await apiClient
    .get<{ profiles: Profile[] }>("/v1/profiles", serverOpts(token))
    .catch(() => ({ profiles: [] as Profile[] }));
  return data.profiles;
}

/** 로그인 유저의 프로필 목록 → 첫 번째 프로필 반환 (없으면 null) */
export async function fetchProfile(token?: string): Promise<Profile | null> {
  const profiles = await fetchProfiles(token);
  return profiles[0] ?? null;
}
