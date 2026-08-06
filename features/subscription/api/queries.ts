/**
 * 서버 전용 구독 데이터 패칭.
 * "server-only" 임포트로 클라이언트 번들에 포함되면 빌드 에러 발생.
 */
import "server-only";
import { apiClient } from "@/shared/lib/api";
import { getSubscriptionDisplayBucket } from "../lib/subscriptionDisplayBucket";
import type {
  UserSubscriptionDto,
  SubscriptionPlanDto,
  SubscriptionPaymentDto,
  DeliveryStatusSummaryResponse,
  GetPaymentHistoryParams,
  PaginatedPaymentHistoryResponse,
} from "./types";

function serverOpts(token?: string) {
  return { token, skipRefresh: true } as const;
}

/**
 * 활성 구독 반환 (없으면 null).
 *
 * isActive는 안 쓴다 — "지금 결제 중인가"만 나타내 scheduled(시작 예약, 첫 결제 전)도
 * false로 내려오는데, 정상적으로 결제가 이뤄지고 있거나 이뤄질 예정인 구독(active·scheduled)은
 * 여전히 대표로 보여줄 가치가 있다. paymentFailed·suspended·cancelled는 제외.
 */
export async function fetchActiveSubscription(token?: string): Promise<UserSubscriptionDto | null> {
  const data = await apiClient
    .get<{ subscriptions: UserSubscriptionDto[] }>("/v1/subscriptions", serverOpts(token))
    .catch(() => ({ subscriptions: [] as UserSubscriptionDto[] }));
  return data.subscriptions.find((s) => getSubscriptionDisplayBucket(s.status) === "active") ?? null;
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

/** 배송 상태 요약 조회 */
export async function fetchDeliveryStatusSummary(
  token?: string,
): Promise<DeliveryStatusSummaryResponse> {
  return apiClient
    .get<DeliveryStatusSummaryResponse>("/v1/subscriptions/payments/delivery-summary", serverOpts(token))
    .catch(() => ({ pendingDelivery: 0, deliveryInProgress: 0, deliveryCompleted: 0 }));
}

/** 배송 상태별 결제 내역 (페이지네이션 메타 포함) */
export async function fetchPaginatedPaymentHistory(
  token?: string,
  params?: GetPaymentHistoryParams,
): Promise<PaginatedPaymentHistoryResponse> {
  const parts: string[] = [];
  if (params?.deliveryStatus) parts.push(`deliveryStatus=${params.deliveryStatus}`);
  if (params?.page !== undefined) parts.push(`page=${params.page}`);
  if (params?.limit !== undefined) parts.push(`limit=${params.limit}`);
  const query = parts.length > 0 ? `?${parts.join("&")}` : "";
  return apiClient
    .get<PaginatedPaymentHistoryResponse>(`/v1/subscriptions/payments${query}`, serverOpts(token))
    .catch(() => ({
      payments: [],
      total: 0,
      page: params?.page ?? 1,
      limit: params?.limit ?? 5,
    }));
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
