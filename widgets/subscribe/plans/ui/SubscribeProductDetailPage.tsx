"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { SupportSection } from "@/widgets/support/faq";
import packageThumbnail from "@/widgets/subscribe/plans/assets/package-thumbnail.png";
import subscribeItemHeroMobile from "@/widgets/subscribe/plans/assets/subscribe-item-hero-mobile.webp";
import subscribeItemHeroTitle from "@/widgets/subscribe/plans/assets/subscribe-item-hero-title.webp";
import subscribeItemHeroLeftPaw from "@/widgets/subscribe/plans/assets/subscribe-item-hero-left-paw.webp";
import subscribeItemHeroRightPaw from "@/widgets/subscribe/plans/assets/subscribe-item-hero-right-paw.webp";
import subscribeItem01A from "@/widgets/subscribe/plans/assets/subscribe-item-01-A.webp";
import subscribeItem01B from "@/widgets/subscribe/plans/assets/subscribe-item-01-B.webp";
import subscribeItem01BB from "@/widgets/subscribe/plans/assets/subscribe-item-01-BB.webp";
import subscribeItem01C from "@/widgets/subscribe/plans/assets/subscribe-item-01-C.webp";
import subscribeItem01D from "@/widgets/subscribe/plans/assets/subscribe-item-01-D.webp";
import subscribeItem02A from "@/widgets/subscribe/plans/assets/subscribe-item-02-A.webp";
import subscribeItem02B from "@/widgets/subscribe/plans/assets/subscribe-item-02-B.webp";
import subscribeItem02BB from "@/widgets/subscribe/plans/assets/subscribe-item-02-BB.webp";
import subscribeItem02C from "@/widgets/subscribe/plans/assets/subscribe-item-02-C.webp";
import subscribeItem02D from "@/widgets/subscribe/plans/assets/subscribe-item-02-D.webp";
import subscribeItem03A from "@/widgets/subscribe/plans/assets/subscribe-item-03-A.webp";
import subscribeItem03B from "@/widgets/subscribe/plans/assets/subscribe-item-03-B.webp";
import subscribeItem03BB from "@/widgets/subscribe/plans/assets/subscribe-item-03-BB.webp";
import subscribeItem03C from "@/widgets/subscribe/plans/assets/subscribe-item-03-C.webp";
import subscribeItem03D from "@/widgets/subscribe/plans/assets/subscribe-item-03-D.webp";
import {
  comparePlansForDisplayOrder,
  packageThemeForPlan,
  PACKAGES,
  tierFromSubscriptionPlan,
  type PackageTier,
} from "./packageData";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";
import { getReviews } from "@/features/review/api";
import type { ReviewResponse } from "@/features/review/api";

interface Props {
  initialPlan: SubscriptionPlanDto;
  plans: SubscriptionPlanDto[];
}

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

// 추후 쿠폰/할인 필드 추가 시 활성화
// function discountedPrice(value: number) {
//   return Math.floor(value * 0.9);
// }

const DETAIL_ASSET_IMAGES: Record<
  PackageTier,
  readonly [StaticImageData, StaticImageData, StaticImageData, StaticImageData, StaticImageData]
> = {
  Premium: [subscribeItem01A, subscribeItem01B, subscribeItem01BB, subscribeItem01C, subscribeItem01D],
  Standard: [subscribeItem02A, subscribeItem02B, subscribeItem02BB, subscribeItem02C, subscribeItem02D],
  Basic: [subscribeItem03A, subscribeItem03B, subscribeItem03BB, subscribeItem03C, subscribeItem03D],
};

type TabKey = "info" | "review" | "delivery" | "support";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "info", label: "구독정보" },
  { key: "review", label: "구독리뷰" },
  { key: "delivery", label: "배송정보" },
  { key: "support", label: "고객센터" },
];

const SORT_OPTIONS = ["최신순", "평점 높은순", "평점 낮은순"] as const;


const REVIEWS_PER_PAGE = 10;

const AVATAR_COLORS = ["#E8B89B", "#C9DBB5", "#F7D4A7", "#B5C9DB", "#DBB5C9", "#A5C4A5"];

