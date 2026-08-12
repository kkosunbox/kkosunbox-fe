import type { UserSubscriptionDto } from "../api/types";

/**
 * 구독 카드·요약에 "결제금액"으로 표시할 값.
 *
 * 서버의 `lastPaidAmount`(쿠폰·레퍼럴 할인이 모두 반영된 가장 최근 완료 결제액)를 그대로 쓴다.
 * 정가(`plan.monthlyPrice × quantity`)로 계산하면 안 되는 이유는 두 값이 실제로 어긋나기 때문이다 —
 * 레퍼럴은 첫 달만, 쿠폰은 `applyCount` 회차만 할인되므로 정가는 "청구된 금액"이 아니다.
 * (예: 프리미엄 6BOX + `welcome10`(applyCount 1) → 첫 결제 170,510원, 정가는 173,400원)
 *
 * 결제 이력이 없는 구독(예약 구독, 첫 결제 실패 등)은 표시할 실결제액 자체가 없으므로 null.
 * 이때 정가를 대신 보여주면 아직 일어나지 않은 결제를 확정 금액처럼 안내하게 되므로 대체하지 않는다.
 *
 * 서버가 "다음 결제 예정액"을 내려주게 되면 이 함수의 참조 필드만 바꾸면 된다.
 */
export function subscriptionPaidAmount(subscription: UserSubscriptionDto): number | null {
  return subscription.lastPaidAmount ?? null;
}

/**
 * 여러 구독의 결제금액 합계. 결제 이력이 없는 구독(null)은 합계에서 제외한다.
 * 합계에 넣을 값이 하나도 없으면 null — 호출부에서 "-" 표시와 0원을 구분할 수 있게 한다.
 */
export function totalSubscriptionPaidAmount(subscriptions: UserSubscriptionDto[]): number | null {
  const amounts = subscriptions
    .map(subscriptionPaidAmount)
    .filter((amount): amount is number => amount !== null);
  if (amounts.length === 0) return null;
  return amounts.reduce((sum, amount) => sum + amount, 0);
}
