/**
 * 레퍼럴(초대) 코드 어트리뷰션.
 *
 * 유저가 `https://kkosunbox.com/...?ref=CODE` 형태의 초대 링크로 진입하면
 * 미들웨어(`middleware.ts`)가 코드를 쿠키에 저장하고 URL에서 `ref`를 제거한다.
 * 이 모듈은 그 쿠키의 이름·정책과 읽기/삭제 헬퍼를 한곳에서 관리한다.
 *
 * 설계 메모:
 *  - non-httpOnly 쿠키 — 주문 페이지(클라이언트)에서 읽어 validate에 사용한다.
 *    초대 코드는 민감 정보가 아니므로 JS 노출이 허용된다.
 *  - 인증(`ggosoon-auth`)과 독립된 별도 쿠키 — 로그아웃은 auth 쿠키만 삭제하므로
 *    로그인/로그아웃/회원가입 흐름에서도 초대 코드가 유지된다.
 */
export const INVITE_CODE_COOKIE = "ggosoon-ref";

/** 어트리뷰션 윈도우 — 진입 후 7일간 초대 코드를 유지한다. */
export const INVITE_CODE_MAX_AGE_SEC = 60 * 60 * 24 * 7;

/** 허용 코드 형식 (영숫자·`-`·`_`, 최대 64자). 쿠키 인젝션 방지용 화이트리스트. */
const INVITE_CODE_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function isValidInviteCode(code: string): boolean {
  return INVITE_CODE_PATTERN.test(code);
}

/** 저장된 초대 코드를 반환한다. 없거나 형식이 올바르지 않거나 SSR 환경이면 null. */
export function getStoredInviteCode(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${INVITE_CODE_COOKIE}=([^;]*)`),
  );
  if (!match) return null;
  const code = decodeURIComponent(match[1]);
  return isValidInviteCode(code) ? code : null;
}

/** 저장된 초대 코드를 삭제한다. 구독 생성 등으로 코드를 소비한 뒤 호출한다. */
export function clearStoredInviteCode(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${INVITE_CODE_COOKIE}=; Max-Age=0; path=/`;
}

export const INVITE_SLUG_COOKIE = "ggosoon-ref-slug";

/** 저장된 초대 slug를 반환한다. 없거나 SSR 환경이면 null. */
export function getStoredInviteSlug(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${INVITE_SLUG_COOKIE}=([^;]*)`),
  );
  if (!match) return null;
  const slug = decodeURIComponent(match[1]);
  return slug.length > 0 && slug.length <= 128 ? slug : null;
}

/** 저장된 초대 slug를 삭제한다. clearStoredInviteCode()와 함께 호출한다. */
export function clearStoredInviteSlug(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${INVITE_SLUG_COOKIE}=; Max-Age=0; path=/`;
}
