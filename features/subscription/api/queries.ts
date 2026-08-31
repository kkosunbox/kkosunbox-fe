/**
 * 서버 전용 구독 데이터 패칭.
 * "server-only" 임포트로 클라이언트 번들에 포함되면 빌드 에러 발생.
 */
import "server-only";
import { cache } from "react";
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
import { planListQuery } from "../lib/planListQuery";

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

/**
 * 구독 이력 존재 여부 — **초대코드 할인 적격 판정 전용**.
 *
 * `true` = 이력 있음 / `false` = 이력 없음 / `null` = **판정 불가**(비로그인·조회 실패).
 *
 * 다른 조회 함수처럼 실패를 `[]`로 삼키지 않는다. 조회 실패를 "이력 없음"으로 처리하면
 * 자격 없는 사용자에게 첫 구독 할인가를 노출하게 되고, 화면 가격과 실제 청구액이 어긋난다.
 * 판정 불가일 때 무엇을 할지는 호출부가 정한다(적격 판정은 fail-closed).
 *
 * `cache()`로 요청 단위 메모이즈한다 — layout·`/r/[slug]`·`/order`가 각자 조회하던 탓에
 * **같은 요청 안에서 서로 다른 답을 받아 페이지마다 가격이 달라지는 사고**가 있었다(2026-08-12).
 */
export const probeSubscriptionHistory = cache(
  async (token?: string): Promise<boolean | null> => {
    if (!token) return null;
    try {
      const data = await apiClient.get<{ subscriptions: UserSubscriptionDto[] }>(
        "/v1/subscriptions",
        serverOpts(token),
      );
      return (data.subscriptions?.length ?? 0) > 0;
    } catch {
      return null;
    }
  },
);

/** 구독 플랜 목록 (profileId 전달 시 백엔드가 isRecommended 설정) */
export async function fetchSubscriptionPlans(
  token?: string,
  profileId?: number,
  referralCode?: string,
): Promise<SubscriptionPlanDto[]> {
  const data = await apiClient
    .get<{ plans: SubscriptionPlanDto[] }>(
      `/v1/subscriptions/plans${planListQuery(profileId, referralCode)}`,
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
