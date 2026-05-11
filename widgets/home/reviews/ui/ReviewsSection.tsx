"use client";

import type { StaticImageData } from "next/image";
import Image from "next/image";
import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Text, ScrollReveal } from "@/shared/ui";
import { useAuth } from "@/features/auth";
import reviewsTitle from "../assets/reviews-title.png";
import reviewsTitleMobile from "../assets/reviews-title-mobile.png";
import reviewsProfile01 from "../assets/reviews-profile-01.webp";
import reviewsProfile02 from "../assets/reviews-profile-02.webp";
import reviewsProfile03 from "../assets/reviews-profile-03.webp";
import reviewsProfile04 from "../assets/reviews-profile-04.jpg";

const REVIEWS = [
  {
    name: "코코",
    subscription: "2026.04.20 · 프리미엄 패키지 BOX",
    review:
      "원래 간식 진짜 가리는 애라서 이것저것 다 사봤는데 이건 처음으로 먼저 달라고 찾아요!  ㅋㅋ  특히 수제라 그런지 냄새부터 다르고 먹고 나서도 탈이 없어서 너무 만족하고 있어요. 이제 다른 간식은 못 먹일 것 같아요.",
    rating: 4.5,
    profile: reviewsProfile01,
  },
  {
    name: "보리",
    subscription: "2026.04.20 · 스탠다드 패키지 BOX",
    review:
      "알러지 때문에 간식 고르는 게 항상 스트레스였는데 여기는 맞춤으로 추천해줘서 너무 편하고 좋아요. \n성분도 깔끔해서 믿고 먹일 수 있고 무엇보다 아이가 너무 잘 먹어서 계속 구독 중입니다.",
    rating: 5,
    profile: reviewsProfile02,
  },
  {
    name: "두부",
    subscription: "2026.04.08 · 프리미엄 패키지 BOX",
    review:
      "일반 간식 주면 꼭 항상 반 정도 남기던 애인데 이건 끝까지 다 먹어요.\n특히 종류가 다양해서 질려하지 않는 게 가장 좋아요. 가격 대비 만족도가 생각보다 훨씬 높네요.",
    rating: 5,
    profile: reviewsProfile03,
  },
  {
    name: "루루",
    subscription: "2026.05.11 · 스탠다드 패키지 BOX",
    review:
      "처음엔 반신반의 하면서 시작했는데 지금은 간식 시간만 되면 눈빛이 완전 달라져요ㅋㅋ 배송도 깔끔하고 신선한 느낌이 확실히 있어서 ‘아 이건 다르다’ 싶었습니다.\n루루가 너무 좋아해서 앞으로도 꾸준히 구독할 의향 있어요~",
    rating: 5,
    profile: reviewsProfile04,
  },
] as const;

