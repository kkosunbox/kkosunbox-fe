"use client";

import { useEffect, useId } from "react";
import Image, { type StaticImageData } from "next/image";
import { Text } from "@/shared/ui";
import type { ReviewResponse } from "@/features/review/api";
import { TIER_THUMBNAIL_IMAGE_CLASS } from "@/widgets/subscribe/plans/ui/packageThumbnails";

interface Props {
  review: ReviewResponse;
  planName: string;
  tierLabel: string;
  tierColorVar: string;
  thumbnail: StaticImageData;
  /** 작성 후 24시간 이내 — 수정 버튼 노출 여부 */
  isEditable: boolean;
  onEdit: () => void;
  onClose: () => void;
}

/** "2026.03.28" 형식 */
function formatReviewDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10).replace(/-/g, ".");
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

/** 0.5 단위 별점 표시 (full / half / empty) */
function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`별점 ${rating}점`}>
      {[1, 2, 3, 4, 5].map((value) => {
        const fill = Math.max(0, Math.min(1, rating - (value - 1)));
        return <Star key={value} fill={fill} />;
      })}
    </div>
  );
}

function Star({ fill }: { fill: number }) {
  const clipId = useId();
  const path =
    "M12 2L14.9 8.6L22 9.3L16.8 14L18.4 21L12 17.3L5.6 21L7.2 14L2 9.3L9.1 8.6L12 2Z";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={24 * fill} height="24" />
        </clipPath>
      </defs>
      <path d={path} fill="var(--color-surface-warm)" />
      <path d={path} fill="var(--color-star)" clipPath={`url(#${clipId})`} />
    </svg>
  );
}

export default function MyReviewModal({
  review,
  planName,
  tierLabel,
  tierColorVar,
  thumbnail,
  isEditable,
  onEdit,
  onClose,
}: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const imageUrl = review.imageUrls?.[0] ?? null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="나의 리뷰"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 flex max-h-full w-full max-w-[900px] flex-col overflow-hidden rounded-[16px] bg-white shadow-[0px_8px_32px_rgba(0,0,0,0.24)]">
        {/* 헤더 */}
        <div className="flex shrink-0 items-center justify-between bg-[var(--color-accent-orange)] px-6 py-4">
          <Text variant="subtitle-16-b" className="text-white">
            나의 리뷰
          </Text>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-70"
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M12.5 1.5L1.5 12.5M1.5 1.5L12.5 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-6 md:px-8 md:py-7">
          {/* 상품 정보 + 수정 버튼 */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[12px] bg-[var(--color-surface-light)] md:h-[88px] md:w-[88px]">
                <Image
                  src={thumbnail}
                  alt={`${planName} 이미지`}
                  fill
                  className={TIER_THUMBNAIL_IMAGE_CLASS}
                  sizes="88px"
                />
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <span
                  className="inline-flex h-6 w-fit items-center rounded-full px-3 text-body-14-sb leading-[1] text-white"
                  style={{ background: tierColorVar }}
                >
                  {tierLabel}
                </span>
                <Text variant="subtitle-16-sb" className="truncate text-[var(--color-text)]">
                  {planName}
                </Text>
              </div>
            </div>

            {isEditable && (
              <button
                type="button"
                onClick={onEdit}
                className="shrink-0 rounded-[8px] bg-[var(--color-btn-dark-warm)] px-4 py-2.5 text-body-14-sb leading-[1] text-white transition-opacity hover:opacity-90 md:px-5 md:py-3"
              >
                리뷰 수정하기
              </button>
            )}
          </div>

          <div className="my-5 border-t border-[var(--color-border-light)] md:my-6" />

          {/* 리뷰 이미지 */}
          {imageUrl && (
            <div className="mb-6 flex justify-center">
              {/* 리뷰 첨부 이미지는 원격 CDN URL이라 next/image 대신 img 사용 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="리뷰 첨부 이미지"
                className="max-h-[280px] w-auto max-w-full rounded-[12px] object-contain"
              />
            </div>
          )}

          {/* 별점 + 날짜 */}
          <div className="mb-3 flex items-center justify-between gap-3">
            <StarDisplay rating={review.rating} />
            <Text variant="body-14-m" className="text-[var(--color-text-secondary)]">
              {formatReviewDate(review.createdAt)}
            </Text>
          </div>

          {/* 리뷰 내용 */}
          <p className="whitespace-pre-wrap text-body-14-m leading-[1.6] text-[var(--color-text)]">
            {review.content}
          </p>
        </div>
      </div>
    </div>
  );
}
