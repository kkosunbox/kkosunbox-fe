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
export async function createProductOrder(
  id: number,
  body: CreateProductOrderRequest,
) {
  // TODO(product-debug): 카탈로그 안정화되면 이 로그 제거. 브라우저 콘솔(F12)에서 확인 — 클라이언트에서 직접 호출해 서버 로그엔 안 남는다.
  console.info(`[product-debug] → POST /v1/products/${id}/orders`, JSON.stringify(body));
  try {
    const order = await apiClient.post<CreateProductOrderResponse>(
      `/v1/products/${id}/orders`,
      body,
    );
    console.info(`[product-debug] ✓ POST /v1/products/${id}/orders 성공`, JSON.stringify(order));
    return order;
  } catch (err) {
    const apiErr = err as { statusCode?: number; code?: string; message?: string; traceId?: string | null };
    console.error(
      `[product-debug] ✗ POST /v1/products/${id}/orders 실패`,
      JSON.stringify({
        statusCode: apiErr?.statusCode ?? null,
        code: apiErr?.code ?? null,
        message: apiErr?.message ?? String(err),
        traceId: apiErr?.traceId ?? null,
      }),
    );
    throw err;
  }
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
