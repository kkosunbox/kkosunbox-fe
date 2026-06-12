import { apiClient } from "@/shared/lib/api";
import type { MyReferralCode, ReferralValidation } from "./types";

/** 내 레퍼럴 코드 조회 */
export function getMyReferralCode() {
  return apiClient.get<MyReferralCode>("/v1/referral/me");
}

/**
 * 초대 코드 적용 가능 여부 확인.
 * isApplicable=true이면 구독 생성 시 discountRate만큼 할인 적용됨.
 * 코드가 유효하지 않거나 첫 구독이 아닌 경우 isApplicable=false.
 */
export function validateReferralCode(code: string) {
  const query = new URLSearchParams({ code }).toString();
  return apiClient.get<ReferralValidation>(`/v1/referral/validate?${query}`);
}
