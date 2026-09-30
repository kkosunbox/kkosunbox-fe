import { apiClient } from "@/shared/lib/api";
import type { MyReferralCode, ReferralPageResponse } from "./types";

/** 내 레퍼럴 코드 조회 */
export function getMyReferralCode() {
  return apiClient.get<MyReferralCode>("/v1/referral/me");
}

/** 인플루언서 초대 페이지 정보 조회 (공개 API, /r/{slug} 랜딩에서 사용) */
export function getReferralPage(slug: string) {
  return apiClient.get<ReferralPageResponse>(`/v1/referral/pages/${encodeURIComponent(slug)}`);
}
