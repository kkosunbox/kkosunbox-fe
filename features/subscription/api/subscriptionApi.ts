import { apiClient } from "@/shared/lib/api";
import type {
  ChangePlanRequest,
  ChangePlanResponse,
  ChangeDeliveryAddressRequest,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  GetCouponInfoRequest,
  CouponInfo,
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

/** 구독 시작 (빌링키 등록 필요, 첫 결제는 billingDate에 자동 청구) */
export function createSubscription(body: CreateSubscriptionRequest) {
  return apiClient.post<CreateSubscriptionResponse>("/v1/subscriptions", body);
}

/** 내 구독 목록 조회 */
export function getSubscriptions() {
  return apiClient.get<SubscriptionListResponse>("/v1/subscriptions");
}

/** 구독 취소 (즉시 취소) */
export function cancelSubscription(subscriptionId: number) {
  return apiClient.delete<void>(`/v1/subscriptions/${subscriptionId}`);
}

/** 구독 재활성화 (취소한 구독 복구) */
export function reactivateSubscription(subscriptionId: number) {
  return apiClient.post<void>(
    `/v1/subscriptions/${subscriptionId}/reactivate`,
  );
}

/** 결제 이력 조회 */
export function getPaymentHistory() {
  return apiClient.get<PaymentHistoryResponse>("/v1/subscriptions/payments");
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
