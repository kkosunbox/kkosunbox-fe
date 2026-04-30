"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import { Text, ScrollReveal } from "@/shared/ui";
import packagePlansTitle02 from "../assets/home-package-plans-title-02.webp";
import packageImageBasic from "../assets/package-image-basic.png";
import packageImageStandard from "../assets/package-image-standard.png";
import packageImagePremium from "../assets/package-image-premium.png";

const PACKAGES = [
  {
    tier: "Basic",
    tierLabel: "Basic",
    colorVar: "var(--color-basic)",
    cardBg: "var(--color-card-basic)",
    msMadiColor: "var(--color-basic-light)",
    accentColor: "var(--color-basic)",
    rotate: 12,
    name: "베이직 패키지 BOX",
    image: packageImageBasic as StaticImageData,
    items: ["100% 원물 프리미엄 져키", "인공 첨가물 0%", "이중 안심 포장"],
  },
  {
    tier: "Standard",
    tierLabel: "Standard",
    colorVar: "var(--color-plus)",
    cardBg: "var(--color-card-standard)",
    msMadiColor: "var(--color-plus-light)",
    accentColor: "var(--color-plus)",
    rotate: 19,
    name: "스탠다드 패키지 BOX",
    image: packageImageStandard as StaticImageData,
    items: ["베이직의 모든 구성 포함", "영양 강화 플러스 져키", "균형 잡힌 영양 설계"],
  },
  {
    tier: "Premium",
    tierLabel: "Premium",
    colorVar: "var(--color-premium)",
    cardBg: "var(--color-card-premium)",
    msMadiColor: "var(--color-premium-light)",
    accentColor: "var(--color-accent-orange)",
    rotate: 15,
    name: "프리미엄 패키지 BOX",
    image: packageImagePremium as StaticImageData,
    items: ["휴먼그레이드 프리미엄 져키", "1:1 맞춤 큐레이션", "최상의 재료로 만든 패키지"],
  },
];

const SIDE_OFFSET = 348;
const AUTO_ROTATE_MS = 10000;
const ACTIVE_VISUAL_DELAY_MS = 140;

