/**
 * 서버 전용 구독 데이터 패칭.
 * "server-only" 임포트로 클라이언트 번들에 포함되면 빌드 에러 발생.
 */
import "server-only";
import { apiClient } from "@/shared/lib/api";
import type { UserSubscriptionDto, SubscriptionPlanDto, SubscriptionPaymentDto } from "./types";

function serverOpts(token?: string) {
  return { token, skipRefresh: true } as const;
}

/** 활성 구독 반환 (없으면 null) */
export async function fetchActiveSubscription(token?: string): Promise<UserSubscriptionDto | null> {
  const data = await apiClient
    .get<{ subscriptions: UserSubscriptionDto[] }>("/v1/subscriptions", serverOpts(token))
    .catch(() => ({ subscriptions: [] as UserSubscriptionDto[] }));
  return data.subscriptions.find((s) => s.isActive) ?? null;
}

/** 전체 구독 목록 */
export async function fetchSubscriptions(token?: string): Promise<UserSubscriptionDto[]> {
  const data = await apiClient
    .get<{ subscriptions: UserSubscriptionDto[] }>("/v1/subscriptions", serverOpts(token))
    .catch(() => ({ subscriptions: [] as UserSubscriptionDto[] }));
  return data.subscriptions;
}

/** 구독 플랜 목록 (profileId 전달 시 백엔드가 isRecommended 설정) */
export async function fetchSubscriptionPlans(
  token?: string,
  profileId?: number,
): Promise<SubscriptionPlanDto[]> {
  const query = profileId !== undefined ? `?profileId=${profileId}` : "";
  const data = await apiClient
    .get<{ plans: SubscriptionPlanDto[] }>(
      `/v1/subscriptions/plans${query}`,
      serverOpts(token),
    )
    .catch(() => ({ plans: [] as SubscriptionPlanDto[] }));
  return [...data.plans].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.id - b.id;
  });
}

/** 결제 내역 */
export async function fetchPaymentHistory(token?: string): Promise<SubscriptionPaymentDto[]> {
  const data = await apiClient
    .get<{ payments: SubscriptionPaymentDto[] }>("/v1/subscriptions/payments", serverOpts(token))
    .catch(() => ({ payments: [] as SubscriptionPaymentDto[] }));
  return data.payments;
}

/** 구독 단위 결제 내역 */
export async function fetchSubscriptionPaymentHistory(
  subscriptionId: number,
  token?: string,
): Promise<SubscriptionPaymentDto[]> {
  const data = await apiClient
    .get<{ payments: SubscriptionPaymentDto[] }>(
      `/v1/subscriptions/${subscriptionId}/payments`,
      serverOpts(token),
    )
    .catch(() => ({ payments: [] as SubscriptionPaymentDto[] }));
  return data.payments;
}
