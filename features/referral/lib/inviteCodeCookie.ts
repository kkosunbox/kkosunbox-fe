/**
 * 레퍼럴(초대) 코드 어트리뷰션.
 *
 * 유저가 `https://kkosunbox.com/...?r=CODE` 형태의 초대 링크로 진입하면
 * 미들웨어(`middleware.ts`)가 코드를 쿠키에 저장하고 URL에서 `r`을 제거한다.
 * 이 모듈은 그 쿠키의 이름·정책과 읽기/삭제 헬퍼를 한곳에서 관리한다.
 *
 * 설계 메모:
 *  - non-httpOnly 쿠키 — 레퍼럴 랜딩의 클라이언트 Provider가 slug에서 얻은 코드를 기록한다.
 *    가입 요청에 전달할 때는 서버 액션이 같은 쿠키를 다시 읽는다.
 *  - 인증(`ggosoon-auth`)과 독립된 별도 쿠키 — 로그아웃은 auth 쿠키만 삭제하므로
 *    로그인/로그아웃/회원가입 흐름에서도 초대 코드가 유지된다.
 */
export const INVITE_CODE_COOKIE = "ggosoon-ref";

/** 어트리뷰션 윈도우 — 진입 후 24시간 동안 초대 코드를 유지한다. */
export const INVITE_CODE_MAX_AGE_SEC = 60 * 60 * 24;

/** 초대 코드 최대 길이. */
export const INVITE_CODE_MAX_LENGTH = 64;

/** 허용 코드 형식 (영숫자·`-`·`_`). 쿠키 인젝션 방지용 화이트리스트. */
const INVITE_CODE_PATTERN = new RegExp(`^[A-Za-z0-9_-]{1,${INVITE_CODE_MAX_LENGTH}}$`);

export function isValidInviteCode(code: string): boolean {
  return INVITE_CODE_PATTERN.test(code);
}

/** 저장된 초대 코드를 삭제한다. 구독 생성 등으로 코드를 소비한 뒤 호출한다. */
export function clearStoredInviteCode(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${INVITE_CODE_COOKIE}=; Max-Age=0; path=/`;
}

export const INVITE_SLUG_COOKIE = "ggosoon-ref-slug";

/** 저장된 초대 slug를 삭제한다. clearStoredInviteCode()와 함께 호출한다. */
export function clearStoredInviteSlug(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${INVITE_SLUG_COOKIE}=; Max-Age=0; path=/`;
}
