/**
 * 서버 전용 결제수단 데이터 패칭.
 * "server-only" 임포트로 클라이언트 번들에 포함되면 빌드 에러 발생.
 */
import "server-only";
import { apiClient } from "@/shared/lib/api";
import type { BillingInfo } from "./types";

function serverOpts(token?: string) {
  return { token, skipRefresh: true } as const;
}

/** 활성 결제수단 반환 (없으면 null) */
export async function fetchBillingInfo(token?: string): Promise<BillingInfo | null> {
  const data = await apiClient
    .get<{ billingInfos: BillingInfo[] }>("/v1/billing", serverOpts(token))
    .catch(() => ({ billingInfos: [] as BillingInfo[] }));
  return data.billingInfos[0] ?? null;
}
