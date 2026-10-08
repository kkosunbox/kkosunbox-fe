/**
 * 비회원 주문번호 — 8자(`K7M2Q9PX`), `0`·`O`·`1`·`I` 미사용.
 * 화면에는 `K7M2-Q9PX`로 보여주고, 조회는 하이픈·공백·대소문자를 구분하지 않는다.
 */
export const GUEST_ORDER_ID_LENGTH = 8;

export function normalizeGuestOrderId(value: string) {
  return value.replace(/[\s-]/g, "").toUpperCase();
}

export function formatGuestOrderId(value: string) {
  const normalized = normalizeGuestOrderId(value);
  return normalized.length === GUEST_ORDER_ID_LENGTH
    ? `${normalized.slice(0, 4)}-${normalized.slice(4)}`
    : normalized;
}

export function isGuestOrderIdComplete(value: string) {
  return normalizeGuestOrderId(value).length === GUEST_ORDER_ID_LENGTH;
}
