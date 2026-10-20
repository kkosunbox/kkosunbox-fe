import type { ReviewPromptTarget } from "../api/types";

/**
 * 리뷰 작성(수정) 화면 경로
 * 플랜 리뷰는 planId, 독립 상품 리뷰는 productId + productOrderId(주문 단위)로 대상을 지정한다.
 */
export function buildReviewWriteHref(target: ReviewPromptTarget, reviewId?: number | null): string | null {
  const params = new URLSearchParams();
  if (target.planId != null) {
    params.set("planId", String(target.planId));
  } else if (target.productId != null) {
    params.set("productId", String(target.productId));
    if (target.productOrderId != null) params.set("productOrderId", String(target.productOrderId));
  } else {
    return null;
  }
  if (reviewId != null) params.set("reviewId", String(reviewId));
  return `/mypage/review/write?${params.toString()}`;
}
