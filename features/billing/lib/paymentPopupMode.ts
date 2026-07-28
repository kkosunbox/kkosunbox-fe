/**
 * 결제 팝업(`/payment`) 진입 목적. `?mode=…`로 전달된다.
 *
 * - `change`  마이페이지 "결제등록/변경" — 등록된 카드가 있으면 확인 1단계 후 Toss.
 * - `direct`  주문 페이지 "카드 등록/변경" — 이미 변경 의사가 확인된 상태라 즉시 Toss.
 * - 미지정    기존 결제수단 선택 흐름(결제수단 → 등록카드 → 카드등록).
 *
 * 서버 컴포넌트(`app/payment/page.tsx`)에서 호출하므로 클라이언트 모듈에 두지 않는다.
 */
export type PaymentPopupMode = "change" | "direct";

export function parsePaymentPopupMode(value: string | undefined): PaymentPopupMode | null {
  return value === "change" || value === "direct" ? value : null;
}
