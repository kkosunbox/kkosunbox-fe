import Link from "next/link";
import type { ReviewState } from "../api/types";
import { buildReviewWriteHref } from "../lib/reviewWriteHref";

const ACTION_CLASS =
  "inline-flex min-h-9 shrink-0 items-center justify-center rounded-[8px] border border-[var(--color-cta-button)] px-3 text-btn-14-m text-[var(--color-cta-button)] transition-colors hover:bg-[var(--color-surface-warm)]";

/**
 * 주문 상품별 리뷰 버튼
 * - 배송완료 + 미작성: 리뷰쓰기
 * - 작성 후 24시간 이내: 리뷰수정
 * - 수정 기간 지남: 작성완료 표시
 * - 배송 전·환불·삭제 상품: 노출 안 함
 */
export default function ReviewActionLink({ review, className = "" }: { review?: ReviewState | null; className?: string }) {
  if (!review) return null;
  if (review.canReview) {
    const href = buildReviewWriteHref(review);
    return href ? <Link href={href} className={`${ACTION_CLASS} ${className}`}>리뷰쓰기</Link> : null;
  }
  if (review.reviewId == null) return null;
  if (review.isEditable) {
    const href = buildReviewWriteHref(review, review.reviewId);
    return href ? <Link href={href} className={`${ACTION_CLASS} ${className}`}>리뷰수정</Link> : null;
  }
  return <span className={`inline-flex min-h-9 shrink-0 items-center text-body-13-r text-[var(--color-text-secondary)] ${className}`}>리뷰 작성완료</span>;
}