type DisplayReview = {
  name: string;
  subscription: string;
  review: string;
  rating: number;
  profile: StaticImageData;
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
  const rawId = useId().replace(/:/g, "");
  const filterId = `reviews-carousel-dl-${rawId}`;

  return (
    <button
      type="button"
      aria-label="이전 리뷰"
      disabled={disabled}
      onClick={onClick}
      className="shrink-0 rounded-full text-[var(--color-text-label)] transition-opacity disabled:pointer-events-none disabled:opacity-35"
    >
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <g filter={`url(#${filterId})`}>
          <rect x="2" y="2" width="36" height="36" rx="18" fill="white" shapeRendering="crispEdges" />
          <path
            d="M24 12L15 20L24 28"
            stroke="#999999"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <filter
            id={filterId}
            x="0"
            y="0"
            width="44"
            height="44"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="2" dy="2" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>
        </defs>
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
  const rawId = useId().replace(/:/g, "");
  const filterId = `reviews-carousel-dr-${rawId}`;

  return (
    <button
      type="button"
      aria-label="다음 리뷰"
      disabled={disabled}
      onClick={onClick}
      className="shrink-0 rounded-full text-[var(--color-text-label)] transition-opacity disabled:pointer-events-none disabled:opacity-35"
    >
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <g filter={`url(#${filterId})`}>
          <rect width="36" height="36" rx="18" transform="matrix(-1 0 0 1 38 2)" fill="white" shapeRendering="crispEdges" />
          <path
            d="M16 12L25 20L16 28"
            stroke="#DDDDDD"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <filter
            id={filterId}
            x="0"
            y="0"
            width="44"
            height="44"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dx="2" dy="2" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>
        </defs>
      </svg>
    </button>
  );
}

function ReviewCard({ review }: { review: DisplayReview }) {
  return (
    <div className="relative flex h-full flex-col items-center rounded-2xl bg-white px-8 pb-8 pt-[84px] shadow-[0px_4px_10px_rgba(82,82,82,0.1)]">
      <div className="absolute -top-[60px] left-1/2 h-[120px] w-[120px] -translate-x-1/2 overflow-hidden rounded-full border-[8px] border-white">
        <Image
          src={review.profile}
          alt={`${review.name} 프로필`}
          width={120}
          height={120}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex w-full flex-1 flex-col items-center">
        <div className="mb-6 flex gap-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} fillPercent={Math.max(0, Math.min(100, (review.rating - i) * 100))} />
          ))}
        </div>

        <p className="mb-6 flex-1 whitespace-pre-line text-[14px] leading-[140%] text-[var(--color-review-text)]">
          {review.review}
        </p>

        <div className="flex w-full shrink-0 flex-col items-center gap-2">
          <span className="text-center text-[18px] font-bold leading-[21px] text-[var(--color-review-text)]">
            {review.name}
          </span>
          <div className="flex flex-col items-center gap-1 text-center text-[14px] font-medium leading-[17px] text-[var(--color-text-label)]">
            {review.subscription.split(/\s*·\s*/).map((part, idx) => (
              <span key={idx}>{part}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewsCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [metrics, setMetrics] = useState({ slide: 0, gap: 36, desktop: false });

  const measure = useCallback(() => {
    const vp = viewportRef.current;
    const track = trackRef.current;
    if (!vp) return;
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    const w = vp.getBoundingClientRect().width;
    const rawGap = track ? parseFloat(getComputedStyle(track).gap || "0") : 36;
    const gap = Number.isFinite(rawGap) && rawGap > 0 ? rawGap : 36;
    const slide = desktop ? (w - 2 * gap) / 3 : w;
    setMetrics({ slide, gap, desktop });
  }, []);

  useLayoutEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(vp);
    const mq = window.matchMedia("(min-width: 768px)");
    mq.addEventListener("change", measure);
    queueMicrotask(measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
  }, [measure]);

  const maxStart = useMemo(
    () => (metrics.desktop ? Math.max(0, REVIEWS.length - 3) : Math.max(0, REVIEWS.length - 1)),
    [metrics.desktop],
  );

  const displayIndex = Math.min(startIndex, maxStart);
  const stepPx = metrics.slide > 0 ? metrics.slide + metrics.gap : 0;
  const canPrev = displayIndex > 0;
  const canNext = displayIndex < maxStart;

  return (
    <div className="flex items-center gap-3 md:gap-4">
      <CarouselPrevButton
        disabled={!canPrev}
        onClick={() => setStartIndex(Math.max(0, displayIndex - 1))}
      />
      <div ref={viewportRef} className="min-w-0 w-full overflow-hidden pt-[60px]">
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
  const router = useRouter();

  function handleChecklistCtaClick() {
    if (isLoggedIn) {
      router.push("/checklist");
      return;
    }
    router.push("/login?next=/checklist");
  }

  return (
    <section
      className="py-16 md:pt-[86px] md:pb-[58px]"
      style={{ background: "var(--gradient-reviews)" }}
    >
      <div className="mx-auto max-w-content max-md:px-6 md:px-0">
        <ScrollReveal variant="fade-up">
          <Image
            src={reviewsTitle}
            alt="생생한 리뷰를 확인하세요!"
            className="mx-auto h-auto w-full max-w-[623px] max-md:hidden"
          />
          <Image
            src={reviewsTitleMobile}
            alt="그래서 꼬순박스는 다르게 만들었습니다!"
            className="mx-auto h-auto w-full max-w-[233px] md:hidden"
          />
        </ScrollReveal>
        <ScrollReveal variant="fade-up" delay={150}>
          <Text
            variant="body-16-r"
            mobileVariant="body-14-m"
            className="mt-4 md:mt-5.5 mb-12 md:mb-[55px] text-center text-[var(--color-text-warm)] tracking-[-0.02em]"
          >
            실제 꼬순박스 패키지를 구매하신&nbsp;<br className="md:hidden"/>고객님들의 생생한 리뷰입니다.
          </Text>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={300} className="w-full">
          <ReviewsCarousel />
        </ScrollReveal>
        <ScrollReveal variant="fade-up" delay={450}>
          <div className="mt-12 md:mt-14 flex justify-center">
            <button
              type="button"
              onClick={handleChecklistCtaClick}
              className="h-[52px] w-[282px] rounded-[50px] bg-[var(--color-accent-strong)] text-center text-[16px] font-semibold leading-[30px] tracking-[-0.04em] text-white"
            >
              10초 진단하고 우리 아이 맞춤 추천 받기
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