function getAvatarColor(seed: string | number | null): string {
  if (seed === null) return AVATAR_COLORS[0];
  const n = typeof seed === "number" ? seed : seed.charCodeAt(0);
  return AVATAR_COLORS[Math.abs(n) % AVATAR_COLORS.length];
}

function maskEmail(email: string | null): string {
  if (!email) return "";
  const atIdx = email.indexOf("@");
  if (atIdx < 0) return email;
  const local = email.slice(0, atIdx);
  const domain = email.slice(atIdx);
  if (local.length <= 2) return `${local[0]}**${domain}`;
  return `${local.slice(0, 2)}****${domain}`;
}

function formatReviewDate(isoDate: string): string {
  return isoDate.slice(0, 10).replace(/-/g, ".");
}

function FullStarIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
        fill="#FDD264"
      />
    </svg>
  );
}

function HalfStarIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
        fill="#FDD264"
      />
      <path
        d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
        fill="#FDD264"
      />
      <path
        d="M14.81 8.63L12 2V17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63Z"
        fill="#DDDDDD"
      />
    </svg>
  );
}

function EmptyStarIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
        fill="#DDDDDD"
      />
    </svg>
  );
}

function Stars({ rating, size = 20 }: { rating: number; size?: number }) {
  const normalized = Math.max(0, Math.min(5, Math.round(rating * 2) / 2));
  const fullCount = Math.floor(normalized);
  const hasHalf = normalized - fullCount >= 0.5;
  const emptyCount = 5 - fullCount - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`별점 ${normalized}점`}>
      {Array.from({ length: fullCount }).map((_, idx) => (
        <FullStarIcon key={`full-${idx}`} size={size} />
      ))}
      {hasHalf ? <HalfStarIcon key="half" size={size} /> : null}
      {Array.from({ length: emptyCount }).map((_, idx) => (
        <EmptyStarIcon key={`empty-${idx}`} size={size} />
      ))}
    </span>
  );
}

type ReviewLightboxState = { urls: string[]; index: number };

