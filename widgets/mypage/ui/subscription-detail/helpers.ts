import type { SubscriptionPaymentDto } from "@/features/subscription/api/types";

export const DELIVERY_STATUS_LABEL: Record<string, string> = {
  PendingDelivery: "상품준비중",
  DeliveryInProgress: "배송중",
  DeliveryCompleted: "배송완료",
};

export const EPOST_TRACKING_BASE =
  "https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm";

export const ITEMS_PER_PAGE = 10;

export const ROW_GRID =
  "grid max-lg:grid-cols-[1fr_120px_130px_152px_72px] lg:grid-cols-[1fr_120px_130px_152px_140px] items-center";

export const ROW_HEIGHT = "h-[49px]";

export type DisplayStatus = "예정" | "완료" | "실패" | "환불";

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

export function deriveStartDate(payments: SubscriptionPaymentDto[], fallback: string): string {
  const completed = payments
    .filter((p) => p.status === "completed" && (p.approvedAt ?? p.createdAt))
    .map((p) => (p.approvedAt ?? p.createdAt).slice(0, 10))
    .sort();
  return completed[0] ?? fallback;
}

export function toDisplayStatus(status: SubscriptionPaymentDto["status"]): DisplayStatus {
  if (status === "pending") return "예정";
  if (status === "completed") return "완료";
  if (status === "refunded" || status === "partially_refunded") return "환불";
  return "실패";
}
