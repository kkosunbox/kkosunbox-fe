import { apiClient } from "@/shared/lib/api";
import type { MyReferralCode } from "./types";

/** 내 레퍼럴 코드 조회 */
export function getMyReferralCode() {
  return apiClient.get<MyReferralCode>("/v1/referral/me");
}
