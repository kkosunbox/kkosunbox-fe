/**
 * `window.open`으로 띄우는 팝업 전용 라우트.
 *
 * 좁은 팝업 창(650×700)에 채널톡 등 전역 위젯이 뜨면 결제·배송지 입력 UI를 가린다.
 * 하위 경로까지 포함하므로 `/payment`는 `/payment/billing/success`·`/fail`도 함께 커버한다.
 */
export const POPUP_ROUTE_PREFIXES = ["/payment", "/address", "/delivery"] as const;

/** 주어진 pathname이 팝업 전용 라우트(또는 그 하위 경로)인지 판별한다. */
export function isPopupRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return POPUP_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
