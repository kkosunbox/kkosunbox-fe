import type { BillingInfo } from "../api/types";

/**
 * 카드 표시 문자열을 한 곳에서 만든다.
 *
 * 백엔드가 카드사명·끝 4자리를 null로 내려주는 경우가 있어(카드사 매핑 실패 등)
 * 템플릿 문자열에 그대로 끼우면 화면에 "null"이 노출된다. 표시가 필요한 곳은
 * 반드시 이 헬퍼를 거친다.
 */

const CARD_COMPANY_FALLBACK = "신용카드";
const LAST_FOUR_FALLBACK = "****";

/** 카드사명. 없으면 중립 라벨("신용카드")로 대체한다. */
export function getCardCompany(billing: BillingInfo): string {
  return billing.cardCompany?.trim() || CARD_COMPANY_FALLBACK;
}

/** 카드번호 끝 4자리. 없으면 마스킹 문자로 대체한다. */
export function getLastFourDigits(billing: BillingInfo): string {
  return billing.lastFourDigits?.trim() || LAST_FOUR_FALLBACK;
}

/** `신용카드 (****-****-****-0141)` — 마이페이지 결제수단 표시 공통 포맷 */
export function formatCardLabel(billing: BillingInfo): string {
  return `${getCardCompany(billing)} (****-****-****-${getLastFourDigits(billing)})`;
}
