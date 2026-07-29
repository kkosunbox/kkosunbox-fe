/**
 * 서버 전용 단건 구매(Product) 데이터 패칭.
 * "server-only" 임포트로 클라이언트 번들에 포함되면 빌드 에러 발생.
 */
import "server-only";
import { apiClient } from "@/shared/lib/api";
import { logProductFetch, logConfirmRequest, logConfirmSuccess, logConfirmFailure } from "../lib/productDebugLog";
import type { ConfirmProductOrderRequest, GetProductOrdersParams, ProductDto, ProductOrderDto } from "./types";

function serverOpts(token?: string) {
  return { token, skipRefresh: true } as const;
}

/** 단건 판매 상품 목록 */
export async function fetchProducts(token?: string): Promise<ProductDto[]> {
  const data = await apiClient
    .get<{ products: ProductDto[] }>("/v1/products", serverOpts(token))
    .catch(() => ({ products: [] as ProductDto[] }));
  logProductFetch(data.products);
  return data.products;
}

/** 내 단건 주문 목록 */
export async function fetchProductOrders(
  token?: string,
  params?: GetProductOrdersParams,
): Promise<ProductOrderDto[]> {
  const parts: string[] = [];
  if (params?.page !== undefined) parts.push(`page=${params.page}`);
  if (params?.limit !== undefined) parts.push(`limit=${params.limit}`);
  if (params?.planId !== undefined) parts.push(`planId=${params.planId}`);
  const query = parts.length > 0 ? `?${parts.join("&")}` : "";
  const data = await apiClient
    .get<{ orders: ProductOrderDto[] }>(`/v1/products/orders${query}`, serverOpts(token))
    .catch(() => ({ orders: [] as ProductOrderDto[] }));
  return data.orders;
}

/**
 * 결제 승인 (서버 컴포넌트 전용 — successUrl 리다이렉트 처리용).
 * 목록 조회 헬퍼와 달리 실패를 삼키지 않고 그대로 던진다 — 호출부에서 성공/실패를 구분해야 하기 때문.
 */
export async function confirmProductOrderServer(
  token: string | undefined,
  body: ConfirmProductOrderRequest,
): Promise<ProductOrderDto> {
  logConfirmRequest(body);
  try {
    const order = await apiClient.post<ProductOrderDto>(
      "/v1/products/orders/confirm",
      body,
      serverOpts(token),
    );
    logConfirmSuccess(order);
    return order;
  } catch (err) {
    logConfirmFailure(err);
    throw err;
  }
}
