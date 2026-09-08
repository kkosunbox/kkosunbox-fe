"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircleIcon } from "@/shared/ui";
import { MEDIA_LG_MIN, MEDIA_MD_MIN } from "@/shared/config/breakpoints";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import {
  PACKAGES,
  PackageNutritionGuide,
  resolveRecommendedPlanIds,
  tierFromSubscriptionPlan,
  type PackageTier,
} from "@/entities/package";
import type { SubscriptionPlanDto } from "@/features/subscription/api";
import { planDisplayPrice } from "@/features/subscription/lib/planDisplayPrice";
import { trackSelectItem } from "@/shared/lib/analytics";
import basicImage from "../assets/package-image-basic.webp";
import standardImage from "../assets/package-image-standard.webp";
import premiumImage from "../assets/package-image-premium.webp";

const HOME_PLAN_ORDER: PackageTier[] = ["Basic", "Standard", "Premium"];
const HOME_PLAN_CAROUSEL = [-1, 0, 1].flatMap((group) =>
  HOME_PLAN_ORDER.map((tier) => ({ group, tier })),
);

const HOME_PLAN_IMAGES = {
  Basic: basicImage,
  Standard: standardImage,
  Premium: premiumImage,
} satisfies Record<PackageTier, typeof basicImage>;

const HOME_PLAN_FEATURES: Record<PackageTier, readonly string[]> = {
  Basic: ["100% 원물 프리미엄 져키", "인공 첨가물 0%", "이중 안심 포장"],
  Standard: ["베이직의 모든 구성 포함", "영양 강화 플러스 져키", "균형 잡힌 영양 설계"],
  Premium: ["특별한 날을 위한 최고급 구성", "고급 재료 프리미엄 간식", "맞춤 구성 + 화식 포함"],
};

