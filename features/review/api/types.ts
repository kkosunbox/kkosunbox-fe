export type ReviewSortOrder = "LATEST" | "RATING_ASC" | "RATING_DESC";

export interface ReviewPlan {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  monthlyPrice: number;
  originalPrice: number | null;
  discountRate: number | null;
}

export interface ReviewResponse {
  id: number;
  planId: number | null;
  plan: ReviewPlan | null;
  productId: number | null;
  product: ReviewProduct | null;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  imageUrls: string[] | null;
  snapshotPetName: string | null;
  snapshotPetProfileImageUrl: string | null;
  snapshotUserEmail: string | null;
  userId: number | null;
}

export interface ReviewProduct { id: number; name: string; imageUrl?: string | null }

export interface PlanReviewsResponse {
  items: ReviewResponse[];
  total: number;
  page: number;
  limit: number;
  averageRating: number;
}

export interface ReviewPhotoItem {
  reviewId: number;
  imageUrl: string;
}

/** 리뷰 사진 모아보기 응답 — total은 전체 사진 수 */
export interface ReviewPhotosResponse {
  items: ReviewPhotoItem[];
  total: number;
  page: number;
  limit: number;
}

export interface MyReviewsResponse {
  items: ReviewResponse[];
}

export interface PlanReviewEligibility {
  planId: number;
  planName: string;
  canReview: boolean;
  hasReview: boolean;
  isEditable: boolean;
  reviewId: number | null;
}

export interface ProductReviewEligibility {
  productId: number;
  productName: string;
  imageUrl?: string | null;
  canReview: boolean;
  hasReview: boolean;
  isEditable: boolean;
  reviewId: number | null;
}

export interface ReviewEligibilityResponse {
  plans: PlanReviewEligibility[];
  products: ProductReviewEligibility[];
}

export interface CreateReviewRequest {
  planId?: number;
  productId?: number;
  /** 독립 상품 리뷰 대상 단건 주문 ID — 생략 시 미작성 최근 배송완료 주문 */
  productOrderId?: number;
  rating: number;
  content: string;
  imageUrls?: string[];
}

/**
 * 주문/결제 항목 단위 리뷰 상태 (`GET /v1/payments` items[].review, 구독 결제 review)
 * 구독·연관 플랜 상품은 planId(플랜당 1개), 독립 상품은 productId + productOrderId(주문마다 1개)
 */
export interface ReviewState {
  planId: number | null;
  productId: number | null;
  productOrderId: number | null;
  canReview: boolean;
  reviewId: number | null;
  isEditable: boolean;
}

/** 배송완료 리뷰 유도 팝업 대상 (`POST /v1/reviews/prompt`) */
export type ReviewPromptTarget = Pick<ReviewState, "planId" | "productId" | "productOrderId">;

export interface ReviewPromptResponse {
  target: ReviewPromptTarget | null;
}

export interface UpdateReviewRequest {
  rating?: number;
  content?: string;
  imageUrls?: string[] | null;
}
