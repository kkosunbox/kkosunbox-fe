"use client";

import { Fragment } from "react";
import type { ReviewSortOrder } from "@/features/review/api";
import { FallbackAvatar } from "@/shared/ui";
import Stars from "./Stars";
import ReviewContent from "./ReviewContent";
import { maskEmail, formatReviewDate } from "./reviewUtils";
import type { UseProductReviewsReturn } from "./useProductReviews";

function ReviewAvatar({
  imageUrl,
  userId,
}: {
  imageUrl: string | null;
  userId: number;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt="" className="h-full w-full object-cover" />
    );
  }
  return <FallbackAvatar userId={userId} size={54} className="h-full w-full" />;
}

const SORT_OPTIONS = [
  { label: "최신순", value: "LATEST" },
  { label: "평점 높은순", value: "RATING_DESC" },
  { label: "평점 낮은순", value: "RATING_ASC" },
] as const satisfies { label: string; value: ReviewSortOrder }[];

interface ProductReviewListProps {
  variant: "mobile" | "desktop";
  selectedTheme: { tierLabel: string; colorVar: string };
  reviews: UseProductReviewsReturn["reviews"];
  loading: boolean;
  reviewImages: string[];
  page: number;
  totalPages: number;
  sort: ReviewSortOrder;
  onChangeSort: (value: ReviewSortOrder) => void;
  onChangePage: (page: number) => void;
  onOpenLightbox: (urls: string[], index: number) => void;
}

export default function ProductReviewList(props: ProductReviewListProps) {
  return props.variant === "mobile" ? <MobileReviewList {...props} /> : <DesktopReviewList {...props} />;
}

