import type { GetCombinedPaymentHistoryParams } from "../api/types";

/**
 * `GET /v1/payments` 쿼리스트링 생성.
 * 서버 컴포넌트(queries.ts)와 클라이언트(paymentApi.ts)가 같은 URL을 만들도록 한 곳에 둔다.
 */
export function paymentHistoryQuery(params?: GetCombinedPaymentHistoryParams): string {
  const parts: string[] = [];
  if (params?.deliveryStatus) parts.push(`deliveryStatus=${params.deliveryStatus}`);
  if (params?.page !== undefined) parts.push(`page=${params.page}`);
  if (params?.limit !== undefined) parts.push(`limit=${params.limit}`);
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}
