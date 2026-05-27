"use client";

import type { StaticImageData } from "next/image";
import Image from "next/image";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ScrollReveal } from "@/shared/ui";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import reviewsBg from "../assets/reviews-bg.png";
import reviewsTitle from "../assets/reviews-title-new.png";
import reviewsProfile01 from "../assets/reviews-profile-01.jpg";
import reviewsProfile02 from "../assets/reviews-profile-02.jpg";
import reviewsProfile03 from "../assets/reviews-profile-03.webp";
import { MEDIA_MD_MIN, MEDIA_LG_MIN } from "@/shared/config/breakpoints";

const REVIEWS = [
  {
    name: "콩콩",
    subscriptionBadge: "구독 3개월",
    subscription: "2026.04.20 (구독 3개월, 프리미엄)",
    review:
      "원래 간식 진짜 가리는 애라서 이것저것 다 사봤는데 이건 처음으로 먼저 달라고 찾아요! ㅋㅋ 특히 수제라 그런지 냄새부터 다르고 먹고 나서도 탈이 없어서 너무 만족하고 있어요. 이제 다른 간식은 못 먹일 것 같아요.",
    rating: 5,
    profile: reviewsProfile01,
    profileObjectPosition: "center 5%",
  },
  {
    name: "보리",
    subscriptionBadge: "구독 5개월",
    subscription: "2026.04.20 (구독 5개월, 스탠다드)",
    review:
      "알러지 때문에 간식 고르는 게 항상 스트레스였는데 여기는 맞춤으로 추천해줘서 너무 편하고 좋아요. 성분도 깔끔해서 믿고 먹일 수 있고 무엇보다 아이가 너무 잘 먹어서 계속 구독 중입니다.",
    rating: 5,
    profile: reviewsProfile02,
    profileObjectPosition: "93% center",
  },
  {
    name: "두부",
    subscriptionBadge: "구독 2개월",
    subscription: "2026.04.08 (구독 2개월, 베이직)",
    review:
      "일반 간식 주면 꼭 항상 반 정도 남기던 애인데 이건 끝까지 다 먹어요. 특히 종류가 다양해서 질려하지 않는 게 가장 좋아요. 가격 대비 만족도가 생각보다 훨씬 높네요.",
    rating: 5,
    profile: reviewsProfile03,
  },
] as const;

type DisplayReview = {
  name: string;
  subscriptionBadge: string;
  subscription: string;
  review: string;
  rating: number;
  profile: StaticImageData;
  profileObjectPosition?: string;
};

function StarIcon({ fillPercent = 100 }: { fillPercent?: number }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L14.9 8.6L22 9.3L16.8 14L18.4 21L12 17.3L5.6 21L7.2 14L2 9.3L9.1 8.6L12 2Z"
        fill="var(--color-surface-warm)"
      />
      <path
        d="M12 2L14.9 8.6L22 9.3L16.8 14L18.4 21L12 17.3L5.6 21L7.2 14L2 9.3L9.1 8.6L12 2Z"
        fill="var(--color-star)"
        style={{ clipPath: `inset(0 ${100 - fillPercent}% 0 0)` }}
      />
    </svg>
  );
}

function CarouselPrevButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="이전 리뷰"
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] text-white/50 shadow-[2px_2px_4px_rgba(0,0,0,0.12)] transition-opacity disabled:pointer-events-none disabled:opacity-35"
      style={{ background: "rgba(255,255,255,0.3)" }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path
          d="M11 4L6 9L11 14"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function CarouselNextButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="다음 리뷰"
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] text-white shadow-[2px_2px_4px_rgba(0,0,0,0.12)] transition-opacity disabled:pointer-events-none disabled:opacity-35"
      style={{ background: "rgba(255,255,255,0.3)" }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path
          d="M7 4L12 9L7 14"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function ReviewCard({ review }: { review: DisplayReview }) {
  return (
    <div className="relative flex min-h-[366px] min-w-[300px] flex-col items-center rounded-2xl bg-white px-8 pt-[164px] shadow-[0px_4px_16px_rgba(82,82,82,0.2)]">
      <div className="absolute -top-[60px] left-1/2 z-30 h-[120px] w-[120px] -translate-x-1/2 overflow-hidden rounded-full border-[8px] border-white">
        <Image
          src={review.profile}
          alt={`${review.name} 프로필`}
          width={120}
          height={120}
          className="h-full w-full object-cover"
          style={
            review.profileObjectPosition
              ? { objectPosition: review.profileObjectPosition }
              : undefined
          }
        />
      </div>

      <span
        className="absolute left-1/2 top-[76px] z-10 flex h-6 min-w-[85px] -translate-x-1/2 items-center justify-center rounded-[30px] bg-review-chip px-3 py-1 text-[14px] font-semibold leading-[17px] text-white"
      >
        {review.subscriptionBadge}
      </span>

      <div className="absolute left-1/2 top-[108px] z-10 flex h-6 w-[120px] -translate-x-1/2 gap-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} fillPercent={Math.max(0, Math.min(100, (review.rating - i) * 100))} />
        ))}
      </div>

      <p className="h-[100px] w-full whitespace-pre-line text-[14px] font-normal leading-[140%] text-[var(--color-review-text)]">
        {review.review}
      </p>

      <div className="absolute bottom-8 left-8 right-8 flex h-[46px] flex-col items-center gap-2 text-center">
        <span className="text-[18px] font-bold leading-[21px] text-[var(--color-review-text)]">
          {review.name}
        </span>
        <div className="text-[14px] font-medium leading-[17px] text-[var(--color-text-label)]">
          {review.subscription}
        </div>
      </div>
    </div>
  );
}

function ReviewsCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [metrics, setMetrics] = useState({ slide: 0, gap: 36, visibleCards: 1 });

  const measure = useCallback(() => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!vp) return;
    const isDesktop = window.matchMedia(MEDIA_LG_MIN).matches;
    const isTablet = window.matchMedia(MEDIA_MD_MIN).matches;
    const visibleCards = isDesktop ? 3 : isTablet ? 2 : 1;
    const w = vp.getBoundingClientRect().width;
    const rawGap = track ? parseFloat(getComputedStyle(track).gap || "0") : 36;
    const gap = Number.isFinite(rawGap) && rawGap > 0 ? rawGap : 36;
    const slide = isDesktop ? (w - 2 * gap) / 3 : isTablet ? (w - gap) / 2 : w;
    setMetrics({ slide, gap, visibleCards });
  }, []);

  useLayoutEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(vp);
    const mqMd = window.matchMedia(MEDIA_MD_MIN);
    const mqLg = window.matchMedia(MEDIA_LG_MIN);
    mqMd.addEventListener("change", measure);
    mqLg.addEventListener("change", measure);
    queueMicrotask(measure);
    return () => {
      ro.disconnect();
      mqMd.removeEventListener("change", measure);
      mqLg.removeEventListener("change", measure);
    };
  }, [measure]);

  const maxStart = useMemo(
    () => Math.max(0, REVIEWS.length - metrics.visibleCards),
    [metrics.visibleCards],
  );

  const displayIndex = Math.min(startIndex, maxStart);
  const stepPx = metrics.slide > 0 ? metrics.slide + metrics.gap : 0;
  const canPrev = displayIndex > 0;
  const canNext = displayIndex < maxStart;

  return (
    <div className="mx-auto flex w-full max-w-[1107px] items-center justify-between gap-3 md:gap-4 lg:gap-6">
      <CarouselPrevButton
        disabled={!canPrev}
        onClick={() => setStartIndex(Math.max(0, displayIndex - 1))}
      />
      <div ref={viewportRef} className="min-w-0 w-full max-w-[1011px] overflow-hidden pt-[60px] max-md:max-w-[640px] max-md:mx-auto">
        <div
          ref={trackRef}
          className="flex gap-9 transition-transform duration-300 ease-out"
          style={stepPx > 0 ? { transform: `translateX(-${displayIndex * stepPx}px)` } : undefined}
        >
          {REVIEWS.map((review, i) => (
            <div
              key={review.name + i}
              className="shrink-0"
              style={metrics.slide > 0 ? { width: metrics.slide } : undefined}
            >
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>
      <CarouselNextButton
        disabled={!canNext}
        onClick={() => setStartIndex(Math.min(maxStart, displayIndex + 1))}
      />
    </div>
  );
}

export default function ReviewsSection() {
  const { isLoggedIn } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();

  function handleChecklistCtaClick() {
    if (!isLoggedIn) {
      router.push("/login?next=/checklist");
      return;
    }
    const hasChecklist = (profile?.checklistAnswers?.length ?? 0) > 0;
    if (hasChecklist) {
      router.push("/subscribe");
      return;
    }
    router.push("/checklist");
  }

  return (
    <section
      className="relative overflow-hidden py-16 md:py-20 lg:h-[862px] lg:py-0"
      style={{ background: "var(--color-cta-button)" }}
    >
      <Image
        src={reviewsBg}
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
        priority
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-[1107px] max-md:px-6 md:px-6 lg:px-0 lg:pt-[100px]">
        <ScrollReveal variant="fade-up">
          <Image
            src={reviewsTitle}
            alt="꼬순박스를 구독한 구독자들의 실제 후기를 확인하세요!"
            className="mx-auto h-auto w-full max-w-[640px] md:max-w-[760px] lg:max-w-[845px]"
            sizes="(min-width: 1200px) 845px, (min-width: 768px) 760px, 640px"
            priority
          />
        </ScrollReveal>
        <ScrollReveal variant="fade-up" delay={150}>
          <p className="mt-4 text-center text-[14px] font-medium leading-[18px] tracking-[-0.02em] text-white md:text-[16px] md:leading-[19px]">
            실제 꼬순박스 패키지를 구매하신 고객님들의 생생한 리뷰입니다.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={300} className="mt-[34px] w-full md:mt-[64px] lg:mt-[94px]">
          <ReviewsCarousel />
        </ScrollReveal>
        <ScrollReveal variant="fade-up" delay={450}>
          <div className="mt-12 md:mt-[52px] flex justify-center">
            <button
              type="button"
              onClick={handleChecklistCtaClick}
              className="h-12 w-[327px] rounded-[8px] bg-[var(--color-text)] text-center text-[14px] font-semibold leading-[30px] tracking-[-0.04em] text-white md:h-[52px] md:w-[312px] md:text-[16px]"
            >
              10초 진단하고 우리 아이 맞춤 추천 받기
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
