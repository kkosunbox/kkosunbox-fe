// ── SubscriptionPlan ──────────────────────────────────────────────

export interface SubscriptionPlanDto {
  id: number;
  name: string;
  monthlyPrice: number;
  /**
   * 표시 순서. 백엔드가 1~3을 내려주면 티어(베이직/스탠다드/프리미엄) 매핑에 사용.
   * 0 또는 미설정인 경우 프론트는 `name`·`id`로 티어·색상을 추론함.
   */
  sortOrder: number;
  isRecommended: boolean;
  description?: string;
}

// ── Subscription ──────────────────────────────────────────────────

export type SubscriptionStatus =
  | "active"
  | "cancelled"
  | "paymentFailed"
  | "suspended";

export interface UserSubscriptionDto {
  id: number;
  userId: number;
  petProfileId: number;
  deliveryAddressId: number;
  plan: SubscriptionPlanDto;
  quantity: number;
  status: SubscriptionStatus;
  nextBillingDate: string; // YYYY-MM-DD
  isActive: boolean;
  /** true면 이번 결제일에 결제 건너뜀 (쉬어가기 활성화) */
  isPaused: boolean;
  pendingPlanId?: number;
  cancelledAt?: string;   // date-time
  terminatedAt?: string;  // date-time
}

// ── Payment ───────────────────────────────────────────────────────

export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type PaymentType = "initial" | "renewal" | "upgrade";
export type DeliveryStatus = "PendingDelivery" | "DeliveryInProgress" | "DeliveryCompleted";

export interface SubscriptionPaymentDto {
  id: number;
  subscriptionId: number;
  status: PaymentStatus;
  amount: number;       // 최종 결제 금액 (부가세 포함)
  baseAmount: number;   // 기본 금액 (부가세 제외)
  taxAmount: number;    // 부가세 금액 (10%)
  createdAt: string;    // date-time
  approvedAt?: string | null;   // date-time
  cancelledAt?: string | null;  // date-time
  deliveredAt?: string | null;  // date-time
  deliveryStatus?: DeliveryStatus;
  failureReason?: string;
  method?: string;
  paymentType?: PaymentType;
  planName?: string;            // 플랜 이름 스냅샷
  trackingNumber?: string | null;
}

// ── Coupon ────────────────────────────────────────────────────────

export interface CouponInfo {
  name?: string;
  description?: string;
  discountRate: number;   // 1~100 (%)
  startDate?: string;     // date-time, null이면 제한 없음
  endDate?: string;       // date-time, null이면 제한 없음
  canUse: boolean;
  unavailableReason?: string;
}

// ── 요청 ──────────────────────────────────────────────────────────

export interface CreateSubscriptionRequest {
  petProfileId?: number;
  deliveryAddressId: number;
  planId: number;
  quantity?: number; // 1~99, 기본값 1. 쿠폰 할인은 단가 1개에만 적용
  // billingDate?: string; // YYYY-MM-DD — 백엔드에서 더 이상 요구하지 않아 미사용
  couponCode?: string;
}

export interface ChangePlanRequest {
  newPlanId: number;
}

export interface ChangeDeliveryAddressRequest {
  deliveryAddressId: number;
}

export interface GetCouponInfoRequest {
  code: string; // 최대 30자, 대소문자 구분 안함
}

export interface CancelPaymentRequest {
  /** 구독도 함께 취소할지 여부 (기본 false) */
  cancelSubscription?: boolean;
}

// ── 응답 ──────────────────────────────────────────────────────────

export interface SubscriptionPlanListResponse {
  plans: SubscriptionPlanDto[];
}

export interface SubscriptionListResponse {
  subscriptions: UserSubscriptionDto[];
}

export interface CreateSubscriptionResponse {
  subscription: UserSubscriptionDto;
}

export interface ChangePlanResponse {
  subscription: UserSubscriptionDto;
}

export interface PauseSubscriptionResponse {
  subscription: UserSubscriptionDto;
}

export interface PaymentHistoryResponse {
  payments: SubscriptionPaymentDto[];
}

export interface PaginatedPaymentHistoryResponse {
  payments: SubscriptionPaymentDto[];
  total: number;
  page: number;
  limit: number;
}

export interface DeliveryStatusSummaryResponse {
  pendingDelivery: number;
  deliveryInProgress: number;
  deliveryCompleted: number;
}

export interface GetPaymentHistoryParams {
  deliveryStatus?: DeliveryStatus;
  page?: number;
  limit?: number;
}

export interface PaymentReceiptResponse {
  receiptUrl: string;
}
