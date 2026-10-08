import { getErrorMessage, isErrorCode } from "@/shared/lib/api";

/** 백엔드 규칙과 동일 — 숫자만 9~11자리, 0으로 시작 */
export function isValidGuestPhone(digits: string) {
  return /^0\d{8,10}$/.test(digits);
}

/**
 * 비회원 주문 조회·취소·영수증 에러 메시지.
 * 주문이 없거나 주문자 연락처가 다르면 백엔드가 같은 `PAYMENT_NOT_FOUND`를 주므로,
 * 회원 화면의 "결제 내역을 찾을 수 없습니다" 대신 입력값 확인을 안내한다.
 */
export function getGuestOrderAccessErrorMessage(err: unknown, fallback?: string) {
  if (isErrorCode(err, "PAYMENT_NOT_FOUND")) return "주문번호 또는 주문자 연락처를 확인해 주세요.";
  return getErrorMessage(err, fallback);
}
