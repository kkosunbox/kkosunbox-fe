/**
 * 서버 전용 리뷰 데이터 패칭.
 * "server-only" 임포트로 클라이언트 번들에 포함되면 빌드 에러 발생.
 */
import "server-only";
import { apiClient } from "@/shared/lib/api";
import type {
  PlanReviewsResponse,
  ReviewEligibilityResponse,
  PlanReviewEligibility,
  MyReviewsResponse,
  ReviewResponse,
} from "./types";

function serverOpts(token?: string) {
  return { token, skipRefresh: true } as const;
}

/** 특정 플랜의 리뷰 목록 (공개 API, 인증 불필요) */
export async function fetchPlanReviews(
  planId: number,
  page: number = 1,
  limit: number = 10,
): Promise<PlanReviewsResponse> {
  return apiClient
    .get<PlanReviewsResponse>(
      `/v1/reviews?planId=${planId}&page=${page}&limit=${limit}`,
      serverOpts(),
    )
    .catch(() => ({ items: [], total: 0, page: 1, limit, averageRating: 0 }));
}

/** 전체 플랜에 대한 현재 유저의 리뷰 작성/수정 가능 여부 (인증 필요) */
export async function fetchEligiblePlans(token?: string): Promise<PlanReviewEligibility[]> {
  return apiClient
    .get<ReviewEligibilityResponse>("/v1/reviews/eligible-plans", serverOpts(token))
    .then((res) => res.plans)
    .catch(() => []);
}

/** 내가 작성한 리뷰 목록 (인증 필요) */
export async function fetchMyReviews(token?: string): Promise<ReviewResponse[]> {
  return apiClient
    .get<MyReviewsResponse>("/v1/reviews/my", serverOpts(token))
    .then((res) => res.items)
    .catch(() => []);
}
