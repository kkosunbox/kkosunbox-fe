/**
 * 서버 전용 결제수단 데이터 패칭.
 * "server-only" 임포트로 클라이언트 번들에 포함되면 빌드 에러 발생.
 */
import "server-only";
import { apiClient } from "@/shared/lib/api";
import type { BillingInfo, RegisterBillingRequest, UpdateBillingRequest } from "./types";

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

/**
 * Toss 빌링키 발급(신규 등록). authKey·customerKey는 Toss successUrl 리다이렉트로만
 * 전달되므로, 클라이언트로 다시 내려보내지 않도록 반드시 서버(Server Component)에서 호출한다.
 */
export function registerBillingKey(body: RegisterBillingRequest, token?: string) {
  return apiClient.post<BillingInfo>("/v1/billing/register", body, serverOpts(token));
}

/** Toss 빌링키 발급(카드 변경). 기존 billingInfoId를 유지하며 갱신한다. */
export function updateBillingKey(body: UpdateBillingRequest, token?: string) {
  return apiClient.put<BillingInfo>("/v1/billing/update", body, serverOpts(token));
}
