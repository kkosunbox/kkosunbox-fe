// ── Product ───────────────────────────────────────────────────────

export interface ProductDto {
  id: number;
  name: string;
  /** 판매 가격 (부가세 포함) */
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  /** 연관 구독 플랜 ID (리뷰 공유용) */
  relatedPlanId?: number | null;
}

// ── ProductOrder ──────────────────────────────────────────────────

export type ProductOrderStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type ProductDeliveryStatus =
  | "PendingDelivery"
  | "DeliveryInProgress"
  | "DeliveryCompleted";

/** status/deliveryStatus를 조합한 통합 표시 상태 */
export type ProductOrderDisplayStatus =
  | "pending"
  | "failed"
  | "preparing"
  | "shipping"
  | "delivered"
  | "refunded"
  | "partially_refunded";

export interface ProductOrderDto {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  amount: number;
  status: ProductOrderStatus;
  displayStatus: ProductOrderDisplayStatus;
  deliveryStatus?: ProductDeliveryStatus;
  trackingNumber?: string | null;
  /** 결제 방법 (예: 카드, 가상계좌, 계좌이체) */
  method?: string | null;
  deliveredAt?: string | null; // date-time
  approvedAt?: string | null; // date-time
  createdAt: string; // date-time
}

// ── 요청 ──────────────────────────────────────────────────────────

export interface GetProductOrdersParams {
  page?: number;
  limit?: number;
  /** 연관 구독 플랜 ID로 필터 */
  planId?: number;
}

export interface CreateProductOrderRequest {
  /** 배송지 ID */
  deliveryAddressId: number;
  quantity: number;
  /** 할인 쿠폰 코드 (선택). 주문 총액에 할인율이 적용된다. */
  couponCode?: string;
}

export interface ConfirmProductOrderRequest {
  orderId: string;
  paymentKey: string;
  amount: number;
}

export interface GetProductCouponInfoRequest {
  code: string; // 최대 30자, 대소문자 구분 안함
}

// ── 응답 ──────────────────────────────────────────────────────────

export interface ProductListResponse {
  products: ProductDto[];
}

export interface PaginatedProductOrderResponse {
  orders: ProductOrderDto[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateProductOrderResponse {
  /** 주문 ID (토스 결제위젯에 전달) */
  orderId: string;
  /** 결제 금액 (토스 결제위젯에 전달) */
  amount: number;
  /** 주문명 (토스 결제위젯에 전달) */
  orderName: string;
}

export interface ProductOrderReceiptResponse {
  /** 영수증 PDF URL */
  receiptUrl: string;
}

// ── ProductPriceQuote ────────────────────────────────────────────

export interface QuoteProductPriceRequest {
  quantity: number;
  /** 할인 쿠폰 코드 (선택). 주문 총액에 할인율이 적용된다. */
  couponCode?: string;
}

/** POST /v1/products/{id}/price 응답 — 서버가 확정한 결제 예정 금액 */
export interface QuoteProductPriceResponse {
  /** 상품 단가 (부가세 포함) */
  unitPrice: number;
  quantity: number;
  /** 할인 전 금액 (단가 × 수량) */
  originalAmount: number;
  /** 쿠폰 할인 금액 */
  couponDiscountAmount: number;
  /** 실제 결제 금액 (쿠폰 적용 후 100원 단위 내림) */
  amount: number;
}

// ── ProductCoupon ────────────────────────────────────────────────

/** POST /v1/products/coupon/info 응답 (GetProductCouponInfoResponse) */
export interface ProductCouponInfo {
  /** 쿠폰 사용 가능 여부 */
  canUse: boolean;
  /** 할인율 (1~100, 단위: %) */
  discountRate: number;
  /** 쿠폰 이름 */
  name?: string | null;
  /** 쿠폰 설명 */
  description?: string | null;
  /** 최대 할인 금액 (원, null이면 제한 없음) */
  maxDiscountAmount?: number | null;
  /** 쿠폰 사용 시작 시간 (date-time, null이면 제한 없음) */
  startDate?: string | null;
  /** 쿠폰 사용 종료 시간 (date-time, null이면 제한 없음) */
  endDate?: string | null;
  /** 사용 불가 사유 (사용 가능한 경우 null) */
  unavailableReason?: string | null;
}

// ── ProductOrderPlanSummary ───────────────────────────────────────

export interface ProductOrderPlanSummaryDto {
  /** 연관 구독 플랜 ID */
  planId: number;
  /** 플랜명 */
  planName: string;
  /** 결제완료 주문 건수 */
  orderCount: number;
  /** 결제완료 누적 금액 */
  totalPaidAmount: number;
  /** 리뷰 작성 가능 여부 (구독/단건 배송완료 공유 자격 + 미작성) */
  canReview: boolean;
  /** 리뷰 작성 완료 여부 */
  hasReview: boolean;
  /** 리뷰 수정 가능 여부 (작성 후 24시간 이내) */
  isEditable: boolean;
  /** 작성한 리뷰 ID (없으면 null) */
  reviewId?: number | null;
}

export interface ProductOrderPlanSummariesResponse {
  summaries: ProductOrderPlanSummaryDto[];
}
