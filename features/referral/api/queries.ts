import "server-only";
import { cache } from "react";
import { apiClient } from "@/shared/lib/api";
import type { MyReferralCode, ReferralPageResponse, ReferralValidation } from "./types";

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

/**
 * 초대코드 적용 가능 여부 (서버 판정).
 *
 * `?r=CODE`로 진입한 경우 쿠키에는 **코드만** 있고 slug가 없다 — 그때 할인율과 적용 가능 여부를
 * 얻는 유일한 경로다. `resolveReferralContext`가 요청당 한 번만 부르도록 `cache()`를 건다.
 * 코드가 유효하지 않으면 백엔드가 400을 주므로 null로 환원한다.
 */
export const fetchReferralValidation = cache(
  async (code: string, token?: string): Promise<ReferralValidation | null> =>
    apiClient
      .get<ReferralValidation>(`/v1/referral/validate?code=${encodeURIComponent(code)}`, serverOpts(token))
      .catch(() => null),
);