function CheckIcon({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      className="shrink-0"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" style={{ fill: color }} />
      <path
        d="M5.5 8L7.2 9.7L10.5 6.3"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function PackageCard({
  pkg,
  isActive,
}: {
  pkg: (typeof PACKAGES)[number];
  isActive: boolean;
}) {
  return (
    <div
      className={[
        "flex flex-col rounded-[20px] overflow-hidden transition-[height,width,transform] duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        isActive
          ? "max-md:h-[490px] md:h-[522px] max-md:w-full md:w-[375px]"
          : "h-[419px] w-[280px]",
      ].join(" ")}
      style={{
        background: pkg.cardBg,
        transform: isActive ? "scale(1)" : "scale(0.985)",
      }}
    >
      {/* 이미지 영역 */}
      <div
        className={[
          "relative w-full shrink-0 overflow-hidden transition-[height] duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          isActive ? "max-md:h-[303px] md:h-[348px]" : "h-[260px]",
        ].join(" ")}
      >
        <Image
          src={pkg.image}
          alt={`${pkg.name} 이미지`}
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 327px, 380px"
        />
        {/* 티어 뱃지 */}
        <span
          className="absolute top-4 left-1/2 -translate-x-1/2 text-body-14-sb rounded-full px-3 py-1 text-white !leading-[1] whitespace-nowrap"
          style={{ background: pkg.colorVar }}
        >
          {pkg.tier}
        </span>
      </div>

      {/* 텍스트 영역 */}
      <div className="relative flex flex-1 flex-col items-center px-6 pt-5 pb-7 overflow-hidden">
        {/* Ms Madi 워터마크 */}
        <span
          className={[
            "pointer-events-none absolute bottom-5 right-4 leading-[36px] tracking-[0.02em] capitalize opacity-50",
            isActive ? "text-[36px]" : "text-[32px]",
          ].join(" ")}
          style={{
            fontFamily: "var(--font-ms-madi)",
            color: pkg.accentColor,
            transform: `rotate(${pkg.rotate}deg)`,
          }}
        >
          {pkg.tierLabel}
        </span>

        <h3
          className={[
            "text-center capitalize tracking-[-0.04em] transition-[font-size,line-height,margin-bottom] duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            isActive
              ? "mb-4 text-[24px] leading-[29px] font-extrabold"
              : "mb-3 text-[20px] leading-[24px] font-extrabold",
          ].join(" ")}
          style={{ color: pkg.accentColor }}
        >
          {pkg.name}
        </h3>

        <div className="flex w-full justify-center">
          <ul className="flex w-fit flex-col items-start gap-[13px]">
            {pkg.items.map((item) => (
              <li
                key={item}
                className={[
                  "flex items-center gap-2 text-left text-black !leading-[1]",
                  isActive ? "text-body-16-m" : "text-body-14-m",
                ].join(" ")}
              >
                <CheckIcon color={pkg.accentColor} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function PackagePlansSection() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [visualActiveIndex, setVisualActiveIndex] = useState(1);
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);
  const total = PACKAGES.length;
  const autoRotateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeVisualTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getRelativeOffset = (index: number) => {
    const raw = (index - activeIndex + total) % total;
    return raw > total / 2 ? raw - total : raw;
  };

  const clearAutoRotateTimer = useCallback(() => {
    if (autoRotateTimerRef.current) {
      clearTimeout(autoRotateTimerRef.current);
      autoRotateTimerRef.current = null;
    }
  }, []);

  const clearActiveVisualTimer = useCallback(() => {
    if (activeVisualTimerRef.current) {
      clearTimeout(activeVisualTimerRef.current);
      activeVisualTimerRef.current = null;
    }
  }, []);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const scheduleAutoRotate = useCallback(() => {
    clearAutoRotateTimer();
    autoRotateTimerRef.current = setTimeout(() => {
      goToNext();
    }, AUTO_ROTATE_MS);
  }, [clearAutoRotateTimer, goToNext]);

  const handleIndicatorClick = (index: number) => {
    setActiveIndex(index);
    scheduleAutoRotate();
  };

  useEffect(() => {
    if (isAutoPlayPaused) {
      clearAutoRotateTimer();
      return;
    }
    scheduleAutoRotate();
    return clearAutoRotateTimer;
  }, [activeIndex, isAutoPlayPaused, scheduleAutoRotate, clearAutoRotateTimer]);

  useEffect(() => {
    clearActiveVisualTimer();
    activeVisualTimerRef.current = setTimeout(() => {
      setVisualActiveIndex(activeIndex);
    }, ACTIVE_VISUAL_DELAY_MS);

    return clearActiveVisualTimer;
  }, [activeIndex, clearActiveVisualTimer]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsAutoPlayPaused(document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <section className="bg-white py-12 md:pt-[68px] md:pb-12">
      <div className="mx-auto max-w-content max-md:px-8 md:px-0">
        <ScrollReveal variant="fade-up">
          <Image
            src={packagePlansTitle02}
            alt="원하는 패키지로 선택 후 구독하세요!"
            className="mx-auto h-auto w-full max-w-[215px] md:max-w-[306px]"
          />
        </ScrollReveal>
        <ScrollReveal variant="fade-up" delay={150}>
          <Text variant="subtitle-18-m" mobileVariant="body-14-m" className="mx-auto mb-7 md:mb-11 mt-4 md:mt-9 max-w-lg text-center text-[var(--color-text-warm)] max-md:leading-[20px]">
            설문조사 후 우리 아이에게 적절한 <br className="md:hidden" />패키지 박스를 추천받을 수 있습니다!
          </Text>
        </ScrollReveal>

        {/* 모바일 - 단일 카드 */}
        <ScrollReveal variant="scale-in" delay={300} className="md:hidden">
          <div className="mx-auto w-full max-w-[327px]">
            <PackageCard pkg={PACKAGES[activeIndex]} isActive />
          </div>
        </ScrollReveal>

        {/* 데스크톱 - 3카드 캐러셀 */}
        <ScrollReveal
          variant="scale-in"
          delay={300}
          as="div"
          className="relative mx-auto h-[522px] w-full max-w-[1012px] max-md:hidden"
        >
          <div
            className="h-full w-full"
            onMouseEnter={() => setIsAutoPlayPaused(true)}
            onMouseLeave={() => setIsAutoPlayPaused(false)}
          >
            {PACKAGES.map((pkg, index) => {
              const offset = getRelativeOffset(index);
              const isCentered = offset === 0;
              const isVisuallyActive = visualActiveIndex === index;

              return (
                <div
                  key={pkg.tier}
                  className="absolute left-1/2 top-0 will-change-transform transition-[transform] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                  style={{
                    transform: `translate3d(calc(-50% + ${offset * SIDE_OFFSET}px), ${
                      isCentered ? 0 : 64
                    }px, 0)`,
                    zIndex: isCentered ? 20 : 10 - Math.abs(offset),
                  }}
                >
                  <PackageCard pkg={pkg} isActive={isVisuallyActive} />
                </div>
              );
            })}
          </div>
        </ScrollReveal>

        {/* 캐러셀 인디케이터 */}
        <div className="mt-7.5 flex items-center justify-center gap-3">
          {PACKAGES.map((pkg, index) => (
            <button
              key={pkg.tier}
              type="button"
              aria-label={`${pkg.tier} 패키지 보기`}
              aria-pressed={activeIndex === index}
              onClick={() => handleIndicatorClick(index)}
              className="h-3 w-3 rounded-full transition-colors duration-300"
              style={{
                background:
                  activeIndex === index ? pkg.accentColor : "var(--color-text-muted)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
