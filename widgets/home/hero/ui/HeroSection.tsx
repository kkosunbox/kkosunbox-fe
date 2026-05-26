"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";

const SLIDE_INTERVAL = 8000;

const slides = [
  {
    id: "truck",
    type: "solid" as const,
    bg: "var(--color-hero-truck-bg)",
    headingImg: "/images/hero-truck-title.png",
    headingAlt: "매주 신선하게 정기배송",
    headingW: 558,
    headingH: 206,
    headingClass: "max-lg:w-[160px] lg:w-[282px] h-auto",
    subtext: "집에서 편하게 정기배송으로 받아보세요!",
    tags: "#꼬순박스정기배송 #신선배송 #반려견간식구독",
  },
  {
    id: "dog",
    type: "photo" as const,
    bg: "var(--color-hero-bg)",
    headingImg: "/images/hero-dog-title.png",
    headingAlt: "강아지가 먼저 찾는 간식",
    headingW: 571,
    headingH: 203,
    headingClass: "max-lg:w-[164px] lg:w-[290px] h-auto",
    subtext: "먹는 순간 표정이 달라지는 휴먼그레이드 수제 간식 구독",
    tags: "#재구매율 91% #100% 국내산 수제 #알러지 맞춤 추천",
  },
] as const;

export default function HeroSection() {
  const { isLoggedIn } = useAuth();
  const { profile, profiles } = useProfile();
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const id = setInterval(advance, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [advance]);

  function handleCta() {
    if (isLoggedIn && profiles.length > 0) {
      const hasChecklist = (profile?.checklistAnswers?.length ?? 0) > 0;
      if (hasChecklist) {
        router.push("/checklist/result");
      } else {
        window.dispatchEvent(new CustomEvent("ggosoon:open-checklist-form"));
      }
      return;
    }
    window.dispatchEvent(new CustomEvent("ggosoon:show-profile-widget"));
  }

  return (
    <section className="overflow-hidden relative max-lg:min-h-[420px] lg:min-h-[537px]">
      {slides.map((slide, index) => {
        const isActive = index === current;
        return (
          <div
            key={slide.id}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
            style={{ background: slide.bg }}
          >
            {/* 슬라이드 2: 전체 배경 사진 */}
            {slide.type === "photo" && (
              <Image
                src="/images/hero-dog-hd.png"
                alt=""
                fill
                className="object-cover object-center"
                priority={false}
              />
            )}

            {/* 모바일 텍스트 가독성 보조 오버레이 */}
            {slide.type === "photo" && (
              <div className="absolute inset-0 lg:hidden" style={{ background: "rgba(255,248,240,0.45)" }} />
            )}

            <div className="relative z-10 mx-auto max-w-content flex max-lg:flex-col lg:flex-row lg:items-center max-lg:px-5 lg:px-0 max-lg:py-10 h-full lg:min-h-[537px]">
              {/* 좌측: 텍스트 */}
              <div className="flex flex-1 flex-col max-lg:items-center max-lg:text-center lg:items-start lg:text-left max-lg:order-2 lg:order-1 lg:pl-20">
                <h1 className="max-lg:mb-3 lg:mb-4">
                  <Image
                    src={slide.headingImg}
                    alt={slide.headingAlt}
                    width={slide.headingW}
                    height={slide.headingH}
                    className={slide.headingClass}
                    priority={index === 0}
                  />
                </h1>
                <p className="max-lg:text-[14px] max-lg:font-medium lg:text-[20px] lg:font-medium text-[var(--color-hero-subtext)] max-lg:mb-2 lg:mb-3">
                  {slide.subtext}
                </p>
                <p className="text-[var(--color-hero-tagline)] max-lg:text-body-13-r lg:text-body-14-m max-lg:mb-6 lg:mb-[52px]">
                  {slide.tags}
                </p>
                <Button
                  onClick={handleCta}
                  variant="primary"
                  size="lg"
                  style={{ background: "var(--color-cta-button)", borderRadius: 12 }}
                  className="text-white font-semibold tracking-[-0.04em] leading-[30px] whitespace-nowrap transition-opacity hover:opacity-90 max-lg:h-[40px] max-lg:w-[260px] max-lg:text-[13px] lg:h-[52px] lg:w-[282px] lg:text-[16px]"
                >
                  10초 진단하고 우리 아이 맞춤 추천 받기
                </Button>
              </div>

              {/* 우측: 트럭 이미지 (슬라이드 1 전용) */}
              {slide.type === "solid" && (
                <div className="flex flex-1 items-center justify-center max-lg:order-1 lg:order-2 max-lg:mb-4 lg:py-10">
                  <Image
                    src="/images/hero-truck.png"
                    alt="꼬순박스 배송 트럭"
                    width={460}
                    height={380}
                    className="max-lg:max-w-[220px] lg:max-w-[460px] w-full object-contain"
                    priority
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
