import { apiClient } from "@/shared/lib/api";
import { paymentHistoryQuery } from "../lib/paymentHistoryQuery";
import type {
  CombinedDeliveryStatusSummaryResponse,
  GetCombinedPaymentHistoryParams,
  PaginatedCombinedPaymentHistoryResponse,
} from "./types";

/**
 * 구독 + 단건 통합 결제 이력 조회 (deliveryStatus 필터, 페이지네이션 지원).
 * pending/failed 건은 백엔드에서 제외하고 최신순으로 합쳐서 내려준다.
 */
export function getCombinedPaymentHistory(params?: GetCombinedPaymentHistoryParams) {
  return apiClient.get<PaginatedCombinedPaymentHistoryResponse>(
    `/v1/payments${paymentHistoryQuery(params)}`,
  );
}

/** 구독 + 단건 배송 상태 요약 조회 */
export function getCombinedDeliveryStatusSummary() {
  return apiClient.get<CombinedDeliveryStatusSummaryResponse>("/v1/payments/delivery-summary");
}
