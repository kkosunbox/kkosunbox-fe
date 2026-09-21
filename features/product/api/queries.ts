/**
 * 서버 전용 단건 구매(Product) 데이터 패칭.
 * "server-only" 임포트로 클라이언트 번들에 포함되면 빌드 에러 발생.
 */
import "server-only";
import { apiClient } from "@/shared/lib/api";
import { logProductFetch, logConfirmRequest, logConfirmSuccess, logConfirmFailure } from "../lib/productDebugLog";
import type {
  ConfirmProductOrderRequest,
  GetProductOrdersParams,
  GetProductsParams,
  ProductCategoryDto,
  ProductDto,
  ProductOrderDto,
  ProductOrderPlanSummaryDto,
} from "./types";

function serverOpts(token?: string) {
  return { token, skipRefresh: true } as const;
}

/** 단건 판매 상품 목록 */
export async function fetchProducts(token?: string, params?: GetProductsParams): Promise<ProductDto[]> {
  const searchParams = new URLSearchParams();
  if (params?.categoryId !== undefined) searchParams.set("categoryId", String(params.categoryId));
  if (params?.sortOrder !== undefined) searchParams.set("sortOrder", params.sortOrder);
  const query = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
  const data = await apiClient
    .get<{ products: ProductDto[] }>(`/v1/products${query}`, serverOpts(token))
    .catch(() => ({ products: [] as ProductDto[] }));
  logProductFetch(data.products);
  return data.products;
}

/** 단품몰 활성 카테고리 목록 */
export async function fetchProductCategories(token?: string): Promise<ProductCategoryDto[]> {
  const data = await apiClient
    .get<{ categories: ProductCategoryDto[] }>("/v1/products/categories", serverOpts(token))
    .catch(() => ({ categories: [] as ProductCategoryDto[] }));
  return data.categories;
}

/** 단건 판매 상품 상세 */
export async function fetchProduct(id: number, token?: string): Promise<ProductDto | null> {
  return apiClient
    .get<ProductDto>(`/v1/products/${id}`, serverOpts(token))
    .catch(() => null);
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

/** relatedPlanId별 단건 주문 요약 (누적결제금액, 주문건수, 리뷰 작성 가능 여부 등) */
export async function fetchProductOrderPlanSummaries(
  token?: string,
): Promise<ProductOrderPlanSummaryDto[]> {
  const data = await apiClient
    .get<{ summaries: ProductOrderPlanSummaryDto[] }>(
      "/v1/products/orders/plan-summaries",
      serverOpts(token),
    )
    .catch(() => ({ summaries: [] as ProductOrderPlanSummaryDto[] }));
  return data.summaries;
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
