// ── CombinedPayment ───────────────────────────────────────────────
//
// `GET /v1/payments` 계열은 **구독 결제와 단건 주문을 하나로 합친** 통합 이력이다.
// 구독 전용(`/v1/subscriptions/payments`)·단건 전용(`/v1/products/orders`) 응답과는
// 필드 구성이 달라(`planName`/`productName` → `name`, 배송지가 건별로 내려옴) 별도 타입을 둔다.
// 상태 enum은 `features/product`가 그렇듯 슬라이스 안에서 자립시킨다 — 구독 슬라이스를
// 참조하면 `features/subscription`(DeliveryStatusManager) ↔ `features/payment` 순환이 생긴다.
// 배송지만 예외로 `features/delivery-address`를 그대로 쓴다(아래 주석 참고).

import type { DeliveryAddress } from "@/features/delivery-address/api/types";

/** 주문 유형 — 구독 결제 / 단건 주문 */
export type OrderType = "subscription" | "product";

export type CombinedPaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "partially_refunded";

/** 구독 결제만 가지는 결제 종류 */
export type CombinedPaymentType = "initial" | "renewal" | "upgrade";

export type CombinedDeliveryStatus =
  | "PendingDelivery"
  | "DeliveryInProgress"
  | "DeliveryCompleted";

/** status/deliveryStatus를 조합한 통합 표시 상태 */
export type CombinedPaymentDisplayStatus =
  | "pending"
  | "failed"
  | "preparing"
  | "shipping"
  | "delivered"
  | "refunded"
  | "partially_refunded";

/**
 * 결제 건에 스냅샷된 배송지.
 *
 * 백엔드 `DeliveryAddressDto`는 `GET /v1/delivery-addresses` 응답과 **완전히 같은 스키마**라
 * (id·nickname·receiverName·phoneNumber·zipCode·address·addressDetail·memo·createdAt·updatedAt,
 * 2026-09-10 스펙 확인) 타입을 따로 선언하지 않고 그대로 참조한다. 여기만 복제하면 배송지
 * 스키마가 바뀔 때 한쪽만 갱신돼 어긋난다. `features/delivery-address`는 이 슬라이스를
 * 참조하지 않으므로 순환은 생기지 않는다.
 *
 * 배송지가 삭제된 경우 `deliveryAddress` 자체가 null로 내려온다 —
 * 이때 **다른 배송지로 대체 표시하지 말 것**(엉뚱한 주소를 보여주게 된다).
 */
export type PaymentDeliveryAddressDto = DeliveryAddress;

/** GET /v1/payments 의 결제 이력 항목 (구독 결제 + 단건 주문 통합) */
export interface CombinedPaymentDto {
  /** 결제/주문 ID — `orderType`이 다르면 ID가 겹칠 수 있으므로 단독 key로 쓰지 말 것 */
  id: number;
  orderType: OrderType;
  /** 플랜명(구독) 또는 상품명(단건) */
  name: string;
  /** 최종 결제 금액 (부가세 포함) */
  amount: number;
  status: CombinedPaymentStatus;
  displayStatus: CombinedPaymentDisplayStatus;
  createdAt: string; // date-time
  approvedAt?: string | null; // date-time
  cancelledAt?: string | null; // date-time
  deliveredAt?: string | null; // date-time
  deliveryAddress?: PaymentDeliveryAddressDto | null;
  deliveryStatus?: CombinedDeliveryStatus;
  /** 결제 방법 (예: 카드, 가상계좌, 계좌이체) */
  method?: string | null;
  /** 결제 종류 — 구독 결제만 */
  paymentType?: CombinedPaymentType;
  /** 상품 ID — 단건 주문만 */
  productId?: number;
  /** 수량 — 단건 주문만 */
  quantity?: number;
  /** 구독 ID — 구독 결제만 */
  subscriptionId?: number;
  trackingNumber?: string | null;
}

// ── 요청 ──────────────────────────────────────────────────────────

export interface GetCombinedPaymentHistoryParams {
  deliveryStatus?: CombinedDeliveryStatus;
  /** 페이지 번호 (기본값 1) */
  page?: number;
  /** 페이지당 항목 수 (기본값 20) */
  limit?: number;
}

// ── 응답 ──────────────────────────────────────────────────────────

export interface PaginatedCombinedPaymentHistoryResponse {
  payments: CombinedPaymentDto[];
  total: number;
  page: number;
  limit: number;
}

/** 구독 + 단건 배송 상태별 건수 합산 */
export interface CombinedDeliveryStatusSummaryResponse {
  pendingDelivery: number;
  deliveryInProgress: number;
  deliveryCompleted: number;
}
