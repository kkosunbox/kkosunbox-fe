/**
 * 토큰 저장소
 *
 * - accessToken  : 모듈 변수(메모리)에만 보관 → XSS 탈취 불가
 * - refreshToken : localStorage 보관 → 페이지 새로고침 후에도 세션 유지
 *   (리프레시 토큰이 탈취돼도 만료 전까지만 유효하고, 백엔드 rotation으로 무효화)
 */

const REFRESH_TOKEN_KEY = "ggosoon:refresh_token";

let _accessToken: string | null = null;

function isClient() {
  return typeof window !== "undefined";
}

export const tokenStore = {
  getAccess: () => _accessToken,

  setAccess: (token: string) => {
    _accessToken = token;
  },

  getRefresh: (): string | null => {
    if (!isClient()) return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefresh: (token: string) => {
    if (!isClient()) return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  /** 로그인 후 두 토큰을 한 번에 저장 */
  setTokens: (accessToken: string, refreshToken: string) => {
    _accessToken = accessToken;
    if (isClient()) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  /** 로그아웃 시 두 토큰 모두 초기화 */
  clear: () => {
    _accessToken = null;
    if (isClient()) localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
