import { normalizeGuestOrderId } from "./orderNumber";

/**
 * 비회원 주문 상세 접근 정보 — 같은 탭의 sessionStorage에만 둔다.
 *
 * 조회에는 주문자 연락처가 필요하지만 개인정보를 URL에 넣을 수 없으므로,
 * 조회 폼·주문 완료 화면에서 저장하고 `/guest-orders/[orderId]`가 읽어 조회 API를 다시 호출한다.
 * 값이 없으면(새 탭·링크 공유) 상세 페이지는 조회 폼으로 돌려보낸다.
 */
const STORAGE_KEY = "ggosoonbox_guest_order_access";

export interface GuestOrderAccess {
  orderId: string;
  ordererPhone: string;
}

export function saveGuestOrderAccess(access: GuestOrderAccess) {
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ orderId: normalizeGuestOrderId(access.orderId), ordererPhone: access.ordererPhone.replace(/\D/g, "") }),
    );
  } catch {
    // 저장소 차단 — 상세 페이지에서 조회 폼으로 돌아간다.
  }
}

/** 해당 주문번호의 접근 정보만 돌려준다 */
export function readGuestOrderAccess(orderId: string): GuestOrderAccess | null {
  try {
    const parsed: unknown = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "null");
    if (!parsed || typeof parsed !== "object") return null;
    const { orderId: storedId, ordererPhone } = parsed as Record<string, unknown>;
    if (typeof storedId !== "string" || typeof ordererPhone !== "string") return null;
    return storedId === normalizeGuestOrderId(orderId) ? { orderId: storedId, ordererPhone } : null;
  } catch {
    return null;
  }
}

export function clearGuestOrderAccess() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}
