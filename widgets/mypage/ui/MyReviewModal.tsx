"use client";

import { useEffect, useId, useState } from "react";
import { ModalShell, Text } from "@/shared/ui";
import type { ReviewResponse } from "@/features/review/api";
import { formatReviewDate, type ReviewSubject } from "@/features/review/lib/reviewSubject";

interface Props {
  review: ReviewResponse;
  /** 리뷰 대상(구독 플랜 또는 스토어 상품) 표시 정보 */
  subject: ReviewSubject;
  /** 작성 후 24시간 이내 — 수정 버튼 노출 여부 */
  isEditable: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  /** 이전 리뷰로 이동 — 리뷰가 2개 이상일 때만 전달 */
  onPrev?: () => void;
  /** 다음 리뷰로 이동 — 리뷰가 2개 이상일 때만 전달 */
  onNext?: () => void;
  /** 현재 위치 (1부터) — 리뷰가 2개 이상일 때만 전달 */
  position?: { current: number; total: number };
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
      <path d={path} stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
      className="rounded-[8px] bg-[var(--color-cta-button)] px-4 py-2.5 text-body-14-sb leading-[1] text-white transition-opacity hover:opacity-90 md:px-5 md:py-3"
    >
      리뷰 수정하기
    </button>
  ) : null;

  const deleteButton = (
    <button
      type="button"
      onClick={onDelete}
      className="rounded-[8px] border border-[var(--color-cta-button)] bg-white px-4 py-2.5 text-body-14-sb leading-[1] text-[var(--color-cta-button)] transition-opacity hover:opacity-90 md:px-5 md:py-3"
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

const NAV_BUTTON_CLASS =
  "flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0px_2px_8px_rgba(0,0,0,0.16)] transition-opacity hover:opacity-80";

export default function MyReviewModal({
  review,
  subject,
  isEditable,
  onEdit,
  onDelete,
  onClose,
  onPrev,
  onNext,
  position,
}: Props) {
  const images = review.imageUrls ?? [];
  // 리뷰 전환 시 부모가 review.id를 key로 전달 → 컴포넌트가 리마운트되며 0으로 초기화됨
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onPrev?.();
      else if (e.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onPrev, onNext]);

  const mainImageUrl = images[activeImage] ?? images[0] ?? null;
  const thumbnailSrc = subject.thumbnail === null ? null : typeof subject.thumbnail === "string" ? subject.thumbnail : subject.thumbnail.src;
  const positionLabel = position ? `${position.current} / ${position.total}` : null;

  return (
    <ModalShell
      label="나의 리뷰"
      onClose={onClose}
      className="h-full md:flex md:min-h-full md:items-center md:justify-center md:overflow-y-auto md:p-4"
    >
      <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-white max-md:min-h-[100dvh] md:max-h-[610px] md:max-w-[900px] md:min-h-[610px] md:rounded-[16px] md:shadow-[0px_8px_32px_rgba(0,0,0,0.24)]">
        {/* 헤더 */}
        <div className="shrink-0 bg-[var(--color-accent-orange)] px-6 max-md:pt-[env(safe-area-inset-top,0px)]">
          <div className="flex items-center justify-between py-4">
            <Text variant="subtitle-16-b" className="text-white">
              나의 리뷰
              {positionLabel && (
                <span className="ml-2 text-body-14-m text-white opacity-80" aria-label={`${position!.total}개 중 ${position!.current}번째`}>
                  {positionLabel}
                </span>
              )}
            </Text>
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-70"
            >
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M12.5 1.5L1.5 12.5M1.5 1.5L12.5 12.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
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
                {thumbnailSrc && (
                  // eslint-disable-next-line @next/next/no-img-element -- 플랜 썸네일 원본 품질 유지, 상품 이미지는 원격 URL
                  <img
                    src={thumbnailSrc}
                    alt={`${subject.name} 이미지`}
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover object-center scale-105"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <Text variant="subtitle-16-sb" className="truncate text-[var(--color-text)]">
                  {subject.name}
                </Text>
                <Text variant="body-14-m" mobileVariant="body-13-r" className="text-[var(--color-text-secondary)]">
                  {subject.caption}
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

          {/* 수정 기간이 지나면 버튼이 사라지는 이유를 알려준다 */}
          {!isEditable && (
            <p className="mt-6 text-body-13-r text-[var(--color-text-secondary)]">
              리뷰는 작성 후 24시간 이내에만 수정할 수 있어요.
            </p>
          )}
        </div>

        {/* 모바일 하단 — 이전/다음(본문을 가리지 않도록 하단 배치) + 수정 버튼 */}
        {(isEditable || onPrev || onNext) && (
          <div className="flex shrink-0 flex-col gap-4 px-6 pb-[calc(36px+env(safe-area-inset-bottom,0px))] md:hidden">
            {(onPrev || onNext) && (
              <div className="flex items-center justify-center gap-6">
                <button type="button" onClick={onPrev} disabled={!onPrev} aria-label="이전 리뷰" className={`${NAV_BUTTON_CLASS} disabled:opacity-40`}>
                  <NavChevronIcon dir="left" />
                </button>
                {positionLabel && <span className="text-body-14-m text-[var(--color-text-secondary)]">{positionLabel}</span>}
                <button type="button" onClick={onNext} disabled={!onNext} aria-label="다음 리뷰" className={`${NAV_BUTTON_CLASS} disabled:opacity-40`}>
                  <NavChevronIcon dir="right" />
                </button>
              </div>
            )}
            {isEditable && (
              <button
                type="button"
                onClick={onEdit}
                className="flex h-12 w-full items-center justify-center rounded-[8px] bg-[var(--color-cta-button)] text-body-14-sb leading-[1] text-white transition-opacity hover:opacity-90"
              >
                리뷰 수정하기
              </button>
            )}
          </div>
        )}

        {/* 데스크탑 이전/다음 — 카드 좌우 */}
        {onPrev && (
          <button
            type="button"
            onClick={onPrev}
            aria-label="이전 리뷰"
            className={`absolute left-4 top-1/2 z-20 -translate-y-1/2 max-md:hidden ${NAV_BUTTON_CLASS}`}
          >
            <NavChevronIcon dir="left" />
          </button>
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            aria-label="다음 리뷰"
            className={`absolute right-4 top-1/2 z-20 -translate-y-1/2 max-md:hidden ${NAV_BUTTON_CLASS}`}
          >
            <NavChevronIcon dir="right" />
          </button>
        )}
      </div>
    </ModalShell>
  );
}
