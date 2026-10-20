import { apiClient } from "@/shared/lib/api";
import type {
  PlanReviewsResponse,
  MyReviewsResponse,
  ReviewEligibilityResponse,
  ReviewPhotosResponse,
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

export function getProductReviews(productId: number, page = 1, limit = 10, sortOrder: ReviewSortOrder = "LATEST") {
  const params = new URLSearchParams({ productId: String(productId), page: String(page), limit: String(limit), sortOrder });
  return apiClient.get<PlanReviewsResponse>(`/v1/reviews?${params.toString()}`);
}

/** 리뷰 사진 모아보기 (공개 API). planId/productId 중 하나만 전달하며, 둘 다 없으면 전체 구독 리뷰 사진 */
export function getReviewPhotos({
  planId,
  productId,
  page = 1,
  limit = 20,
}: {
  planId?: number | null;
  productId?: number | null;
  page?: number;
  limit?: number;
}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (productId != null) params.set("productId", String(productId));
  else if (planId != null) params.set("planId", String(planId));
  return apiClient.get<ReviewPhotosResponse>(`/v1/reviews/photos?${params.toString()}`);
}

export function createReview(body: CreateReviewRequest) {
  return apiClient.post<ReviewResponse>("/v1/reviews", body);
}

export function getEligiblePlans() {
  return apiClient.get<ReviewEligibilityResponse>("/v1/reviews/eligible-plans");
}

export function getEligibleProducts() {
  return apiClient.get<Pick<ReviewEligibilityResponse, "products">>("/v1/reviews/eligible-products");
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
