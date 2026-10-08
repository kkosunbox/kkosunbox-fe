import type { OrderPolicyDto } from "@/shared/lib/orderPolicy";
import type { CartDto } from "../api/types";

/** 진행바에서 [최소 주문 금액, 무료배송] 마커가 놓이는 위치(%) — 금액 비례가 아니라 디자인 고정 위치 */
export type PackageMarkerPositions = readonly [minimum: number, freeShipping: number];
/** PC 패널·모달 (Figma 280px 트랙의 61px / 219px 지점) */
export const PACKAGE_PANEL_MARKERS: PackageMarkerPositions = [21.8, 78.2];
/** 모바일 바텀시트 (Figma 327px 트랙의 81px / 246px 지점) */
export const PACKAGE_SHEET_MARKERS: PackageMarkerPositions = [24.8, 75.2];

/**
 * 내 패키지 진행 상태 — 최소 주문·무료배송 판정은 서버 기준과 같이 판매가 합계(주문 가능한 상품만)로 한다.
 * 정책 조회에 실패하면 최소 주문 금액은 0(제한 없음)으로 보고, 무료배송 기준은 장바구니 응답 값을 쓴다.
 */
export function getPackageProgress(cart: CartDto | null, policy: OrderPolicyDto | null) {
  const amount = Math.max(0, cart?.itemsAmount ?? 0);
  const minimum = Math.max(0, policy?.minimumOrderAmount ?? 0);
  const threshold = Math.max(0, policy?.freeShippingThreshold ?? cart?.freeShippingThreshold ?? 0);
  const orderableIds = cart?.items.filter((item) => item.isOrderable).map((item) => item.id) ?? [];
  const hasOrderable = orderableIds.length > 0;
  // 실제 배송비는 견적 결과를 따르고, 담은 상품이 없을 때만 정책의 기본 배송비를 보여준다.
  const shippingFee = hasOrderable ? cart?.shippingFee ?? 0 : policy?.shippingFee ?? 0;
  const isFree = hasOrderable && amount > 0 && shippingFee === 0;
  /** 무료배송 적용 시 취소선으로 보여줄 원래 배송비 (정책 기본 배송비, 조회 전이면 0) */
  const baseShippingFee = policy?.shippingFee ?? 0;
  const minimumReached = hasOrderable && amount >= minimum;

  return {
    amount,
    minimum,
    threshold,
    shippingFee,
    baseShippingFee,
    isFree,
    minimumReached,
    orderableIds,
    remainingToMinimum: Math.max(0, minimum - amount),
    remainingToFree: isFree ? 0 : Math.max(0, threshold - amount),
  };
}

export type PackageProgress = ReturnType<typeof getPackageProgress>;

/** 진행바 채움(%) — 최소 주문 전·무료배송 전 구간을 각각 마커 사이에 비례해서 채운다 */
export function getPackageProgressPercent(progress: PackageProgress, [minimumAt, freeAt]: PackageMarkerPositions) {
  const { amount, minimum, threshold, isFree } = progress;
  if (isFree || (threshold > 0 && amount >= threshold)) return 100;
  if (amount <= 0) return 0;
  if (amount < minimum) return (amount / minimum) * minimumAt;
  const span = threshold - minimum;
  const ratio = span > 0 ? (amount - minimum) / span : 0;
  return Math.min(100, minimumAt + ratio * (freeAt - minimumAt));
}

/** 50000 → "5만원" — 만원 단위로 떨어지지 않으면 일반 금액 표기 */
export function formatManwon(amount: number) {
  return amount > 0 && amount % 10000 === 0 ? `${amount / 10000}만원` : `${amount.toLocaleString("ko-KR")}원`;
}
