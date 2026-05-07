import { apiClient } from "@/shared/lib/api";
import type {
  CancelPaymentRequest,
  ChangePlanRequest,
  ChangePlanResponse,
  ChangeDeliveryAddressRequest,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  GetCouponInfoRequest,
  CouponInfo,
  PauseSubscriptionResponse,
  PaymentHistoryResponse,
  PaymentReceiptResponse,
  SubscriptionListResponse,
  SubscriptionPlanListResponse,
  UserSubscriptionDto,
} from "./types";

/** 구독 플랜 목록 조회 (profileId 전달 시 isRecommended 값 설정) */
export function getSubscriptionPlans(profileId?: number) {
  const query = profileId !== undefined ? `?profileId=${profileId}` : "";
  return apiClient.get<SubscriptionPlanListResponse>(
    `/v1/subscriptions/plans${query}`,
  );
}

/** 구독 시작 (빌링키 등록 필요, 구독 생성 즉시 결제 진행) */
export function createSubscription(body: CreateSubscriptionRequest) {
  return apiClient.post<CreateSubscriptionResponse>("/v1/subscriptions", body);
}

/** 내 구독 목록 조회 */
export function getSubscriptions() {
  return apiClient.get<SubscriptionListResponse>("/v1/subscriptions");
}

/** 구독 취소 (즉시 취소). cancelEligiblePayments=true 시 결제완료+배송전 건도 함께 환불 */
export function cancelSubscription(subscriptionId: number, cancelEligiblePayments?: boolean) {
  const query = cancelEligiblePayments ? "?cancelEligiblePayments=true" : "";
  return apiClient.delete<void>(`/v1/subscriptions/${subscriptionId}${query}`);
}

/** 구독 재활성화 (취소한 구독 복구) */
export function reactivateSubscription(subscriptionId: number) {
  return apiClient.post<void>(
    `/v1/subscriptions/${subscriptionId}/reactivate`,
  );
}

/** 구독 쉬어가기 (이번 달 결제 건너뛰기) — Active/PaymentFailed 상태에서 사용 가능 */
export function pauseSubscription(subscriptionId: number) {
  return apiClient.post<PauseSubscriptionResponse>(
    `/v1/subscriptions/${subscriptionId}/pause`,
  );
}

/** 구독 쉬어가기 해제 (다음 결제일 정상 결제) */
export function resumeSubscription(subscriptionId: number) {
  return apiClient.post<PauseSubscriptionResponse>(
    `/v1/subscriptions/${subscriptionId}/resume`,
  );
}

/** 결제 이력 조회 */
export function getPaymentHistory() {
  return apiClient.get<PaymentHistoryResponse>("/v1/subscriptions/payments");
}

/** 구독 단위 결제 이력 조회 */
export function getSubscriptionPaymentHistory(subscriptionId: number) {
  return apiClient.get<PaymentHistoryResponse>(
    `/v1/subscriptions/${subscriptionId}/payments`,
  );
}

/** 결제 취소 (환불) — 결제 완료 + 배송 전 상태 결제 건만 가능 */
export function cancelPayment(
  paymentId: number,
  body: CancelPaymentRequest = {},
) {
  return apiClient.post<void>(
    `/v1/subscriptions/payments/${paymentId}/cancel`,
    body,
  );
}

/** 플랜 변경 (변경 사항은 다음 결제일에 반영) */
export function changePlan(subscriptionId: number, body: ChangePlanRequest) {
  return apiClient.post<ChangePlanResponse>(
    `/v1/subscriptions/${subscriptionId}/plan/change`,
    body,
  );
}

/** 구독 배송지 변경 */
export function changeDeliveryAddress(
  subscriptionId: number,
  body: ChangeDeliveryAddressRequest,
) {
  return apiClient.patch<UserSubscriptionDto>(
    `/v1/subscriptions/${subscriptionId}/delivery-address`,
    body,
  );
}

/** 결제 영수증 PDF URL 조회 */
export function getPaymentReceipt(paymentId: string) {
  return apiClient.get<PaymentReceiptResponse>(
    `/v1/subscriptions/payment/${paymentId}/receipt`,
  );
}

/** 쿠폰 정보 조회 */
export function getCouponInfo(body: GetCouponInfoRequest) {
  return apiClient.post<CouponInfo>("/v1/subscriptions/coupon/info", body);
}
