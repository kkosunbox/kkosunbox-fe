import type { SubscriptionPaymentDto } from "../api/types";

/**
 * 결제 취소(환불) 가능 여부.
 *
 * 백엔드 계약은 **결제 완료 + 배송 전(`PendingDelivery`)** 뿐이다
 * (`subscriptionApi.cancelPayment` 주석, 그리고 위반 시 `PAYMENT_CANCELLATION_NOT_ALLOWED`:
 * "결제 완료 후 배송 전 상태에서만 취소할 수 있습니다").
 *
 * 과거에는 화면마다 `deliveryStatus !== "DeliveryCompleted"`로 판정했는데, 이 조건은
 * **배송중(`DeliveryInProgress`)을 걸러내지 못해** 취소 불가한 건에도 버튼을 노출했다.
 * 같은 규칙이 여러 화면에 복제되지 않도록 이 함수 하나만 쓴다.
 */
export function isPaymentCancelable(payment: SubscriptionPaymentDto): boolean {
  return payment.status === "completed" && payment.deliveryStatus === "PendingDelivery";
}
