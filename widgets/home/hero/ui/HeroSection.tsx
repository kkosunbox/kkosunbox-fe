"use client";

/* eslint-disable @next/next/no-img-element -- Hero는 대형 원본 해상도 유지가 필요해 Next/Image 미사용 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { openChecklistForm } from "@/shared/lib/checklistModal";
import heroThirdBg from "../assets/hero-main-background-third-ver.png";
import heroThirdHeading from "../assets/hero-catch-phrase-third-web.svg";
import heroThirdMobileBg from "../assets/hero-main-background-third-mobile-expanded.png";
import heroThirdTabletBg from "../assets/hero-main-background-third-tablet-expanded.png";
import heroMainMobileBg from "../assets/hero-main-background-mobile-expanded.png";
import heroMainTabletBg from "../assets/hero-main-background-tablet-expanded.png";
import heroDogTitleMobile01 from "../assets/hero-dog-title-mobile-01.png";
import heroDogTitleMobile02 from "../assets/hero-dog-title-mobile-02.png";
import heroDogTitleMobile03 from "../assets/hero-dog-title-mobile-03.png";

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
    bgImage: heroThirdBg.src,
    mobileBgImage: heroThirdMobileBg.src,
    tabletBgImage: heroThirdTabletBg.src,
    headingImg: heroThirdHeading.src,
    mobileHeadingImg: heroDogTitleMobile03.src,
    headingAlt: "우리 아이를 위한 맞춤 건강간식",
    headingW: 333,
    headingH: 103,
    headingClass: "w-[333px] h-auto",
    subtext: "꼬순박스를 첫 구독하시는 분들께 드리는 혜택!",
    tags: "#꼬순박스맞춤간식, #우리아이 건강간식, #반려견간식",
    subtextClass:
      "font-medium text-white max-lg:text-[14px] max-lg:leading-[17px] lg:text-[18px] lg:leading-[21px]",
    tagsClass:
      "font-medium text-[14px] leading-[17px] text-[var(--color-hero-third-tagline)]",
    ctaBg: "var(--color-hero-third-cta)",
  },
  {
    id: "truck",
    type: "solid",
    bg: "var(--color-hero-truck-bg)",
    headingImg: "/images/hero-truck-title.png",
    mobileHeadingImg: heroDogTitleMobile02.src,
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
    mobileBgImage: heroMainMobileBg.src,
    tabletBgImage: heroMainTabletBg.src,
    headingImg: "/images/hero-dog-title.png",
    mobileHeadingImg: heroDogTitleMobile01.src,
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
      className="overflow-hidden relative max-lg:h-[585px] lg:min-h-[537px] cursor-grab active:cursor-grabbing select-none"
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
            {/* 모바일 배경 이미지 (< 768px) */}
            {slide.mobileBgImage && (
              <img
                src={slide.mobileBgImage}
                alt=""
                className="md:hidden absolute inset-0 h-full w-full object-cover object-center"
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            )}

            {/* 태블릿 배경 이미지 (768-1199px) */}
            {slide.tabletBgImage && (
              <img
                src={slide.tabletBgImage}
                alt=""
                className="max-md:hidden lg:hidden absolute inset-0 h-full w-full object-cover object-center"
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            )}

            {/* 사진 배경 (데스크탑 전용) */}
            {slide.type === "photo" && (
              <img
                src="/images/hero-dog-hd.png"
                alt=""
                className="max-lg:hidden absolute inset-0 h-full w-full object-cover object-center"
                decoding="async"
              />
            )}

            {/* 풀 배경 이미지 (데스크탑 전용) */}
            {slide.type === "fullBg" && slide.bgImage && (
              <img
                src={slide.bgImage}
                alt=""
                className="max-lg:hidden absolute inset-0 h-full w-full object-cover object-[70%_center]"
                decoding="async"
              />
            )}

            <div className="relative z-10 mx-auto max-w-content flex max-lg:flex-col lg:flex-row lg:items-center max-lg:px-5 lg:px-0 max-lg:pt-[58px] h-full lg:min-h-[537px]">
              {/* 좌측: 텍스트 */}
              <div className="flex flex-1 flex-col max-lg:items-center max-lg:text-center lg:items-start lg:text-left lg:pl-0">
                <h1 className="max-lg:mb-4 lg:mb-6 lg:h-[110px] lg:overflow-hidden">
                  {/* 모바일 제목 이미지 (< 1200px) */}
                  <img
                    src={slide.mobileHeadingImg}
                    alt={slide.headingAlt}
                    className="lg:hidden h-[83px] w-auto"
                    loading={index === 0 ? "eager" : "lazy"}
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
                    decoding="async"
                  />
                </h1>
                <p
                  className={`max-lg:mb-2 lg:mb-3 lg:h-[30px] lg:overflow-hidden max-lg:h-[20px] max-lg:overflow-hidden max-lg:text-[14px] max-lg:leading-[20px] ${
                    slide.subtextClass ??
                    "max-lg:text-[14px] max-lg:font-medium lg:text-[20px] lg:font-medium text-[var(--color-hero-subtext)]"
                  }`}
                >
                  {slide.subtext}
                </p>
                <p
                  className={`max-lg:mb-6 lg:mb-[52px] lg:h-[24px] lg:overflow-hidden max-lg:h-[40px] max-lg:overflow-hidden max-lg:text-[13px] max-lg:leading-[20px] ${
                    slide.tagsClass ??
                    "text-[var(--color-hero-tagline)] max-lg:text-body-13-r lg:text-body-14-m"
                  }`}
                >
                  {slide.tags}
                </p>
                <Button
                  onClick={handleCta}
                  variant="primary"
                  size="lg"
                  style={{
                    background: slide.ctaBg ?? "var(--color-cta-button)",
                    borderRadius: 12,
                  }}
                  className="text-white font-semibold tracking-[-0.04em] leading-[30px] whitespace-nowrap transition-opacity hover:opacity-90 max-lg:h-[40px] max-lg:w-[260px] max-lg:text-[13px] lg:h-[52px] lg:w-[282px] lg:text-[16px]"
                >
                  10초 진단하고 우리 아이 맞춤 추천 받기
                </Button>
              </div>

              {/* 우측: 트럭 이미지 (solid 슬라이드 전용) */}
              {slide.type === "solid" && (
                <div className="flex flex-1 items-center justify-center max-lg:mb-4 lg:py-10">
                  <img
                    src="/images/hero-truck.png"
                    alt="꼬순박스 배송 트럭"
                    width={460}
                    height={380}
                    className="max-lg:max-w-[220px] lg:max-w-[460px] w-full object-contain"
                    loading="eager"
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
