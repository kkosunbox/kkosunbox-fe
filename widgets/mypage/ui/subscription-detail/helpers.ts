import type { SubscriptionPaymentDto } from "@/features/subscription/api/types";

export const DISPLAY_STATUS_LABEL: Record<SubscriptionPaymentDto["displayStatus"], string> = {
  pending: "결제대기",
  failed: "결제실패",
  preparing: "상품준비중",
  shipping: "배송중",
  delivered: "배송완료",
  refunded: "환불완료",
  partially_refunded: "부분환불",
};

export const EPOST_TRACKING_BASE =
  "https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm";

export const ITEMS_PER_PAGE = 10;

export const ROW_GRID =
  "grid max-lg:grid-cols-[1fr_120px_110px_130px_60px] lg:grid-cols-[345px_225px_253px_235px_1fr] items-center";

/** 테이블 헤더·행 공통 좌우 여백 (Figma: 구독 컬럼 x=62) */
export const ROW_PADDING = "max-lg:pl-[30px] lg:pl-[62px] pr-2";

export const ROW_HEIGHT = "h-[49px]";

export function formatDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, ".");
}

export function formatPrice(n: number): string {
  return n.toLocaleString("ko-KR") + "원";
}

export function billingDayLabel(dateStr: string): string {
  const day = parseInt(dateStr.slice(8, 10), 10);
  return `매달 ${day}일`;
}

export function billingDayFromDate(dateStr: string): number {
  return parseInt(dateStr.slice(8, 10), 10);
}

/** `YYYY-MM-DD` → `2026년 8월 15일`. 다른 날짜 헬퍼처럼 문자열만 파싱해 타임존 오차를 피한다. */
export function formatKoreanDate(dateStr: string): string {
  const [year, month, day] = dateStr.slice(0, 10).split("-").map(Number);
  return `${year}년 ${month}월 ${day}일`;
}

// 백엔드 계약(ChangeBillingDayRequest)과 동일하게 매달 1~31일
export const BILLING_DAY_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1);

export function deriveStartDate(payments: SubscriptionPaymentDto[], fallback: string): string {
  const completed = payments
    .filter((p) => p.status === "completed" && (p.approvedAt ?? p.createdAt))
    .map((p) => (p.approvedAt ?? p.createdAt).slice(0, 10))
    .sort();
  return completed[0] ?? fallback;
}
