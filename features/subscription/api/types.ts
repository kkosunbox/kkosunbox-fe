// ── SubscriptionPlan ──────────────────────────────────────────────

export interface SubscriptionPlanTagDto {
  id: number;
  name: string;
  bgColor: string;
  textColor: string;
}

export interface SubscriptionPlanDto {
  id: number;
  name: string;
  monthlyPrice: number;
  /** 할인 전 가격 (표시용). 할인 없는 플랜은 null. */
  originalPrice?: number | null;
  /** 할인율 (1~100, 정수 %). 표시 시 `${discountRate}%` 형태로 사용. 할인 없는 플랜은 null. */
  discountRate?: number | null;
  /**
   * 표시 순서. 백엔드가 1~3을 내려주면 티어(베이직/스탠다드/프리미엄) 매핑에 사용.
   * 0 또는 미설정인 경우 프론트는 `name`·`id`로 티어·색상을 추론함.
   */
  sortOrder: number;
  isRecommended: boolean;
  /** 플랜 평균 별점 */
  averageRating: number;
  description?: string | null;
  tags: SubscriptionPlanTagDto[];
}

// ── Subscription ──────────────────────────────────────────────────

export type SubscriptionStatus =
  | "active"
  | "cancelled"
  | "paymentFailed"
  | "suspended"
  | "scheduled";

export interface UserSubscriptionDto {
  id: number;
  userId: number;
  petProfileId: number;
  deliveryAddressId: number;
  plan: SubscriptionPlanDto;
  quantity: number;
  status: SubscriptionStatus;
  startDate?: string;       // YYYY-MM-DD
  nextBillingDate: string;  // YYYY-MM-DD
  isActive: boolean;
  /** true면 이번 결제일에 결제 건너뜀 (쉬어가기 활성화) */
  isPaused: boolean;
  /**
   * 가장 최근 완료(completed) 결제의 실제 청구액 — 쿠폰·레퍼럴 할인이 모두 반영된
   * 부가세 포함 최종 금액. 결제가 한 번도 완료되지 않은 구독(예약 구독 등)은 null.
   *
   * **정가(`plan.monthlyPrice × quantity`)로 대체하지 말 것.** 레퍼럴은 첫 달만,
   * 쿠폰은 `applyCount` 회차만 할인되므로 두 값은 자주 어긋난다.
   * 표시에는 `features/subscription/lib/subscriptionAmount.ts`를 거친다.
   */
  lastPaidAmount?: number | null;
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

/** status/deliveryStatus를 조합한 통합 표시 상태 */
export type SubscriptionPaymentDisplayStatus =
  | "pending"
  | "failed"
  | "preparing"
  | "shipping"
  | "delivered"
  | "refunded"
  | "partially_refunded";

export interface SubscriptionPaymentDto {
  id: number;
  subscriptionId: number;
  status: PaymentStatus;
  displayStatus: SubscriptionPaymentDisplayStatus;
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

/** 할인 방식 — 정률(percent) / 정액(fixed) */
export type CouponDiscountType = "percent" | "fixed";

/**
 * POST /v1/subscriptions/coupon/info 응답 (GetCouponInfoResponse).
 *
 * 단건 구매 쿠폰(`features/product/api/types.ts`의 `ProductCouponInfo`)과 **별개 체계**다.
 * 구독 쿠폰에만 정액 할인(`discountType: "fixed"`)과 회차(`applyCount`)가 있고,
 * 단건 쿠폰에만 할인 상한(`maxDiscountAmount`)이 있다. 두 타입을 서로 대입하지 말 것.
 */
export interface CouponInfo {
  /** 쿠폰 사용 가능 여부 */
  canUse: boolean;
  /** 할인 방식 (정률/정액) */
  discountType: CouponDiscountType;
  /** 할인 적용 횟수 (최초 결제 포함). 예: 5면 구독 시작 + 갱신 4회까지 할인 */
  applyCount: number;
  /**
   * 할인율 (1~100, 단위: %) — 스펙상 정률 할인일 때만 값이 있다.
   * 다만 실제 응답은 정액 쿠폰에도 이 값이 함께 실려 온다(dev `spring30`: fixed인데 rate 30).
   * **어느 필드가 찼는지로 타입을 판단하지 말고 반드시 `discountType`으로 분기할 것.**
   */
  discountRate?: number | null;
  /** 할인 금액 (단위: 원) — 정액 할인일 때만 값이 있음 (위 주의사항 동일) */
  discountAmount?: number | null;
  /** 쿠폰 이름 */
  name?: string | null;
  /** 쿠폰 설명 */
  description?: string | null;
  /** 쿠폰 사용 시작 시간 (date-time, null이면 제한 없음) */
  startDate?: string | null;
  /** 쿠폰 사용 종료 시간 (date-time, null이면 제한 없음) */
  endDate?: string | null;
  /** 사용 불가 사유 (사용 가능한 경우 null) */
  unavailableReason?: string | null;
}

// ── 요청 ──────────────────────────────────────────────────────────

export interface CreateSubscriptionRequest {
  petProfileId?: number;
  deliveryAddressId: number;
  planId: number;
  quantity?: number; // 1~99, 기본값 1. 쿠폰 할인은 단가 1개에만 적용
  // billingDate?: string; // YYYY-MM-DD — 백엔드에서 더 이상 요구하지 않아 미사용
  couponCode?: string;
  referralCode?: string; // 추천인 레퍼럴 코드 (선택). ?ref로 진입한 첫 구독자에 한해 서버가 할인 적용
  /** 구독 시작 예약일 (YYYY-MM-DD, 선택). 전달 시 즉시결제 없이 이 날짜부터 구독이 시작되며, 오늘 이후 날짜만 가능 */
  startDate?: string;
}

export interface ChangePlanRequest {
  newPlanId: number;
}

export interface ChangeDeliveryAddressRequest {
  deliveryAddressId: number;
}

export interface ChangeBillingDayRequest {
  /** 새 결제일 (매달 1~31일) */
  billingDay: number;
}

export interface GetCouponInfoRequest {
  code: string; // 최대 30자, 대소문자 구분 안함
}

export interface CancelPaymentRequest {
  /** 구독도 함께 취소할지 여부 (기본 false) */
  cancelSubscription?: boolean;
}

// ── 응답 ──────────────────────────────────────────────────────────

export interface RecommendReasonDto {
  title: string;
  content: string;
}

export interface SubscriptionPlanListResponse {
  plans: SubscriptionPlanDto[];
  recommendReasons?: RecommendReasonDto[];
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
