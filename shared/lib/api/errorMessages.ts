import { ApiError } from "./types";

/**
 * 백엔드 에러 코드 → 사용자 친화적 한국어 메시지 맵
 *
 * 백엔드 응답의 `code` 필드를 키로 사용한다.
 * 여기에 없는 코드는 fallback 메시지가 표시된다.
 */
const ERROR_MESSAGES: Record<string, string> = {
  // 공통
  ALREADY_EXISTS: "이미 가입된 이메일입니다.",
  UNAUTHORIZED: "인증 정보가 올바르지 않습니다.",
  FORBIDDEN: "접근 권한이 없습니다.",
  NOT_FOUND: "요청한 정보를 찾을 수 없습니다.",
  INVALID_INPUT: "입력 정보를 확인해주세요.",

  // 이메일 인증
  INVALID_OTP: "인증코드가 올바르지 않습니다.",
  OTP_EXPIRED: "인증코드가 만료되었습니다. 다시 요청해주세요.",
  TOO_MANY_REQUESTS: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  RESEND_COOLDOWN: "재전송 대기 시간이 지나지 않았습니다.",
  DAILY_LIMIT_EXCEEDED: "일일 발송 한도를 초과했습니다. 내일 다시 시도해주세요.",

  // 비밀번호
  INVALID_PASSWORD: "비밀번호가 올바르지 않습니다.",
  WEAK_PASSWORD: "비밀번호가 보안 조건을 충족하지 않습니다.",
  RESET_TOKEN_EXPIRED: "비밀번호 재설정 링크가 만료되었습니다.",

  // 결제 (billing)
  INVALID_BILLING_KEY: "카드 정보가 올바르지 않습니다.\n카드번호, 유효기간, 비밀번호를 확인해주세요.",
  MISSING_AUTHENTICATION_TOKEN: "로그인이 필요합니다.",
  INVALID_ACCESS_TOKEN: "로그인이 만료되었습니다. 다시 로그인해주세요.",
  BAD_REQUEST: "요청 정보를 확인해주세요.",
};

const DEFAULT_FALLBACK = "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

/**
 * 에러 객체에서 사용자에게 보여줄 메시지를 반환한다.
 *
 * @param error - catch 블록에서 받은 에러 객체
 * @param fallback - ERROR_MESSAGES에 매칭되지 않을 때 사용할 기본 메시지
 */
export function getErrorMessage(
  error: unknown,
  fallback: string = DEFAULT_FALLBACK,
): string {
  if (error instanceof ApiError) {
    return ERROR_MESSAGES[error.code] ?? fallback;
  }
  return fallback;
}

/**
 * 특정 에러 코드인지 확인한다.
 */
export function isErrorCode(error: unknown, code: string): boolean {
  return error instanceof ApiError && error.code === code;
}
