"use client";

import type { StaticImageData } from "next/image";
import Image from "next/image";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ScrollReveal } from "@/shared/ui";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { openChecklistForm } from "@/shared/lib/checklistModal";
import { ReviewsTitleMobile } from "./ReviewsTitleMobile";
import reviewsTitle from "../assets/reviews-title-new.svg";
import reviewsProfile01 from "../assets/reviews-profile-01.webp";
import reviewsProfile02 from "../assets/reviews-profile-02.webp";
import reviewsProfile03 from "../assets/reviews-profile-03.webp";
import reviewsProfile04 from "../assets/reviews-profile-04.webp";
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
    name: "몽땅",
    subscriptionBadge: "구독 2개월",
    subscription: "2026.04.08 (구독 2개월, 베이직)",
    review:
      "일반 간식 주면 꼭 항상 반 정도 남기던 애인데 이건 끝까지 다 먹어요. 특히 종류가 다양해서 질려하지 않는 게 가장 좋아요. 가격 대비 만족도가 생각보다 훨씬 높네요.",
    rating: 5,
    profile: reviewsProfile03,
  },
  {
    name: "루루",
    subscriptionBadge: "구독 4개월",
    subscription: "2026.04.20 (구독 2개월, 스탠다드)",
    review:
      "처음엔 반신반의하면서 시작했는데 지금은 간식 시간만 되면 눈빛이 완전 달라져요ㅋㅋ 배송도 깔끔하고 신선한 느낌이 확실히 있어서 '아 이건 다르다' 싶었습니다. 루루가 너무 좋아해서 앞으로도 꾸준히 구독할 의향 있어요~",
    rating: 5,
    profile: reviewsProfile04,
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

/** 활성(클릭 가능): 불투명 흰 배경 + #999999 화살표 / 비활성: 반투명 흰 배경 + #DADADA 화살표 */
function CarouselArrowButton({
  direction,
  label,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const filterId = `filter0_d_reviews_${direction}`;
  const shadowId = `effect1_dropShadow_reviews_${direction}`;
  const path = direction === "prev" ? "M24 12L15 20L24 28" : "M16 12L25 20L16 28";

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 w-11 shrink-0 items-center justify-center transition-opacity disabled:pointer-events-none"
    >
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <g filter={`url(#${filterId})`}>
          <rect
            x="2"
            y="2"
            width="36"
            height="36"
            rx="18"
            fill="white"
            fillOpacity={disabled ? 0.3 : 1}
            shapeRendering="crispEdges"
          />
          <path
            d={path}
            stroke={disabled ? "#DADADA" : "#999999"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <filter id={filterId} x="0" y="0" width="44" height="44" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dx="2" dy="2" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result={shadowId} />
            <feBlend mode="normal" in="SourceGraphic" in2={shadowId} result="shape" />
          </filter>
        </defs>
      </svg>
    </button>
  );
}

function ReviewCard({ review }: { review: DisplayReview }) {
  const spaceIndex = review.subscription.indexOf(" ");
  const subscriptionDate =
    spaceIndex === -1 ? review.subscription : review.subscription.slice(0, spaceIndex);
  const subscriptionRest = spaceIndex === -1 ? "" : review.subscription.slice(spaceIndex + 1);

  return (
    // data-nosnippet: 후기 텍스트가 검색 결과 스니펫(설명)으로 사용되지 않도록 제외한다.
    // (화면 표시는 그대로, 구글이 meta description을 쓰도록 유도)
    <div
      data-nosnippet
      className="relative flex min-h-[334px] min-w-[300px] flex-col items-center rounded-2xl bg-white px-8 pt-[132px] shadow-[0px_4px_16px_rgba(82,82,82,0.2)]"
    >
      <div className="absolute -top-[60px] left-1/2 z-30 h-[120px] w-[120px] -translate-x-1/2 overflow-hidden rounded-full border-[8px] border-white">
        <Image
          src={review.profile}
          alt={`${review.name} 프로필`}
          width={120}
          height={120}
          quality={HIGH_IMAGE_QUALITY}
          className="h-full w-full object-cover"
          style={
            review.profileObjectPosition
              ? { objectPosition: review.profileObjectPosition }
              : undefined
          }
        />
      </div>

      <div className="absolute left-1/2 top-[84px] z-10 flex h-6 w-[120px] -translate-x-1/2 gap-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon key={i} fillPercent={Math.max(0, Math.min(100, (review.rating - i) * 100))} />
        ))}
      </div>

      <p className="h-[100px] w-full whitespace-pre-line text-body-13-r text-[var(--color-review-text)]">
        {review.review}
      </p>

      <div className="absolute bottom-6 left-8 right-8 flex flex-col items-center gap-1 text-center">
        <span className="text-[18px] font-bold leading-[21px] text-[var(--color-review-text)]">
          {review.name}
        </span>
        <div className="text-[14px] font-medium leading-[17px] text-[var(--color-text-label)]">
          {subscriptionDate} <br className="md:hidden" />
          {subscriptionRest}
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

  return (
    <div className="mx-auto flex w-full max-w-[1107px] items-center justify-between gap-3 md:gap-4 lg:gap-6">
      <CarouselArrowButton
        direction="prev"
        label="이전 리뷰"
        disabled={false}
        onClick={() => setStartIndex(displayIndex === 0 ? maxStart : displayIndex - 1)}
      />
      <div ref={viewportRef} className="min-w-0 w-full max-w-[1011px] max-md:max-w-[640px] max-md:mx-auto">
        <div className="-mx-5 overflow-hidden px-5 pt-[76px] pb-6">
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
      </div>
      <CarouselArrowButton
        direction="next"
        label="다음 리뷰"
        disabled={false}
        onClick={() => setStartIndex(displayIndex === maxStart ? 0 : displayIndex + 1)}
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
      router.push("/checklist/result");
      return;
    }
    openChecklistForm();
  }

  return (
    <section
      className="relative overflow-hidden py-16 md:py-20 lg:h-[862px] lg:py-0"
      style={{ background: "var(--color-reviews-bg)" }}
    >
      <div className="relative z-10 mx-auto max-w-[1107px] max-md:px-6 md:px-6 lg:px-0 lg:pt-[100px]">
        <ScrollReveal variant="fade-up">
          <div className="relative mx-auto w-full max-w-[486px] md:max-w-[760px] lg:max-w-[845px]">
            <ReviewsTitleMobile className="mx-auto h-[108px] w-auto md:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={reviewsTitle.src}
              alt="꼬순박스를 구독한 구독자들의 실제 후기를 확인하세요!"
              width={reviewsTitle.width}
              height={reviewsTitle.height}
              className="max-md:hidden mx-auto h-auto w-full"
              loading="eager"
              decoding="async"
            />
            <svg
              width="50"
              height="50"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="pointer-events-none absolute -right-[26px] -top-[16px] h-6 w-6 select-none max-md:hidden md:-right-[30px] md:-top-[20px] md:h-8 md:w-8 lg:-right-[42px] lg:-top-[32px] lg:h-[50px] lg:w-[50px]"
            >
              <path d="M24.72 38.1949C23.656 38.2011 22.9459 39.605 23.1619 40.4126C23.3537 41.1308 24.4091 42.3558 25.3854 42.4317C29.9366 42.7939 40.7674 43.5588 40.9821 40.859C41.114 39.203 38.9827 38.0984 37.6309 38.1081L24.7193 38.1899L24.72 38.1949Z" fill="#EC7700" />
              <path d="M5.45745 21.5642C5.31397 22.6319 6.256 23.9747 7.0469 24.3517C7.83779 24.7288 9.29672 24.3754 9.53861 23.5325C10.653 19.6457 11.5008 16.0368 12.313 11.9873C12.4397 11.356 11.4615 9.98131 10.8546 9.63576C10.2162 9.27625 9.07282 9.10432 8.35352 9.33037C7.06132 13.2703 6.05677 17.1493 5.45962 21.5621L5.45745 21.5642Z" fill="#EC7700" />
              <path d="M21.0334 25.5283C20.1083 26.3895 20.2391 27.8909 20.891 28.7318C21.543 29.5726 23.1686 29.5792 24.1042 28.7772C27.7161 25.6706 30.9804 22.6967 34.3055 19.3194C34.8773 18.7418 34.5673 17.0072 34.0896 16.4161C33.4741 15.655 31.8604 15.4389 30.9841 16.2571L21.0307 25.531L21.0334 25.5283Z" fill="#EC7700" />
            </svg>
          </div>
        </ScrollReveal>
        <ScrollReveal variant="fade-up" delay={150}>
          <p className="mt-[25px] text-center text-[14px] font-medium leading-[18px] tracking-[-0.02em] text-[var(--color-why-choose-text)] md:text-[16px] md:leading-[19px]">
            실제 꼬순박스 패키지를 구매하신 고객님들의 생생한 리뷰입니다.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={300} className="mt-10 w-full">
          <div className="md:hidden mx-auto flex w-full max-w-[360px] flex-col gap-[84px] pt-[60px]">
            {REVIEWS.map((review, i) => (
              <ReviewCard key={`${review.name}-mobile-${i}`} review={review} />
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal
          variant="fade-up"
          delay={300}
          className="mt-6 hidden w-full md:block"
        >
          <ReviewsCarousel />
        </ScrollReveal>
        <ScrollReveal variant="fade-up" delay={450}>
          <div className="mt-12 md:mt-[52px] flex justify-center">
            <button
              type="button"
              onClick={handleChecklistCtaClick}
              className="h-10 w-[230px] rounded-[8px] bg-[var(--color-hero-cta-bg)] text-center text-[13px] font-semibold leading-[30px] tracking-[-0.04em] text-white [font-feature-settings:'liga'_off] md:h-[52px] md:w-[312px] md:rounded-[12px] md:text-[16px]"
            >
              체크리스트 작성 후 구독하러 가기
            </button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
