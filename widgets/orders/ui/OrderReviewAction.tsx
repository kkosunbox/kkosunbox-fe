"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLoadingOverlay } from "@/shared/ui";
import { useModal } from "@/shared/ui/modal/ModalProvider";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { deleteConfirmAlertOptions } from "@/shared/lib/modal/alertPresets";
import { deleteReview, getMyReviews, type ReviewResponse, type ReviewState } from "@/features/review/api";
import { buildReviewWriteHref } from "@/features/review/lib/reviewWriteHref";
import { buildReviewSubject, isReviewEditable } from "@/features/review/lib/reviewSubject";
import MyReviewModal from "@/widgets/mypage/ui/MyReviewModal";

const ACTION_CLASS =
  "inline-flex min-h-9 shrink-0 items-center justify-center rounded-[8px] border border-[var(--color-cta-button)] px-3 text-btn-14-m text-[var(--color-cta-button)] transition-colors hover:bg-[var(--color-surface-warm)] disabled:opacity-50";

/**
 * 주문 상품별 리뷰 버튼
 * - 배송완료 + 미작성: 리뷰쓰기 (작성 화면 이동)
 * - 작성함: 내 리뷰 보기 (나의 리뷰 모달 — 수정·삭제는 모달에서)
 * - 배송 전·환불·삭제 상품: 노출 안 함
 */
export default function OrderReviewAction({
  review,
  productName,
  imageUrl,
  className = "",
}: {
  review?: ReviewState | null;
  productName: string;
  imageUrl?: string | null;
  className?: string;
}) {
  const router = useRouter();
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [isPending, startTransition] = useTransition();
  const [myReview, setMyReview] = useState<ReviewResponse | null>(null);

  if (!review) return null;
  if (review.canReview) {
    const href = buildReviewWriteHref(review);
    return href ? <Link href={href} className={`${ACTION_CLASS} ${className}`}>리뷰쓰기</Link> : null;
  }
  const reviewId = review.reviewId;
  if (reviewId == null) return null;

  function openMyReview() {
    startTransition(async () => {
      try {
        const { items } = await getMyReviews();
        const found = items.find((item) => item.id === reviewId);
        if (found) setMyReview(found);
        else openAlert({ title: "리뷰를 찾을 수 없습니다." });
      } catch (err) {
        openAlert({ title: getErrorMessage(err, "리뷰를 불러오지 못했습니다.") });
      }
    });
  }

  function handleEdit() {
    const href = review ? buildReviewWriteHref(review, reviewId) : null;
    setMyReview(null);
    if (href) router.push(href);
  }

  function handleDelete() {
    openAlert(
      deleteConfirmAlertOptions(
        "리뷰를 삭제하시겠습니까?",
        () => {
          setMyReview(null);
          showLoading("리뷰를 삭제하고 있습니다...");
          startTransition(async () => {
            try {
              await deleteReview(reviewId!);
              openAlert({ type: "success", title: "리뷰가 삭제되었습니다." });
              router.refresh();
            } catch (err) {
              openAlert({ title: getErrorMessage(err, "리뷰 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.") });
            } finally {
              hideLoading();
            }
          });
        },
        "삭제하면 작성하신 리뷰 내용이 사라집니다.",
      ),
    );
  }

  return (
    <>
      <button type="button" onClick={openMyReview} disabled={isPending} className={`${ACTION_CLASS} ${className}`}>
        내 리뷰 보기
      </button>
      {myReview && (
        <MyReviewModal
          review={myReview}
          subject={buildReviewSubject(myReview, { productName, imageUrl })}
          isEditable={isReviewEditable(myReview.createdAt)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={() => setMyReview(null)}
        />
      )}
    </>
  );
}
