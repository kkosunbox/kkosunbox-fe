import { apiClient } from "@/shared/lib/api";
import type { BillingInfo, BillingTermsResponse, BillingTermsType } from "./types";

/**
 * 등록된 모든 결제 수단 조회
 *
 * Toss 자동결제(빌링) 등록/변경은 authKey·customerKey가 successUrl 리다이렉트로만
 * 전달되므로 클라이언트에 노출하지 않고 서버에서 처리한다 → `./queries.ts`의
 * `registerBillingKey`/`updateBillingKey` 참고.
 */
export function getBillingInfos() {
  return apiClient.get<{ billingInfos: BillingInfo[] }>("/v1/billing");
}

/**
 * 결제 수단 삭제
 * 활성 구독이 있는 경우 자동 갱신 불가 상태가 됨
 */
export function deleteBilling(id: number) {
  return apiClient.delete<void>(`/v1/billing/${id}`);
}

/**
 * 결제 서비스 약관 조회
 * 결제 진행 전 사용자에게 표시 필수
 */
export function getBillingTerms(termsType: BillingTermsType) {
  return apiClient.get<BillingTermsResponse>(
    `/v1/billing/terms?termsType=${termsType}`,
  );
}
