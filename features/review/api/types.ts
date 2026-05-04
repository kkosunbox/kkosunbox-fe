export interface ReviewResponse {
  id: number;
  planId: number;
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

export interface ReviewEligibilityResponse {
  plans: PlanReviewEligibility[];
}

export interface CreateReviewRequest {
  planId: number;
  rating: number;
  content: string;
  imageUrls?: string[];
}

export interface UpdateReviewRequest {
  rating?: number;
  content?: string;
  imageUrls?: string[] | null;
}
