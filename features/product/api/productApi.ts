import { apiClient } from "@/shared/lib/api";
import type {
  ConfirmProductOrderRequest,
  CreateProductOrderRequest,
  CreateProductOrderResponse,
  GetProductOrdersParams,
  PaginatedProductOrderResponse,
  ProductDto,
  ProductListResponse,
  ProductOrderDto,
  ProductOrderReceiptResponse,
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
export function createProductOrder(
  id: number,
  body: CreateProductOrderRequest,
) {
  return apiClient.post<CreateProductOrderResponse>(
    `/v1/products/${id}/orders`,
    body,
  );
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
