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
  rating: number;
  content: string;
  imageUrls?: string[];
}

export interface UpdateReviewRequest {
  rating?: number;
  content?: string;
  imageUrls?: string[] | null;
}
