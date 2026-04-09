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
  status: SubscriptionStatus;
  nextBillingDate: string; // YYYY-MM-DD
  isActive: boolean;
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

export interface SubscriptionPaymentDto {
  id: number;
  subscriptionId: number;
  status: PaymentStatus;
  amount: number;       // 최종 결제 금액 (부가세 포함)
  baseAmount: number;   // 기본 금액 (부가세 제외)
  taxAmount: number;    // 부가세 금액 (10%)
  createdAt: string;    // date-time
  approvedAt?: string;  // date-time
  failureReason?: string;
  method?: string;
  paymentType?: PaymentType;
  planName?: string;    // 플랜 이름 스냅샷
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
  petProfileId: number;
  deliveryAddressId: number;
  planId: number;
  billingDate: string; // YYYY-MM-DD, 오늘로부터 최소 1일 ~ 최대 3일 이후
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

export interface PaymentHistoryResponse {
  payments: SubscriptionPaymentDto[];
}

export interface PaymentReceiptResponse {
  receiptUrl: string;
}
