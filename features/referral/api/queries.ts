import "server-only";
import { apiClient } from "@/shared/lib/api";
import type { MyReferralCode, ReferralPageResponse } from "./types";

function serverOpts(token?: string) {
  return { token, skipRefresh: true } as const;
}

export async function fetchMyReferralCode(token?: string): Promise<MyReferralCode | null> {
  return apiClient
    .get<MyReferralCode>("/v1/referral/me", serverOpts(token))
    .catch(() => null);
}

/** 인플루언서 초대 페이지 정보 조회 (공개, 토큰 불필요) */
export async function fetchReferralPage(slug: string): Promise<ReferralPageResponse | null> {
  return apiClient
    .get<ReferralPageResponse>(`/v1/referral/pages/${encodeURIComponent(slug)}`)
    .catch(() => null);
}