function formatPrice(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

interface HomePlanCardsProps {
  plans: SubscriptionPlanDto[];
  plansReady: boolean;
}

function CarouselArrow({
  direction,
  onClick,
}: {
  direction: "previous" | "next";
  onClick: () => void;
}) {
  const isPrevious = direction === "previous";

  return (
    <button
      type="button"
      aria-label={isPrevious ? "이전 요금제" : "다음 요금제"}
      onClick={onClick}
      className={`absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[var(--shadow-card-soft)] lg:hidden ${
        isPrevious ? "max-md:left-2 md:-left-14" : "max-md:right-2 md:-right-14"
      }`}
    >
      <svg
        width="14"
        height="24"
        viewBox="0 0 14 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d={isPrevious ? "M12 2L2 12L12 22" : "M2 2L12 12L2 22"}
          stroke="var(--color-text-secondary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function HomePlanCards({ plans, plansReady }: HomePlanCardsProps) {
  const router = useRouter();
  const carouselRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(4);
  const scrollEndTimerRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(4);
  const recommendedPlanIds = resolveRecommendedPlanIds(plans);

  const scrollToCard = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const carousel = carouselRef.current;
    const card = carousel?.children[index] as HTMLElement | undefined;
    if (!carousel || !card) return;

    carousel.scrollTo({
      left: card.offsetLeft - (carousel.clientWidth - card.offsetWidth) / 2,
      behavior,
    });
    activeIndexRef.current = index;
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const desktopQuery = window.matchMedia(MEDIA_LG_MIN);
    const tabletQuery = window.matchMedia(MEDIA_MD_MIN);
    const centerActiveCard = () => {
      if (desktopQuery.matches) return;
      const currentCard = carousel.children[activeIndexRef.current] as HTMLElement | undefined;
      const normalizedIndex = currentCard?.offsetWidth
        ? activeIndexRef.current
        : HOME_PLAN_ORDER.length + (activeIndexRef.current % HOME_PLAN_ORDER.length);
      scrollToCard(normalizedIndex, "auto");
    };
    const handleScroll = () => {
      if (desktopQuery.matches) return;
      const carouselCenter = carousel.scrollLeft + carousel.clientWidth / 2;
      const cards = (Array.from(carousel.children) as HTMLElement[])
        .map((card, index) => ({ card, index }))
        .filter(({ card }) => card.offsetWidth > 0);
      const closest = cards.reduce((current, candidate) => {
        const cardCenter = candidate.card.offsetLeft + candidate.card.offsetWidth / 2;
        const closestCenter = current.card.offsetLeft + current.card.offsetWidth / 2;
        return Math.abs(cardCenter - carouselCenter) < Math.abs(closestCenter - carouselCenter)
          ? candidate
          : current;
      });
      activeIndexRef.current = closest.index;
      setActiveIndex(closest.index);

      if (tabletQuery.matches) {
        if (scrollEndTimerRef.current !== null) window.clearTimeout(scrollEndTimerRef.current);
        scrollEndTimerRef.current = window.setTimeout(() => {
          const currentIndex = activeIndexRef.current;
          if (currentIndex < HOME_PLAN_ORDER.length) {
            scrollToCard(currentIndex + HOME_PLAN_ORDER.length, "auto");
          } else if (currentIndex >= HOME_PLAN_ORDER.length * 2) {
            scrollToCard(currentIndex - HOME_PLAN_ORDER.length, "auto");
          }
        }, 120);
      }
    };

    centerActiveCard();
    carousel.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", centerActiveCard);
    return () => {
      carousel.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", centerActiveCard);
      if (scrollEndTimerRef.current !== null) window.clearTimeout(scrollEndTimerRef.current);
    };
  }, [scrollToCard]);

  const moveCarousel = (direction: -1 | 1) => {
    const isTablet = window.matchMedia(MEDIA_MD_MIN).matches;
    let nextIndex = isTablet
      ? activeIndex + direction
      : HOME_PLAN_ORDER.length +
        ((activeIndex - HOME_PLAN_ORDER.length + direction + HOME_PLAN_ORDER.length) %
          HOME_PLAN_ORDER.length);
    if (nextIndex < 0) nextIndex += HOME_PLAN_ORDER.length;
    if (nextIndex >= HOME_PLAN_CAROUSEL.length) nextIndex -= HOME_PLAN_ORDER.length;
    scrollToCard(nextIndex);
  };

  return (
    <div className="relative max-lg:mx-auto max-lg:max-w-[948px] max-md:w-full md:max-lg:w-[calc(100%-112px)]">
      <div
        ref={carouselRef}
        aria-label="구독 요금제"
        className="mx-auto max-lg:flex max-lg:w-full max-lg:snap-x max-lg:snap-mandatory max-lg:items-end max-lg:gap-5 max-lg:overflow-x-auto max-lg:px-[calc(50%-150px)] max-lg:pb-5 max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden lg:grid lg:w-[1061px] lg:grid-cols-3 lg:items-end lg:gap-10"
      >
      {HOME_PLAN_CAROUSEL.map(({ group, tier }) => {
        const pkg = PACKAGES.find((item) => item.tier === tier)!;
        const plan = plans.find((item) => tierFromSubscriptionPlan(item) === tier);
        const price = plan ? planDisplayPrice(plan) : null;
        const isRecommended = plan
          ? recommendedPlanIds.has(plan.id)
          : tier === "Standard";

        return (
          <article
            key={`${group}-${tier}`}
            aria-labelledby={`home-plan-${group}-${tier}`}
            className={`relative shrink-0 snap-center rounded-[20px] max-lg:w-[300px] lg:w-[327px] ${
              group === 0 ? "" : "max-md:hidden lg:hidden"
            } ${
              isRecommended
                ? "max-lg:h-[582px] lg:h-[604px] bg-[var(--color-cta-button)] pt-[34px] shadow-[var(--shadow-card-selected)]"
                : "max-lg:h-[548px] lg:h-[570px] bg-white shadow-[var(--shadow-card-soft)]"
            }`}
          >
            {isRecommended ? (
              <div className="absolute inset-x-0 top-0 flex h-[34px] items-center justify-center text-[14px] font-bold leading-[22px] tracking-[-0.02em] text-white">
                인기 PICK 🌟
              </div>
            ) : null}

            <div
              className={`flex h-full flex-col overflow-hidden rounded-[20px] ${
                isRecommended
                  ? "border-2 border-[var(--color-cta-button)] bg-[linear-gradient(180deg,var(--color-accent-orange-light)_43%,white_78%)]"
                  : "bg-white"
              }`}
            >
              <div className="relative aspect-[327/251] w-full shrink-0 overflow-hidden rounded-t-[18px]">
                <Image
                  src={HOME_PLAN_IMAGES[tier]}
                  alt={`${pkg.name} 대표 이미지`}
                  fill
                  quality={HIGH_IMAGE_QUALITY}
                  className="object-cover"
                  sizes="(min-width: 1200px) 327px, 300px"
                />
                <PackageNutritionGuide initialTier={tier} bubbleClassName="hidden" />
              </div>

              <div className="flex min-h-0 flex-1 flex-col px-7 pt-5 pb-[26px]">
                <h3
                  id={`home-plan-${group}-${tier}`}
                  className="text-[20px] font-bold leading-6 tracking-[-0.04em] text-[var(--color-text)]"
                >
                  {pkg.name}
                </h3>

                <ul className="mt-4 flex flex-col gap-[10px]">
                  {HOME_PLAN_FEATURES[tier].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-[13px] font-medium leading-4 text-[var(--color-text)]"
                    >
                      <CheckCircleIcon color={pkg.colorVar} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex min-h-[50px] items-center justify-between gap-4">
                  <span className="text-[16px] font-bold leading-[19px] tracking-[-0.05em] text-[var(--color-text-body-warm)]">
                    월 요금제
                  </span>
                  {price ? (
                    <div className="flex flex-col items-end">
                      {price.strikePrice ? (
                        <div className="flex items-center gap-2 text-[16px] font-semibold leading-[19px] tracking-[-0.05em]">
                          {price.discountPct ? (
                            <span className="text-[var(--color-text-discount)]">
                              {price.discountPct}%
                            </span>
                          ) : null}
                          <span className="text-[var(--color-text-secondary)] line-through">
                            {formatPrice(price.strikePrice)}
                          </span>
                        </div>
                      ) : null}
                      <strong className="text-[20px] font-extrabold leading-6 tracking-[-0.05em] text-[var(--color-text-price)]">
                        {formatPrice(price.price)}
                      </strong>
                    </div>
                  ) : (
                    <div
                      className={`h-10 w-[100px] rounded-lg bg-[var(--color-surface-light)] ${
                        plansReady ? "" : "animate-pulse"
                      }`}
                      aria-label={plansReady ? "판매 준비 중" : "요금 불러오는 중"}
                    />
                  )}
                </div>

                <button
                  type="button"
                  disabled={!plan}
                  onClick={() => {
                    if (!plan) return;
                    trackSelectItem({ plan_tier: plan.name });
                    router.push(`/subscribe/detail?planId=${plan.id}`);
                  }}
                  className="mt-[22px] flex h-12 w-full items-center justify-center rounded-[12px] bg-[var(--color-cta-button)] text-[16px] font-semibold leading-6 tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  상세보기
                </button>
              </div>
            </div>
          </article>
        );
      })}
      </div>
      <CarouselArrow direction="previous" onClick={() => moveCarousel(-1)} />
      <CarouselArrow direction="next" onClick={() => moveCarousel(1)} />
    </div>
  );
}
