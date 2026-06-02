"use client";

import { useEffect, useId, useState } from "react";
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
  onDelete: () => void;
  onClose: () => void;
  /** 이전 리뷰로 이동 — 리뷰가 2개 이상일 때만 전달 */
  onPrev?: () => void;
  /** 다음 리뷰로 이동 — 리뷰가 2개 이상일 때만 전달 */
  onNext?: () => void;
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

function NavChevronIcon({ dir }: { dir: "left" | "right" }) {
  const path = dir === "left" ? "M16 8L10 14L16 20" : "M12 8L18 14L12 20";
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d={path} stroke="#999999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReviewActionButtons({
  isEditable,
  onEdit,
  onDelete,
}: {
  isEditable: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const editButton = isEditable ? (
    <button
      type="button"
      onClick={onEdit}
      className="rounded-[8px] bg-[var(--color-btn-dark-warm)] px-4 py-2.5 text-body-14-sb leading-[1] text-white transition-opacity hover:opacity-90 md:px-5 md:py-3"
    >
      리뷰 수정하기
    </button>
  ) : null;

  const deleteButton = (
    <button
      type="button"
      onClick={onDelete}
      className="rounded-[8px] border border-[var(--color-btn-dark-warm)] bg-white px-4 py-2.5 text-body-14-sb leading-[1] text-[var(--color-btn-dark-warm)] transition-opacity hover:opacity-90 md:px-5 md:py-3"
    >
      리뷰 삭제
    </button>
  );

  return (
    <div className="flex shrink-0 items-center gap-2">
      {deleteButton}
      {editButton}
    </div>
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
  onDelete,
  onClose,
  onPrev,
  onNext,
}: Props) {
  const images = review.imageUrls ?? [];
  // 리뷰 전환 시 부모가 review.id를 key로 전달 → 컴포넌트가 리마운트되며 0으로 초기화됨
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev?.();
      else if (e.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  const mainImageUrl = images[activeImage] ?? images[0] ?? null;

  return (
    <div
      className="fixed inset-0 z-[100] md:flex md:items-center md:justify-center md:overflow-y-auto md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="나의 리뷰"
    >
      {/* 배경 — 데스크탑 전용 (모바일은 전체 화면 모달) */}
      <div
        className="absolute inset-0 bg-black/60 max-md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full min-h-0 w-full flex-col overflow-hidden bg-white max-md:min-h-[100dvh] md:max-h-[610px] md:max-w-[900px] md:min-h-[610px] md:rounded-[16px] md:shadow-[0px_8px_32px_rgba(0,0,0,0.24)]">
        {/* 헤더 */}
        <div className="shrink-0 bg-[var(--color-accent-orange)] px-6 max-md:pt-[env(safe-area-inset-top,0px)]">
          <div className="flex items-center justify-between py-4">
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
        </div>

        {/* 본문 */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-6 max-md:pb-6 md:px-8 md:py-7">
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

            {/* 모바일 전용 삭제 — 행 오른쪽 정렬 */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
              className="shrink-0 self-start text-body-14-m text-[var(--color-text-secondary)] underline transition-opacity hover:opacity-80 md:hidden"
            >
              리뷰삭제
            </a>

            <div className="max-md:hidden">
              <ReviewActionButtons
                isEditable={isEditable}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </div>

          <div className="my-5 border-t border-[var(--color-border-light)] md:my-6" />

          {/* 리뷰 이미지 + 썸네일 미리보기 */}
          {mainImageUrl && (
            <div className="mb-6 flex flex-col items-center gap-3">
              {/* 메인 이미지 — 200×200 고정 wrapper, 클릭 시 원본을 새 창으로 */}
              {/* 리뷰 첨부 이미지는 원격 CDN URL이라 next/image 대신 img 사용 */}
              <a
                href={mainImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="이미지 크게 보기 (새 창)"
                className="group block h-[200px] w-[200px] shrink-0 overflow-hidden rounded-[12px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mainImageUrl}
                  alt="리뷰 첨부 이미지"
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </a>

              {/* 썸네일 줄 — 가로 스크롤(캐러셀). 선택은 상단 메인 이미지로 표시 (strip엔 border/rounded 없음) */}
              {images.length >= 2 && (
                <div className="flex max-w-[200px] gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {images.map((url, i) => (
                    <button
                      key={`${url}-${i}`}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      aria-label={`${i + 1}번째 사진 보기`}
                      aria-current={i === activeImage}
                      className={[
                        "relative h-11 w-11 shrink-0 overflow-hidden transition-opacity",
                        i === activeImage ? "" : "opacity-60 hover:opacity-100",
                      ].join(" ")}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
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

        {isEditable && (
          <div className="shrink-0 px-6 pb-[calc(36px+env(safe-area-inset-bottom,0px))] md:hidden">
            <button
              type="button"
              onClick={onEdit}
              className="flex h-12 w-full items-center justify-center rounded-[8px] bg-[var(--color-btn-dark-warm)] text-body-14-sb leading-[1] text-white transition-opacity hover:opacity-90"
            >
              리뷰 수정하기
            </button>
          </div>
        )}

        {/* 이전/다음 리뷰 — 리뷰가 2개 이상일 때만 노출 */}
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            aria-label="이전 리뷰"
            className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0px_2px_8px_rgba(0,0,0,0.16)] transition-opacity hover:opacity-80 md:left-4"
          >
            <NavChevronIcon dir="left" />
          </button>
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            aria-label="다음 리뷰"
            className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0px_2px_8px_rgba(0,0,0,0.16)] transition-opacity hover:opacity-80 md:right-4"
          >
            <NavChevronIcon dir="right" />
          </button>
        )}
      </div>
    </div>
  );
}
