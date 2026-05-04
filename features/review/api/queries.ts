/**
 * 서버 전용 리뷰 데이터 패칭.
 * "server-only" 임포트로 클라이언트 번들에 포함되면 빌드 에러 발생.
 */
import "server-only";
import { apiClient } from "@/shared/lib/api";
import type { PlanReviewsResponse } from "./types";

function serverOpts() {
  return { skipRefresh: true } as const;
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
