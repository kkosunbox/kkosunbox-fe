const FALLBACK_COUNT = 8;
const STORAGE_KEY = "ggb-fallback-avatar-idx";

export const FALLBACK_AVATAR_PATHS = Array.from(
  { length: FALLBACK_COUNT },
  (_, i) => `/images/fallback-user/type-${String.fromCharCode(97 + i)}.webp`
);

/** 비로그인 SSR 스냅샷 — 하이드레이션 후 localStorage 기반 값으로 교체 */
export const FALLBACK_AVATAR_SSR_DEFAULT = FALLBACK_AVATAR_PATHS[0];

/** userId(숫자)를 0~7 인덱스로 결정론적 변환 */
function hashIndex(userId: number): number {
  return Math.abs(userId) % FALLBACK_COUNT;
}

/**
 * 로그인 유저: userId 해시 → 항상 동일
 * 비로그인: localStorage에 저장된 값 재사용, 없으면 랜덤 생성 후 저장
 */
export function getFallbackAvatarPath(userId?: number | null): string {
  if (userId != null) {
    return FALLBACK_AVATAR_PATHS[hashIndex(userId)];
  }
  if (typeof window === "undefined") {
    return FALLBACK_AVATAR_PATHS[0];
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  const idx = stored !== null ? Number(stored) : Math.floor(Math.random() * FALLBACK_COUNT);
  if (stored === null) {
    localStorage.setItem(STORAGE_KEY, String(idx));
  }
  return FALLBACK_AVATAR_PATHS[idx];
}