function MobileReviewList({
  selectedTheme,
  reviews,
  loading,
  reviewImages,
  page,
  totalPages,
  sort,
  onChangeSort,
  onChangePage,
  onOpenLightbox,
}: ProductReviewListProps) {
  return (
    <div className="px-6 pt-6 pb-10">
      <div className="mb-4 flex flex-col gap-2">
        <button
          type="button"
          className="flex shrink-0 items-center gap-2 self-start text-[16px] font-bold leading-[19px] text-[var(--color-text-emphasis)]"
        >
          꼬순박스 리뷰
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M6 4L10 8L6 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-[13px] font-medium text-[var(--color-text)]">
          {SORT_OPTIONS.map((opt, idx) => (
            <Fragment key={opt.value}>
              <button
                type="button"
                onClick={() => onChangeSort(opt.value)}
                className={
                  sort === opt.value
                    ? "font-semibold text-[var(--color-text-emphasis)]"
                    : "text-[var(--color-text-secondary)]"
                }
              >
                {opt.label}
              </button>
              {idx < SORT_OPTIONS.length - 1 && (
                <span className="text-[var(--color-text-muted)]">|</span>
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {reviewImages.length > 0 && (
        <div className="mb-6 flex items-center gap-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {reviewImages.slice(0, 3).map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onOpenLightbox([...reviewImages], idx)}
              className="h-16 w-16 shrink-0 overflow-hidden rounded-[6px] bg-[var(--color-surface-warm)] transition-opacity hover:opacity-90 active:opacity-80"
              aria-label={`리뷰 사진 ${idx + 1} 크게 보기`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="pointer-events-none h-full w-full object-cover" />
            </button>
          ))}
          {reviewImages.length > 3 && (
            <button
              type="button"
              onClick={() => onOpenLightbox([...reviewImages], 3)}
              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[6px] transition-opacity hover:opacity-90 active:opacity-80"
              aria-label={`리뷰 사진 더보기, ${reviewImages.length - 3}장 추가`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={reviewImages[3]} alt="" className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60 text-center text-body-13-sb text-white">
                더보기
                <br />+{reviewImages.length - 3}
              </div>
            </button>
          )}
        </div>
      )}

      {loading && reviews.length === 0 ? (
        <p className="py-10 text-center text-[14px] text-[var(--color-text-secondary)]">
          리뷰를 불러오는 중...
        </p>
      ) : reviews.length === 0 ? (
        <p className="py-10 text-center text-[14px] text-[var(--color-text-secondary)]">
          아직 작성된 리뷰가 없습니다.
        </p>
      ) : (
        <ul className={`space-y-6 transition-opacity duration-150 ${loading ? "pointer-events-none opacity-40" : ""}`}>
          {reviews.map((review) => (
            <li
              key={review.id}
              className="border-b border-[var(--color-text-muted)] pb-6 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-[54px] w-[54px] shrink-0 overflow-hidden rounded-full border border-[var(--color-text-muted)]"
                  aria-hidden="true"
                >
                  <ReviewAvatar
                    imageUrl={review.snapshotPetProfileImageUrl}
                    userId={review.userId ?? review.id}
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold leading-[14px] text-white"
                      style={{ background: selectedTheme.colorVar }}
                    >
                      {selectedTheme.tierLabel}
                    </span>
                    <Stars rating={review.rating} size={24} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[14px] leading-[130%]">
                    <span className="font-semibold text-[var(--color-text)]">
                      {review.snapshotPetName ?? "익명"}
                    </span>
                    {review.snapshotUserEmail && (
                      <span className="font-medium text-[var(--color-text-secondary)]">
                        {maskEmail(review.snapshotUserEmail)}
                      </span>
                    )}
                    <span className="font-medium text-[var(--color-text-secondary)]">
                      {formatReviewDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <ReviewContent content={review.content} className="mt-[9px] pl-[66px]" />
              {review.imageUrls && review.imageUrls.length > 0 && (
                <div className="mt-4 flex gap-2 pl-[66px]">
                  {review.imageUrls.slice(0, 3).map((url, imgIdx) => (
                    <button
                      key={imgIdx}
                      type="button"
                      onClick={() =>
                        onOpenLightbox(review.imageUrls ? [...review.imageUrls] : [], imgIdx)
                      }
                      className="h-[100px] w-[100px] overflow-hidden rounded-[12px] border border-[var(--color-text-muted)] transition-opacity hover:opacity-90 active:opacity-80"
                      aria-label={`리뷰 사진 ${imgIdx + 1} 크게 보기`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`리뷰 사진 ${imgIdx + 1}`}
                        className="pointer-events-none h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <nav className="mt-8 flex items-center justify-center gap-2" aria-label="리뷰 페이지네이션">
        <button
          type="button"
          onClick={() => onChangePage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex h-8 w-8 items-center justify-center text-[14px] text-[var(--color-text-secondary)] disabled:opacity-30"
          aria-label="이전 페이지"
        >
          ‹
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChangePage(p)}
            className={
              p === page
                ? "flex h-8 w-8 items-center justify-center text-[14px] font-semibold text-[var(--color-text)]"
                : "flex h-8 w-8 items-center justify-center text-[14px] text-[var(--color-text-secondary)]"
            }
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChangePage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex h-8 w-8 items-center justify-center text-[14px] text-[var(--color-text-secondary)] disabled:opacity-30"
          aria-label="다음 페이지"
        >
          ›
        </button>
      </nav>
    </div>
  );
}

function DesktopReviewList({
  reviews,
  loading,
  reviewImages,
  page,
  totalPages,
  sort,
  onChangeSort,
  onChangePage,
  onOpenLightbox,
}: ProductReviewListProps) {
  return (
    <div className="pt-10 pb-20 md:px-6 lg:px-0">
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          className="flex items-center gap-2 text-[20px] font-bold leading-[24px] text-[var(--color-text-emphasis)]"
        >
          꼬순박스 리뷰
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M7.5 5L12.5 10L7.5 15"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="flex items-center gap-3 text-[14px] leading-[17px]">
          {SORT_OPTIONS.map((opt, idx) => (
            <Fragment key={opt.value}>
              <button
                type="button"
                onClick={() => onChangeSort(opt.value)}
                className={
                  sort === opt.value
                    ? "font-semibold text-[var(--color-text-emphasis)]"
                    : "font-normal text-[var(--color-text-secondary)]"
                }
              >
                {opt.label}
              </button>
              {idx < SORT_OPTIONS.length - 1 && (
                <span className="text-[var(--color-text-muted)]">|</span>
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {reviewImages.length > 0 && (
        <div className="mb-10 flex items-center gap-4">
          {reviewImages.slice(0, 4).map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onOpenLightbox([...reviewImages], idx)}
              className="h-[100px] w-[100px] shrink-0 overflow-hidden rounded-[8px] bg-[var(--color-surface-warm)] transition-opacity hover:opacity-90 active:opacity-80"
              aria-label={`리뷰 사진 ${idx + 1} 크게 보기`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="pointer-events-none h-full w-full object-cover" />
            </button>
          ))}
          {reviewImages.length > 4 && (
            <button
              type="button"
              onClick={() => onOpenLightbox([...reviewImages], 4)}
              className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-[8px] transition-opacity hover:opacity-90 active:opacity-80"
              aria-label={`리뷰 사진 더보기, ${reviewImages.length - 4}장 추가`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={reviewImages[4]} alt="" className="h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60 text-center text-subtitle-16-sb text-white">
                더보기
                <br />+{reviewImages.length - 4}
              </div>
            </button>
          )}
        </div>
      )}

      {loading && reviews.length === 0 ? (
        <p className="py-16 text-center text-body-16-r text-[var(--color-text-secondary)]">
          리뷰를 불러오는 중...
        </p>
      ) : reviews.length === 0 ? (
        <p className="py-16 text-center text-body-16-r text-[var(--color-text-secondary)]">
          아직 작성된 리뷰가 없습니다.
        </p>
      ) : (
        <ul className={`transition-opacity duration-150 ${loading ? "pointer-events-none opacity-40" : ""}`}>
          {reviews.map((review) => (
            <li
              key={review.id}
              className="flex items-start gap-4 border-b border-[var(--color-text-muted)] py-6 last:border-b-0"
            >
              {/* Left: avatar + info + content */}
              <div className="flex flex-1 items-start gap-4">
                <div
                  className="h-[54px] w-[54px] shrink-0 overflow-hidden rounded-full border border-[var(--color-text-muted)]"
                  aria-hidden="true"
                >
                  <ReviewAvatar
                    imageUrl={review.snapshotPetProfileImageUrl}
                    userId={review.userId ?? review.id}
                  />
                </div>
                <div className="flex-1">
                  <div className="mb-[3px] flex flex-wrap items-center gap-2 text-[14px] leading-[130%]">
                    <span className="font-bold text-[var(--color-text)]">
                      {review.snapshotPetName ?? "익명"}
                    </span>
                    {review.snapshotUserEmail && (
                      <span className="font-medium text-[var(--color-text-secondary)]">
                        {maskEmail(review.snapshotUserEmail)}
                      </span>
                    )}
                    <span className="font-medium text-[var(--color-text-secondary)]">
                      {formatReviewDate(review.createdAt)}
                    </span>
                  </div>
                  <div className="mb-3">
                    <Stars rating={review.rating} size={24} />
                  </div>
                  <ReviewContent content={review.content} className="" />
                </div>
              </div>
              {/* Right: first review photo */}
              {review.imageUrls && review.imageUrls.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenLightbox(review.imageUrls ? [...review.imageUrls] : [], 0)
                  }
                  className="h-[100px] w-[100px] shrink-0 overflow-hidden rounded-[12px] border border-[var(--color-text-muted)] transition-opacity hover:opacity-90 active:opacity-80"
                  aria-label="리뷰 사진 크게 보기"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={review.imageUrls[0]}
                    alt="리뷰 사진"
                    className="pointer-events-none h-full w-full object-cover"
                  />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <nav
        className="mt-10 flex items-center justify-center gap-3"
        aria-label="리뷰 페이지네이션"
      >
        <button
          type="button"
          onClick={() => onChangePage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex h-9 w-9 items-center justify-center text-[16px] text-[var(--color-text-secondary)] disabled:opacity-30"
          aria-label="이전 페이지"
        >
          ‹
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChangePage(p)}
            className={
              p === page
                ? "flex h-9 w-9 items-center justify-center text-[15px] font-semibold text-[var(--color-text)]"
                : "flex h-9 w-9 items-center justify-center text-[15px] text-[var(--color-text-secondary)]"
            }
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChangePage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex h-9 w-9 items-center justify-center text-[16px] text-[var(--color-text-secondary)] disabled:opacity-30"
          aria-label="다음 페이지"
        >
          ›
        </button>
      </nav>
    </div>
  );
}
