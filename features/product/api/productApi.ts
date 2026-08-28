import { apiClient } from "@/shared/lib/api";
import type {
  ConfirmProductOrderRequest,
  CreateProductOrderRequest,
  CreateProductOrderResponse,
  GetProductCouponInfoRequest,
  GetProductOrdersParams,
  PaginatedProductOrderResponse,
  ProductCouponInfo,
  ProductDto,
  ProductListResponse,
  ProductOrderDto,
  ProductOrderPlanSummariesResponse,
  ProductOrderReceiptResponse,
  QuoteProductPriceRequest,
  QuoteProductPriceResponse,
} from "./types";

// POST /v1/products/webhook/toss는 Toss → 백엔드 서버 간 웹훅이라 프론트에서 호출하지 않으므로 여기 포함하지 않는다.

/** 단건 판매 상품 목록 조회 */
export function getProducts() {
  return apiClient.get<ProductListResponse>("/v1/products");
}

/** 단건 판매 상품 상세 조회 */
export function getProduct(id: number) {
  return apiClient.get<ProductDto>(`/v1/products/${id}`);
}

/** 단건 주문 생성 (Pending 상태로 생성, 반환된 orderId/amount로 토스 결제위젯을 오픈한다) */
// 이 함수는 클라이언트에서 직접 호출된다. 과거 여기에 요청/응답을 찍는 `[product-debug]`
// console 로그가 있었으나, 배송지·수량·금액이 사용자 브라우저 콘솔에 그대로 노출되어 제거했다.
// 디버깅이 필요하면 서버 측(features/product/api/queries.ts)의 개발 전용 로그를 쓸 것.
export function createProductOrder(id: number, body: CreateProductOrderRequest) {
  return apiClient.post<CreateProductOrderResponse>(`/v1/products/${id}/orders`, body);
}

/** 내 단건 주문 목록 조회 */
export function getProductOrders(params?: GetProductOrdersParams) {
  const parts: string[] = [];
  if (params?.page !== undefined) parts.push(`page=${params.page}`);
  if (params?.limit !== undefined) parts.push(`limit=${params.limit}`);
  if (params?.planId !== undefined) parts.push(`planId=${params.planId}`);
  const query = parts.length > 0 ? `?${parts.join("&")}` : "";
  return apiClient.get<PaginatedProductOrderResponse>(
    `/v1/products/orders${query}`,
  );
}

/** relatedPlanId별 단건 주문 요약 (누적결제금액, 주문건수, 리뷰 작성 가능 여부 등) */
export function getProductOrderPlanSummaries() {
  return apiClient.get<ProductOrderPlanSummariesResponse>(
    "/v1/products/orders/plan-summaries",
  );
}

/** 단건 주문 상세 조회 */
export function getProductOrder(id: number) {
  return apiClient.get<ProductOrderDto>(`/v1/products/orders/${id}`);
}

/** 결제 승인 (토스 결제위젯 완료 후 successUrl로 받은 orderId/paymentKey/amount를 그대로 전달) */
export function confirmProductOrder(body: ConfirmProductOrderRequest) {
  return apiClient.post<ProductOrderDto>("/v1/products/orders/confirm", body);
}

/** 단건 주문 취소 (환불) — 결제 완료 + 배송 전 상태 주문만 가능 */
export function cancelProductOrder(id: number) {
  return apiClient.post<void>(`/v1/products/orders/${id}/cancel`);
}

/** 단건 주문 결제 영수증 PDF URL 조회 */
export function getProductOrderReceipt(id: number) {
  return apiClient.get<ProductOrderReceiptResponse>(
    `/v1/products/orders/${id}/receipt`,
  );
}

/** 단건 구매 쿠폰 코드 조회 */
export function getProductCouponInfo(body: GetProductCouponInfoRequest) {
  return apiClient.post<ProductCouponInfo>("/v1/products/coupon/info", body);
}

/** 단품 결제 예정 금액 조회 — 서버가 쿠폰까지 반영해 확정한 금액을 반환한다 */
export function getProductPriceQuote(id: number, body: QuoteProductPriceRequest) {
  return apiClient.post<QuoteProductPriceResponse>(`/v1/products/${id}/price`, body);
}
