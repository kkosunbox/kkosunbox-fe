import { apiClient } from "@/shared/lib/api";
import type {
  PlanReviewsResponse,
  MyReviewsResponse,
  ReviewEligibilityResponse,
  ReviewResponse,
  ReviewSortOrder,
  CreateReviewRequest,
  UpdateReviewRequest,
} from "./types";

export function getReviews(
  planId?: number | null,
  page: number = 1,
  limit: number = 10,
  sortOrder: ReviewSortOrder = "LATEST",
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortOrder,
  });
  if (planId != null) params.set("planId", String(planId));

  return apiClient.get<PlanReviewsResponse>(
    `/v1/reviews?${params.toString()}`,
  );
}

export function createReview(body: CreateReviewRequest) {
  return apiClient.post<ReviewResponse>("/v1/reviews", body);
}

export function getEligiblePlans() {
  return apiClient.get<ReviewEligibilityResponse>("/v1/reviews/eligible-plans");
}

export function getMyReviews() {
  return apiClient.get<MyReviewsResponse>("/v1/reviews/my");
}

export function updateReview(id: number, body: UpdateReviewRequest) {
  return apiClient.patch<ReviewResponse>(`/v1/reviews/${id}`, body);
}

export function deleteReview(id: number) {
  return apiClient.delete<void>(`/v1/reviews/${id}`);
}
