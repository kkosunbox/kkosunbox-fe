/**
 * 서버 전용 통합 결제 데이터 패칭.
 * "server-only" 임포트로 클라이언트 번들에 포함되면 빌드 에러 발생.
 */
import "server-only";
import { apiClient } from "@/shared/lib/api";
import { paymentHistoryQuery } from "../lib/paymentHistoryQuery";
import type {
  CombinedDeliveryStatusSummaryResponse,
  GetCombinedPaymentHistoryParams,
  PaginatedCombinedPaymentHistoryResponse,
} from "./types";

function serverOpts(token?: string) {
  return { token, skipRefresh: true } as const;
}

/** 구독 + 단건 배송 상태 요약 */
export async function fetchCombinedDeliveryStatusSummary(
  token?: string,
): Promise<CombinedDeliveryStatusSummaryResponse> {
  return apiClient
    .get<CombinedDeliveryStatusSummaryResponse>("/v1/payments/delivery-summary", serverOpts(token))
    .catch(() => ({ pendingDelivery: 0, deliveryInProgress: 0, deliveryCompleted: 0 }));
}

/** 구독 + 단건 통합 결제 이력 (페이지네이션 메타 포함) */
export async function fetchCombinedPaymentHistory(
  token?: string,
  params?: GetCombinedPaymentHistoryParams,
): Promise<PaginatedCombinedPaymentHistoryResponse> {
  return apiClient
    .get<PaginatedCombinedPaymentHistoryResponse>(
      `/v1/payments${paymentHistoryQuery(params)}`,
      serverOpts(token),
    )
    .catch(() => ({
      payments: [],
      total: 0,
      page: params?.page ?? 1,
      limit: params?.limit ?? 20,
    }));
}
