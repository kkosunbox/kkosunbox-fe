import type { SubscriptionStatus } from "../api/types";

/**
 * 구독 상태 → 목록 탭·카드 표시 버킷 (순수 함수).
 *
 * `isActive` 필드는 "지금 결제가 진행 중인가"만 나타내 scheduled(구독 시작일 예약,
 * 아직 첫 결제 전)를 false로 내려준다 — 이걸 그대로 쓰면 시작 전 구독이 "구독종료"로
 * 잘못 표시된다. 표시 목적의 분류는 반드시 이 함수(=status 기준)로 판단할 것.
 *
 * - active·scheduled → "active" (전체보기 "구독중" 탭, scheduled는 "구독예정" 배지로 구분)
 * - cancelled·paymentFailed·suspended → "ended" ("구독종료" 탭)
 */
export type SubscriptionDisplayBucket = "active" | "ended";

export function getSubscriptionDisplayBucket(status: SubscriptionStatus): SubscriptionDisplayBucket {
  return status === "active" || status === "scheduled" ? "active" : "ended";
}

export function isScheduledSubscription(status: SubscriptionStatus): boolean {
  return status === "scheduled";
}
