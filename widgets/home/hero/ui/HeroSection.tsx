"use client";

/* eslint-disable @next/next/no-img-element -- Hero는 대형 원본 해상도 유지가 필요해 Next/Image 미사용 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { openChecklistForm } from "@/shared/lib/checklistModal";
import heroCustomSnackBg from "../assets/hero-custom-snack-bg.webp";
import heroCustomSnackHeading from "../assets/hero-custom-snack-heading.svg";
import heroCustomSnackHeadingMobile from "../assets/hero-custom-snack-heading-mobile.svg";
import heroCustomSnackBgMobile from "../assets/hero-custom-snack-bg-mobile.webp";
import heroCustomSnackBgTablet from "../assets/hero-custom-snack-bg-tablet.webp";
import heroDogBg from "../assets/hero-dog-bg.webp";
import heroDogBgMobile from "../assets/hero-dog-bg-mobile.webp";
import heroDogBgTablet from "../assets/hero-dog-bg-tablet.webp";
import heroDogHeading from "../assets/hero-dog-heading.webp";
import heroDogHeadingMobile from "../assets/hero-dog-heading-mobile.webp";
import heroTruckHeading from "../assets/hero-truck-heading.webp";
import heroTruckHeadingMobile from "../assets/hero-truck-heading-mobile.webp";
import heroTruckImage from "../assets/hero-truck-image.webp";

const SLIDE_INTERVAL = 8000;
const DRAG_THRESHOLD = 50;

type HeroSlide = {
  id: string;
  type: "solid" | "photo" | "fullBg";
  bg?: string;
  bgImage?: string;
  mobileBgImage?: string;
  tabletBgImage?: string;
  headingImg: string;
  mobileHeadingImg: string;
  headingAlt: string;
  headingW: number;
  headingH: number;
  headingClass: string;
  subtext: string;
  tags: string;
  subtextClass?: string;
  tagsClass?: string;
  ctaBg?: string;
};

const slides: HeroSlide[] = [
  {
    id: "custom-snack",
    type: "fullBg",
    bgImage: heroCustomSnackBg.src,
    mobileBgImage: heroCustomSnackBgMobile.src,
    tabletBgImage: heroCustomSnackBgTablet.src,
    headingImg: heroCustomSnackHeading.src,
    mobileHeadingImg: heroCustomSnackHeadingMobile.src,
    headingAlt: "우리 아이를 위한 맞춤 건강간식",
    headingW: 333,
    headingH: 103,
    headingClass: "w-[333px] h-auto",
    subtext: "꼬순박스를 첫 구독하시는 분들께 드리는 혜택!",
    tags: "#꼬순박스맞춤간식, #우리아이 건강간식, #반려견간식",
    tagsClass:
      "font-medium text-[14px] leading-[17px] text-[var(--color-hero-third-tagline)]",
    ctaBg: "var(--color-hero-third-cta)",
  },
  {
    id: "truck",
    type: "solid",
    bg: "var(--color-hero-truck-bg)",
    headingImg: heroTruckHeading.src,
    mobileHeadingImg: heroTruckHeadingMobile.src,
    headingAlt: "매주 신선하게 정기배송",
    headingW: 558,
    headingH: 206,
    headingClass: "w-[282px] h-auto",
    subtext: "집에서 편하게 정기배송으로 받아보세요!",
    tags: "#꼬순박스정기배송 #신선배송 #반려견간식구독",
  },
  {
    id: "dog",
    type: "photo",
    bg: "var(--color-hero-bg)",
    mobileBgImage: heroDogBgMobile.src,
    tabletBgImage: heroDogBgTablet.src,
    headingImg: heroDogHeading.src,
    mobileHeadingImg: heroDogHeadingMobile.src,
    headingAlt: "강아지가 먼저 찾는 간식",
    headingW: 571,
    headingH: 203,
    headingClass: "w-[290px] h-auto",
    subtext: "먹는 순간 표정이 달라지는 휴먼그레이드 수제 간식 구독",
    tags: "#재구매율 91% #100% 국내산 수제 #알러지 맞춤 추천",
  },
];

export default function HeroSection() {
  const { isLoggedIn } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragRef = useRef({ startX: 0, isDrag: false });

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(advance, SLIDE_INTERVAL);
  }, [advance]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const goNext = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
    startTimer();
  }, [startTimer]);

  const goPrev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    startTimer();
  }, [startTimer]);

  function handlePointerDown(e: React.PointerEvent) {
    dragRef.current.isDrag = false;
    if ((e.target as Element).closest("button, a")) return;
    dragRef.current.startX = e.clientX;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (Math.abs(e.clientX - dragRef.current.startX) > 5) {
      dragRef.current.isDrag = true;
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!dragRef.current.isDrag) return;
    const delta = e.clientX - dragRef.current.startX;
    if (delta < -DRAG_THRESHOLD) goNext();
    else if (delta > DRAG_THRESHOLD) goPrev();
  }

  // 드래그 후 click 이벤트가 버블링되어 CTA 버튼 등이 실행되는 것을 방지
  function handleClickCapture(e: React.MouseEvent) {
    if (dragRef.current.isDrag) {
      e.stopPropagation();
      dragRef.current.isDrag = false;
    }
  }

  function handleCta() {
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
      className="overflow-hidden relative max-lg:h-[640px] lg:min-h-[644px] cursor-grab active:cursor-grabbing select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClickCapture={handleClickCapture}
    >
      {slides.map((slide, index) => {
        const isActive = index === current;
        return (
          <div
            key={slide.id}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
            style={slide.bg ? { background: slide.bg } : undefined}
          >
            {/* 배경 이미지 — <picture>로 breakpoint별 최적화 (모바일·태블릿·데스크탑 각 1장만 다운로드) */}
            {(slide.mobileBgImage || slide.bgImage || slide.type === "photo") && (
              <picture>
                {slide.mobileBgImage && (
                  <source media="(max-width: 767px)" srcSet={slide.mobileBgImage} />
                )}
                {slide.tabletBgImage && (
                  <source media="(max-width: 1199px)" srcSet={slide.tabletBgImage} />
                )}
                <img
                  src={slide.type === "photo" ? heroDogBg.src : (slide.bgImage ?? "")}
                  alt=""
                  className={[
                    "absolute inset-0 h-full w-full object-cover",
                    slide.type === "fullBg"
                      ? "max-lg:object-center lg:object-[70%_center]"
                      : "max-lg:object-[70%_center] lg:object-center",
                  ].join(" ")}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                />
              </picture>
            )}

            <div className="relative z-10 mx-auto max-w-content flex max-lg:flex-col lg:flex-row lg:items-center max-lg:px-5 lg:px-0 max-lg:pt-[82px] h-full lg:min-h-[644px]">
              {/* 좌측: 텍스트 */}
              <div className="flex flex-1 flex-col max-lg:items-center max-lg:text-center lg:items-start lg:text-left lg:pl-0">
                {/* 슬라이드별 마케팅 헤딩(이미지). 페이지의 시맨틱 h1은 page.tsx의 단일 h1이 담당하므로
                    캐러셀로 중복 생성되는 것을 막기 위해 div로 둔다. 텍스트는 각 img의 alt로 제공. */}
                <div className="max-lg:mb-[18px] lg:mb-6 lg:h-[110px] lg:overflow-hidden">
                  {/* 모바일 제목 이미지 (< 1200px) */}
                  <img
                    src={slide.mobileHeadingImg}
                    alt={slide.headingAlt}
                    className="lg:hidden h-[83px] w-auto"
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding="async"
                  />
                  {/* 데스크탑 제목 이미지 */}
                  <img
                    src={slide.headingImg}
                    alt={slide.headingAlt}
                    width={slide.headingW}
                    height={slide.headingH}
                    className={`max-lg:hidden ${slide.headingClass}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding="async"
                  />
                </div>
                <p
                  className={`max-lg:mb-1 lg:mb-3 lg:h-[30px] lg:overflow-hidden max-lg:h-[17px] max-lg:overflow-hidden max-lg:text-[14px] max-lg:leading-[17px] ${
                    slide.subtextClass ??
                    "max-lg:text-[14px] max-lg:font-medium lg:text-[20px] lg:font-medium text-[var(--color-hero-subtext)]"
                  }`}
                >
                  {slide.subtext}
                </p>
                <p
                  className={`max-lg:mb-[26px] lg:mb-[52px] lg:h-[24px] lg:overflow-hidden max-lg:h-[16px] max-lg:overflow-hidden max-lg:text-[13px] max-lg:leading-[16px] ${
                    slide.tagsClass ??
                    "text-[var(--color-hero-tagline)] max-lg:text-body-13-r lg:text-body-14-m"
                  }`}
                >
                  {slide.tags}
                </p>
                {slide.id === "custom-snack" && (
                  <Button
                    onClick={handleCta}
                    variant="primary"
                    size="lg"
                    style={{
                      background: "var(--color-cta-button)",
                      borderRadius: 8,
                    }}
                    className="lg:hidden text-white font-semibold tracking-[-0.04em] leading-[30px] whitespace-nowrap transition-opacity hover:opacity-90 max-lg:h-[40px] max-lg:w-[230px] max-lg:text-[13px]"
                  >
                    10초 진단하고 우리 아이 맞춤 추천 받기
                  </Button>
                )}
                <Button
                  onClick={handleCta}
                  variant="primary"
                  size="lg"
                  style={{
                    background: slide.ctaBg ?? "var(--color-cta-button)",
                    borderRadius: 12,
                  }}
                  className={[
                    "text-white font-semibold tracking-[-0.04em] leading-[30px] whitespace-nowrap transition-opacity hover:opacity-90 lg:h-[52px] lg:w-[282px] lg:text-[16px]",
                    slide.id === "custom-snack"
                      ? "max-lg:hidden"
                      : "max-lg:h-[40px] max-lg:w-[260px] max-lg:text-[13px]",
                  ].join(" ")}
                >
                  10초 진단하고 우리 아이 맞춤 추천 받기
                </Button>
              </div>

              {/* 우측: 트럭 이미지 (solid 슬라이드 전용) */}
              {slide.type === "solid" && (
                <div className="flex flex-1 items-center justify-center max-lg:mb-4 lg:py-10">
                  <img
                    src={heroTruckImage.src}
                    alt="꼬순박스 배송 트럭"
                    width={460}
                    height={380}
                    className="max-md:max-w-[220px] md:max-lg:w-[275px] md:max-lg:h-[216px] lg:max-w-[460px] w-full object-contain"
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
