import "server-only";
import { apiClient } from "@/shared/lib/api";
import type { MyReferralCode } from "./types";

function serverOpts(token?: string) {
  return { token, skipRefresh: true } as const;
}

export async function fetchMyReferralCode(token?: string): Promise<MyReferralCode | null> {
  return apiClient
    .get<MyReferralCode>("/v1/referral/me", serverOpts(token))
    .catch(() => null);
}
