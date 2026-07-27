import type { BillingInfo } from "../api/types";

/**
 * 카드 표시 문자열을 한 곳에서 만든다. 표시가 필요한 곳은 반드시 이 헬퍼를 거친다.
 *
 * 백엔드가 아직 카드사명(`cardCompany`)을 제대로 내려주지 못한다 —
 * null이거나 테스트 환경 더미값("모의카드")이 온다. 그대로 템플릿에 끼우면
 * 화면에 "null"·"모의카드"가 노출되므로, 이럴 땐 `cardType`("신용"/"체크")을
 * 라벨로 사용한다. 실제 카드사명이 내려오기 시작하면 그 값이 그대로 우선한다.
 */

/** 백엔드가 실제 카드사명 대신 내려주는 더미값 — 표시하지 않고 카드 타입으로 대체한다. */
const PLACEHOLDER_CARD_COMPANIES = ["모의카드"];

/** `cardType` → 표시 라벨. 매핑에 없는 값은 중립 라벨로 떨어뜨린다. */
const CARD_TYPE_LABELS: Record<string, string> = {
  신용: "신용카드",
  체크: "체크카드",
  기프트: "기프트카드",
};

const CARD_LABEL_FALLBACK = "카드";
const LAST_FOUR_FALLBACK = "****";

/** 카드 타입 라벨. `"신용"` → `"신용카드"`, 알 수 없으면 `"카드"` */
export function getCardTypeLabel(billing: BillingInfo): string {
  const type = billing.cardType?.trim();
  if (!type) return CARD_LABEL_FALLBACK;
  return CARD_TYPE_LABELS[type] ?? CARD_LABEL_FALLBACK;
}

/**
 * 화면에 쓰는 카드 이름.
 * 쓸 만한 카드사명이 있으면 그것을, 없으면 카드 타입 라벨을 반환한다.
 */
export function getCardName(billing: BillingInfo): string {
  const company = billing.cardCompany?.trim();
  if (company && !PLACEHOLDER_CARD_COMPANIES.includes(company)) return company;
  return getCardTypeLabel(billing);
}

/** 카드번호 끝 4자리. 없으면 마스킹 문자로 대체한다. */
export function getLastFourDigits(billing: BillingInfo): string {
  return billing.lastFourDigits?.trim() || LAST_FOUR_FALLBACK;
}

/** `신용카드 (****-****-****-0141)` — 마이페이지 결제수단 표시 공통 포맷 */
export function formatCardLabel(billing: BillingInfo): string {
  return `${getCardName(billing)} (****-****-****-${getLastFourDigits(billing)})`;
}
