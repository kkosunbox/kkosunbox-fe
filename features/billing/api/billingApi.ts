import { apiClient } from "@/shared/lib/api";
import type {
  BillingInfo,
  BillingTermsResponse,
  BillingTermsType,
  RegisterBillingRequest,
  UpdateBillingRequest,
} from "./types";

/** 등록된 모든 결제 수단 조회 */
export function getBillingInfos() {
  return apiClient.get<{ billingInfos: BillingInfo[] }>("/v1/billing");
}

/**
 * 결제 수단 등록 (나이스페이 빌링키 발급)
 * 결제 수단은 1개만 등록 가능. 이미 등록된 경우 400 INVALID_BILLING_KEY
 */
export function registerBilling(body: RegisterBillingRequest) {
  return apiClient.post<BillingInfo>("/v1/billing/register", body);
}

/**
 * 결제 수단 변경
 * 기존 billingInfoId를 유지하면서 새 카드 정보로 갱신
 */
export function updateBilling(body: UpdateBillingRequest) {
  return apiClient.put<BillingInfo>("/v1/billing/update", body);
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