function ReviewImageLightbox({
  urls,
  index,
  onClose,
  onNavigate,
}: {
  urls: string[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const onCloseRef = useRef(onClose);
  const onNavigateRef = useRef(onNavigate);

  useEffect(() => {
    onCloseRef.current = onClose;
    onNavigateRef.current = onNavigate;
  }, [onClose, onNavigate]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "ArrowLeft") onNavigateRef.current(Math.max(0, index - 1));
      if (e.key === "ArrowRight") onNavigateRef.current(Math.min(urls.length - 1, index + 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, urls.length]);

  const url = urls[index];
  if (!url) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="리뷰 사진"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="닫기"
        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-[24px] font-light leading-none text-white hover:bg-black/70 md:right-6 md:top-6"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        ×
      </button>
      {urls.length > 1 ? (
        <span className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-body-13-m text-white">
          {index + 1} / {urls.length}
        </span>
      ) : null}
      <div
        className="relative flex max-h-[90vh] max-w-full items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {urls.length > 1 ? (
          <button
            type="button"
            aria-label="이전 사진"
            className="absolute left-0 z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30 max-md:-left-1 md:-left-14"
            disabled={index <= 0}
            onClick={() => onNavigate(index - 1)}
          >
            ‹
          </button>
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={`리뷰 사진 ${index + 1}`} className="max-h-[85vh] max-w-full object-contain" />
        {urls.length > 1 ? (
          <button
            type="button"
            aria-label="다음 사진"
            className="absolute right-0 z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-30 max-md:-right-1 md:-right-14"
            disabled={index >= urls.length - 1}
            onClick={() => onNavigate(index + 1)}
          >
            ›
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function SubscribeProductDetailPage({ initialPlan, plans }: Props) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [activeSort, setActiveSort] = useState<(typeof SORT_OPTIONS)[number]>("최신순");
  const mobileTabsRef = useRef<HTMLDivElement | null>(null);
  const desktopTabsRef = useRef<HTMLDivElement | null>(null);

  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsAverage, setReviewsAverage] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewLightbox, setReviewLightbox] = useState<ReviewLightboxState | null>(null);

  useEffect(() => {
    if (!reviewLightbox) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [reviewLightbox]);

  const fetchReviews = useCallback(
    async (planId: number, page: number) => {
      setReviewsLoading(true);
      try {
        const data = await getReviews(planId, page, REVIEWS_PER_PAGE);
        setReviews(data.items);
        setReviewsTotal(data.total);
        setReviewsAverage(data.averageRating);
      } catch {
        setReviews([]);
        setReviewsTotal(0);
        setReviewsAverage(0);
      } finally {
        setReviewsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchReviews(selectedPlan.id, reviewsPage);
  }, [selectedPlan.id, reviewsPage, fetchReviews]);

  function handleReviewCountClick() {
    setActiveTab("review");
    requestAnimationFrame(() => {
      const target =
        mobileTabsRef.current?.offsetParent !== null
          ? mobileTabsRef.current
          : desktopTabsRef.current;
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const sortedPlans = useMemo(() => [...plans].sort(comparePlansForDisplayOrder), [plans]);

  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    if (activeSort === "평점 높은순") sorted.sort((a, b) => b.rating - a.rating);
    else if (activeSort === "평점 낮은순") sorted.sort((a, b) => a.rating - b.rating);
    else sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted;
  }, [reviews, activeSort]);

  const reviewImages = useMemo(
    () => reviews.flatMap((r) => r.imageUrls ?? []),
    [reviews],
  );

  const totalPages = Math.max(1, Math.ceil(reviewsTotal / REVIEWS_PER_PAGE));
  const selectedTheme = packageThemeForPlan(selectedPlan);
  const selectedTier = tierFromSubscriptionPlan(selectedPlan);
  const selectedPackage = PACKAGES.find((pkg) => pkg.tier === selectedTier) ?? PACKAGES[0];
  const detailImages = DETAIL_ASSET_IMAGES[selectedTier];

  const basePrice = selectedPlan.monthlyPrice;
  const salePrice = basePrice * quantity;

  function handleSelectPlan(plan: SubscriptionPlanDto) {
    setSelectedPlan(plan);
    setQuantity(1);
    setReviewsPage(1);
    router.replace(`/subscribe/detail?planId=${plan.id}`, { scroll: false });
  }

  const activeTierLabel = selectedTheme.tierLabel;

  return (
    <section className="bg-white md:pb-16">
      {reviewLightbox ? (
        <ReviewImageLightbox
          urls={reviewLightbox.urls}
          index={reviewLightbox.index}
          onClose={() => setReviewLightbox(null)}
          onNavigate={(next) =>
            setReviewLightbox((s) => (s ? { ...s, index: next } : null))
          }
        />
      ) : null}
      {/* Mobile layout (Figma-aligned) */}
      <div className="md:hidden">
        <Image
          src={subscribeItemHeroMobile}
          alt="구독 상세 소개 배너"
          className="mb-2 h-auto w-full"
          priority
        />

        <div className="px-6">
          <div className="mb-3 flex items-center justify-center gap-3 py-2">
            {sortedPlans.map((plan) => {
              const theme = packageThemeForPlan(plan);
              const isActive = selectedPlan.id === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  className="rounded-full px-3 py-1 text-body-14-sb text-white"
                  style={{ background: isActive ? theme.colorVar : "var(--color-text-muted)" }}
                >
                  {theme.tierLabel}
                </button>
              );
            })}
          </div>

          <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-[var(--color-surface-warm)]">
            <Image
              src={packageThumbnail}
              alt={`${selectedPlan.name} 대표 이미지`}
              fill
              sizes="(max-width: 768px) 100vw, 508px"
              className="object-cover"
              priority
            />
            <span
              className="absolute left-4 top-4 z-10 inline-flex rounded-full px-3 py-1 text-body-14-sb text-white"
              style={{ background: selectedTheme.colorVar }}
            >
              {activeTierLabel}
            </span>
          </div>

          <h2 className="mt-[30px] text-[24px] font-semibold leading-[29px] tracking-[-0.04em] text-[var(--color-text-emphasis)] capitalize">
            {selectedPlan.name}
          </h2>

          <div className="mt-[12px] flex items-baseline gap-3">
            <span className="text-[20px] font-bold leading-6 tracking-[-0.05em] text-[var(--color-surface-dark)] capitalize">
              월 요금제
            </span>
            <span className="text-price-20-eb leading-8 text-[var(--color-surface-dark)]">
              {formatWon(basePrice)}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <Stars rating={reviewsAverage} size={24} />
            <button
              type="button"
              onClick={handleReviewCountClick}
              className="text-[14px] font-normal leading-[21px] tracking-[-0.02em] text-[var(--color-text-secondary)] underline decoration-[var(--color-text-secondary)]"
            >
              {reviewsTotal}개 리뷰
            </button>
          </div>

          <div className="mt-6 border-t border-[var(--color-text-muted)] pt-6 px-1.5">
            <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-4">
              <span className="text-[14px] font-medium leading-[17px] text-[var(--color-text)]">제품구성</span>
              <span
                className="max-w-[220px] text-left text-[14px] font-bold leading-[17px]"
                style={{ color: selectedTheme.colorVar }}
              >
                {selectedPackage.contents.join(" ")}
              </span>
            </div>

            <div className="mt-[26px] grid grid-cols-[72px_minmax(0,1fr)] items-start gap-x-4">
              <span className="text-[14px] font-medium leading-[17px] text-[var(--color-text)]">배송방법</span>
              <div>
                <p className="text-[13px] font-medium leading-[140%] text-[var(--color-text)]">
                  우체국택배
                </p>
                <p className="mt-2 text-[13px] font-normal leading-[140%] text-[var(--color-text-secondary)]">
                  월~목 배송 / 오전 11시 이후 주문 시 익일 발송
                </p>
              </div>
            </div>

            <div className="mt-[22px] grid grid-cols-[72px_minmax(0,1fr)] items-center gap-x-4">
              <span className="text-[14px] font-medium leading-[17px] text-[var(--color-text)]">제품수량</span>
              <div className="flex h-[34px] w-[102px] items-center justify-between rounded-[5px] border border-[var(--color-text-muted)] bg-white px-3">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="flex h-6 w-6 items-center justify-center rounded bg-[var(--color-text-muted)]/30 text-[14px] font-medium text-black"
                  aria-label="수량 감소"
                >
                  -
                </button>
                <span className="text-[12px] font-medium leading-[14px] tracking-[-0.02em] text-black">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="flex h-6 w-6 items-center justify-center rounded bg-[var(--color-text-muted)]/30 text-[14px] font-medium text-black"
                  aria-label="수량 증가"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--color-text-muted)] pt-6">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-subtitle-16-b-tight capitalize text-[var(--color-surface-dark)]">총 합계</span>
              <span className="text-[20px] font-bold leading-6 tracking-[-0.05em] capitalize text-[var(--color-surface-dark)]">
                {formatWon(salePrice)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => router.push(`/order?planId=${selectedPlan.id}&quantity=${quantity}`)}
              className="flex h-12 w-full items-center justify-center rounded-[30px] text-subtitle-16-sb text-white"
              style={{ background: "var(--color-accent)" }}
            >
              구독하기
            </button>
          </div>

          <div
            ref={mobileTabsRef}
            className="mt-6 scroll-mt-4 border-b border-[var(--color-text-muted)] pb-3"
          >
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center text-center">
              {TABS.map((tab, idx) => {
                const isActive = activeTab === tab.key;
                return (
                  <Fragment key={tab.key}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={
                        isActive
                          ? "text-body-13-sb text-[var(--color-text)]"
                          : "text-body-13-m text-[var(--color-text-secondary)]"
                      }
                    >
                      {tab.label}
                    </button>
                    {idx < TABS.length - 1 && (
                      <span className="mx-1 h-3 w-px bg-[var(--color-text-secondary)]" />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {activeTab === "info" && (
          <div className="pt-5">
            <div className="relative left-1/2 w-screen -translate-x-1/2">
              <div className="mx-auto w-full">
                {detailImages.map((imageSrc, index) => (
                  <Image
                    key={`${selectedTier}-${index}`}
                    src={imageSrc}
                    alt={`${selectedPlan.name} 구독정보 상세 이미지 ${index + 1}`}
                    className="h-auto w-full"
                    priority={index === 0}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "review" && (
          <div className="px-6 pt-6 pb-10">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                className="flex items-center gap-2 text-[16px] font-bold leading-[19px] text-[var(--color-text-emphasis)]"
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
              <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--color-text)]">
                {SORT_OPTIONS.map((opt, idx) => (
                  <Fragment key={opt}>
                    <button
                      type="button"
                      onClick={() => setActiveSort(opt)}
                      className={
                        activeSort === opt
                          ? "font-semibold text-[var(--color-text-emphasis)]"
                          : "text-[var(--color-text-secondary)]"
                      }
                    >
                      {opt}
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
                    onClick={() => setReviewLightbox({ urls: [...reviewImages], index: idx })}
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
                    onClick={() => setReviewLightbox({ urls: [...reviewImages], index: 3 })}
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

            {reviewsLoading ? (
              <p className="py-10 text-center text-[14px] text-[var(--color-text-secondary)]">
                리뷰를 불러오는 중...
              </p>
            ) : sortedReviews.length === 0 ? (
              <p className="py-10 text-center text-[14px] text-[var(--color-text-secondary)]">
                아직 작성된 리뷰가 없습니다.
              </p>
            ) : (
              <ul className="space-y-6">
                {sortedReviews.map((review) => (
                  <li
                    key={review.id}
                    className="border-b border-[var(--color-text-muted)] pb-6 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-[54px] w-[54px] shrink-0 overflow-hidden rounded-full border border-[var(--color-text-muted)]"
                        aria-hidden="true"
                      >
                        {review.snapshotPetProfileImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={review.snapshotPetProfileImageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className="h-full w-full"
                            style={{ background: getAvatarColor(review.userId ?? review.id) }}
                          />
                        )}
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
                    <p className="mt-[9px] pl-[66px] text-[14px] font-medium leading-[20px] tracking-[-0.04em] text-[var(--color-text)]">
                      {review.content}
                    </p>
                    {review.imageUrls && review.imageUrls.length > 0 && (
                      <div className="mt-4 flex gap-2 pl-[66px]">
                        {review.imageUrls.slice(0, 3).map((url, imgIdx) => (
                          <button
                            key={imgIdx}
                            type="button"
                            onClick={() =>
                              setReviewLightbox({
                                urls: review.imageUrls ? [...review.imageUrls] : [],
                                index: imgIdx,
                              })
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
                onClick={() => setReviewsPage((p) => Math.max(1, p - 1))}
                disabled={reviewsPage === 1}
                className="flex h-8 w-8 items-center justify-center text-[14px] text-[var(--color-text-secondary)] disabled:opacity-30"
                aria-label="이전 페이지"
              >
                ‹
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setReviewsPage(page)}
                  className={
                    page === reviewsPage
                      ? "flex h-8 w-8 items-center justify-center text-[14px] font-semibold text-[var(--color-text)]"
                      : "flex h-8 w-8 items-center justify-center text-[14px] text-[var(--color-text-secondary)]"
                  }
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setReviewsPage((p) => Math.min(totalPages, p + 1))}
                disabled={reviewsPage === totalPages}
                className="flex h-8 w-8 items-center justify-center text-[14px] text-[var(--color-text-secondary)] disabled:opacity-30"
                aria-label="다음 페이지"
              >
                ›
              </button>
            </nav>
          </div>
        )}

        {activeTab === "delivery" && (
          <div className="px-6 py-16 text-center">
            <p className="text-[14px] text-[var(--color-text-secondary)]">
              준비 중인 컨텐츠입니다.
            </p>
          </div>
        )}

        {activeTab === "support" && (
          <>
            <div className="px-6 pt-6">
              <Link
                href="/support"
                className="inline-flex items-center gap-1 text-body-16-sb text-[var(--color-text-emphasis)]"
              >
                고객센터
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
            <SupportSection showBanner={false} />
          </>
        )}
      </div>

      {/* Desktop layout */}
      <div className="max-md:hidden">
        <div
          className="relative mx-auto mb-5 flex h-[160px] w-full items-center justify-center overflow-hidden px-4 text-center"
          style={{ background: "var(--gradient-checklist-hero)" }}
        >
          <Image
            src={subscribeItemHeroLeftPaw}
            alt=""
            className="pointer-events-none absolute left-[24%] top-1/2 h-auto w-[82px] -translate-y-1/2"
          />
          <Image
            src={subscribeItemHeroRightPaw}
            alt=""
            className="pointer-events-none absolute left-[71%] top-1/2 h-auto w-[74px] -translate-y-1/2"
          />
          <div className="relative z-10">
            <Image
              src={subscribeItemHeroTitle}
              alt="구독 전, 제품을 확인해보세요"
              className="mx-auto mb-2 h-auto w-[362px] max-w-full"
            />
            <p
              className="text-[16px] font-normal leading-5 tracking-[-0.02em] text-[var(--color-text)]"
              style={{ fontFamily: '"Griun PolFairness", "Griun Fromsol", cursive' }}
            >
              우리 아이를 위한 선택, 성분과 특징을 더 꼼꼼하게 확인해보세요.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[var(--max-width-content)]">
          <div className="mb-8 md:min-h-[64px] flex items-center gap-3 border-b border-[var(--color-text-muted)] pb-5">
            <span className="text-body-16-sb text-[var(--color-text-muted)]">구독선택</span>
            <div className="flex flex-wrap gap-2">
              {sortedPlans.map((plan) => {
                const theme = packageThemeForPlan(plan);
                const isActive = selectedPlan.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    className="rounded-full px-3 py-1 text-body-14-sb text-white transition-opacity hover:opacity-90"
                    style={{
                      background: isActive ? theme.colorVar : "var(--color-text-muted)",
                    }}
                  >
                    {theme.tierLabel}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-8 xl:mx-auto xl:w-[1013px] xl:grid-cols-[508px_438px] xl:justify-between xl:gap-0">
            <div className="mx-auto min-w-0 w-full max-w-[508px] xl:mx-0">
              <div className="relative h-[508px] overflow-hidden rounded-[20px] bg-[var(--color-surface-warm)]">
                <Image
                  src={packageThumbnail}
                  alt={`${selectedPlan.name} 대표 이미지`}
                  fill
                  sizes="508px"
                  className="object-cover"
                  priority
                />
                <span
                  className="absolute left-6 top-6 z-10 rounded-full px-3 py-1 text-body-14-sb text-white"
                  style={{ background: selectedTheme.colorVar }}
                >
                  {selectedTheme.tierLabel}
                </span>
              </div>
            </div>

            <div className="mx-auto min-w-0 w-full max-w-[438px] xl:mx-0">
              <h2 className="mb-2 text-[28px] font-semibold tracking-[-0.04em] text-[var(--color-text-emphasis)]">
                {selectedPlan.name}
              </h2>
              <div className="mb-4 flex items-center gap-2">
                <Stars rating={reviewsAverage} size={24} />
                <button
                  type="button"
                  onClick={handleReviewCountClick}
                  className="text-body-13-r text-[var(--color-text-secondary)] underline decoration-[var(--color-text-secondary)]"
                >
                  {reviewsTotal}개 리뷰
                </button>
              </div>
              <div className="mb-5 flex items-center gap-2">
                <span className="text-body-20-sb tracking-[-0.05em] text-[var(--color-surface-dark)]">
                  월 요금제
                </span>
                <span className="text-[20px] font-extrabold leading-8 tracking-[-0.05em] text-[var(--color-surface-dark)]">
                  {formatWon(basePrice)}
                </span>
              </div>
              <div className="mb-8 border-t border-[var(--color-text-muted)] pt-7 px-2">
                <div className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-[56px_minmax(0,1fr)] items-start gap-x-4 md:gap-x-9 text-body-14-m">
                    <span className="text-[var(--color-text)] leading-[1.1]">제품구성</span>
                    <span className="justify-self-start max-w-[240px] text-left text-body-14-b leading-[17px]" style={{ color: selectedTheme.colorVar }}>
                      {selectedPackage.contents.join(" ")}
                    </span>
                  </div>
                  <div className="grid grid-cols-[56px_minmax(0,1fr)] items-start gap-x-4 md:gap-x-9 text-body-14-m">
                    <span className="text-[var(--color-text)] leading-[1.1]">배송방법</span>
                    <div className="justify-self-start max-w-[240px] text-left">
                      <p className="text-body-13-m leading-[140%] text-[var(--color-text)]">우체국택배</p>
                      <p className="text-body-13-r leading-[140%] text-[var(--color-text-secondary)] mt-2">
                        월~목 배송 / 오전 11시 이후 주문 시 익일 발송
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-x-4 md:gap-x-9 text-body-14-m">
                    <span className="text-[var(--color-text)] leading-[1.1]">제품수량</span>
                    <div className="justify-self-start flex h-[34px] items-center gap-3 rounded-[5px] border border-[var(--color-text-muted)] px-3">
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        className="h-6 w-6 rounded bg-[rgba(221,221,221,0.3)] text-body-13-sb"
                        aria-label="수량 감소"
                      >
                        -
                      </button>
                      <span className="min-w-3 text-center text-[12px] font-medium leading-[14px]">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => prev + 1)}
                        className="h-6 w-6 rounded bg-[rgba(221,221,221,0.3)] text-body-13-sb"
                        aria-label="수량 증가"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-[var(--color-text-muted)] pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-body-20-sb text-[var(--color-text)]">총 합계</span>
                  <span className="text-body-20-sb text-[var(--color-text)]">{formatWon(salePrice)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/order?planId=${selectedPlan.id}&quantity=${quantity}`)}
                  className="flex h-[48px] w-full items-center justify-center md:mt-8 rounded-[30px] text-subtitle-16-sb text-white transition-opacity hover:opacity-90 active:opacity-80"
                  style={{ background: selectedTheme.colorVar }}
                >
                  구독하기
                </button>
              </div>
            </div>
          </div>

          <div
            ref={desktopTabsRef}
            className="md:mt-[54px] scroll-mt-4 border-b border-[var(--color-text-muted)] pb-4"
          >
            <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center text-center">
              {TABS.map((tab, idx) => {
                const isActive = activeTab === tab.key;
                return (
                  <Fragment key={tab.key}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={
                        isActive
                          ? "text-body-20-sb text-[var(--color-text)]"
                          : "text-body-20-m text-[var(--color-text-secondary)]"
                      }
                    >
                      {tab.label}
                    </button>
                    {idx < TABS.length - 1 && (
                      <span className="mx-2 h-3 w-px bg-[var(--color-text-secondary)]" />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>

          {activeTab === "info" && (
            <div className="pt-5 md:pt-20">
              <div className="mx-auto w-full md:max-w-[800px]">
                {detailImages.map((imageSrc, index) => (
                  <Image
                    key={`${selectedTier}-${index}`}
                    src={imageSrc}
                    alt={`${selectedPlan.name} 구독정보 상세 이미지 ${index + 1}`}
                    className="h-auto w-full"
                    priority={index === 0}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === "review" && (
            <div className="pt-10 pb-20">
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
                    <Fragment key={opt}>
                      <button
                        type="button"
                        onClick={() => setActiveSort(opt)}
                        className={
                          activeSort === opt
                            ? "font-semibold text-[var(--color-text-emphasis)]"
                            : "font-normal text-[var(--color-text-secondary)]"
                        }
                      >
                        {opt}
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
                      onClick={() => setReviewLightbox({ urls: [...reviewImages], index: idx })}
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
                      onClick={() => setReviewLightbox({ urls: [...reviewImages], index: 4 })}
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

              {reviewsLoading ? (
                <p className="py-16 text-center text-body-16-r text-[var(--color-text-secondary)]">
                  리뷰를 불러오는 중...
                </p>
              ) : sortedReviews.length === 0 ? (
                <p className="py-16 text-center text-body-16-r text-[var(--color-text-secondary)]">
                  아직 작성된 리뷰가 없습니다.
                </p>
              ) : (
                <ul>
                  {sortedReviews.map((review) => (
                    <li
                      key={review.id}
                      className="flex items-start gap-6 border-b border-[var(--color-text-muted)] py-6 last:border-b-0"
                    >
                      <div className="flex flex-1 items-start gap-4">
                        <div
                          className="h-12 w-12 shrink-0 overflow-hidden rounded-full"
                          aria-hidden="true"
                        >
                          {review.snapshotPetProfileImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={review.snapshotPetProfileImageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div
                              className="h-full w-full"
                              style={{ background: getAvatarColor(review.userId ?? review.id) }}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <span
                              className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold leading-[14px] text-white"
                              style={{ background: selectedTheme.colorVar }}
                            >
                              {selectedTheme.tierLabel}
                            </span>
                            <Stars rating={review.rating} size={20} />
                          </div>
                          <div className="mb-3 flex items-center gap-3 text-[13px] leading-[16px]">
                            <span className="font-semibold text-[var(--color-text)]">
                              {review.snapshotPetName ?? "익명"}
                            </span>
                            {review.snapshotUserEmail && (
                              <span className="text-[var(--color-text-secondary)]">
                                {maskEmail(review.snapshotUserEmail)}
                              </span>
                            )}
                            <span className="text-[var(--color-text-secondary)]">
                              {formatReviewDate(review.createdAt)}
                            </span>
                          </div>
                          <p className="text-[14px] font-normal leading-[22px] text-[var(--color-text)]">
                            {review.content}
                          </p>
                          {review.imageUrls && review.imageUrls.length > 0 && (
                            <div className="mt-3 flex gap-2">
                              {review.imageUrls.slice(0, 3).map((url, imgIdx) => (
                                <button
                                  key={imgIdx}
                                  type="button"
                                  onClick={() =>
                                    setReviewLightbox({
                                      urls: review.imageUrls ? [...review.imageUrls] : [],
                                      index: imgIdx,
                                    })
                                  }
                                  className="h-[100px] w-[100px] overflow-hidden rounded-[8px] border border-[var(--color-text-muted)] transition-opacity hover:opacity-90 active:opacity-80"
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
                        </div>
                      </div>
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
                  onClick={() => setReviewsPage((p) => Math.max(1, p - 1))}
                  disabled={reviewsPage === 1}
                  className="flex h-9 w-9 items-center justify-center text-[16px] text-[var(--color-text-secondary)] disabled:opacity-30"
                  aria-label="이전 페이지"
                >
                  ‹
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setReviewsPage(page)}
                    className={
                      page === reviewsPage
                        ? "flex h-9 w-9 items-center justify-center text-[15px] font-semibold text-[var(--color-text)]"
                        : "flex h-9 w-9 items-center justify-center text-[15px] text-[var(--color-text-secondary)]"
                    }
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setReviewsPage((p) => Math.min(totalPages, p + 1))}
                  disabled={reviewsPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center text-[16px] text-[var(--color-text-secondary)] disabled:opacity-30"
                  aria-label="다음 페이지"
                >
                  ›
                </button>
              </nav>
            </div>
          )}

          {activeTab === "delivery" && (
            <div className="py-20 text-center">
              <p className="text-body-16-r text-[var(--color-text-secondary)]">
                준비 중인 컨텐츠입니다.
              </p>
            </div>
          )}

          {activeTab === "support" && (
            <>
              <div className="pt-10 pb-2">
                <Link
                  href="/support"
                  className="inline-flex items-center gap-1 text-body-20-sb text-[var(--color-text-emphasis)]"
                >
                  고객센터
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
              <SupportSection showBanner={false} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
