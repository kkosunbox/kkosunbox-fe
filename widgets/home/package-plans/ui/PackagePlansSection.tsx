"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Text } from "@/shared/ui";
import mockTempPackage from "../assets/mock-temp-package.png";
import packagePlansTitle02 from "../assets/home-package-plans-title-02.png";

const PACKAGES = [
  {
    tier: "Basic",
    tierLabel: "basic",
    colorVar: "var(--color-basic)",
    cardBg: "var(--color-card-basic)",
    msMadiColor: "var(--color-basic-light)",
    accentColor: "var(--color-basic)",
    rotate: 10,
    name: "베이직 패키지 BOX",
    items: ["100% 위생 프리미엄 져키", "인공 첨가물 0%", "이유 안심 포장"],
  },
  {
    tier: "Standard",
    tierLabel: "standard",
    colorVar: "var(--color-plus)",
    cardBg: "var(--color-card-standard)",
    msMadiColor: "var(--color-plus-light)",
    accentColor: "var(--color-plus)",
    rotate: 12,
    name: "스탠다드 패키지 BOX",
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
    items: ["휴먼그레이드 프리미엄 져키", "1:1 맞춤 큐레이션", "최상의 재료로 만든 패키지"],
  },
];

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
  idx,
  isActive,
}: {
  pkg: (typeof PACKAGES)[number];
  idx: number;
  isActive: boolean;
}) {
  return (
    <div
      className={[
        "flex flex-col items-center rounded-[20px] px-6 transition-all duration-500 ease-in-out",
        isActive ? "pt-6 md:pt-12" : "pt-6",
        isActive ? "h-[446px] w-[375px] pb-9" : "h-[374px] w-[280px] pb-8",
      ].join(" ")}
      style={{ background: pkg.cardBg }}
    >
      <span
        className="text-body-14-sb rounded-full px-3 py-1 text-white !leading-[1]"
        style={{ background: pkg.colorVar }}
      >
        {pkg.tier}
      </span>

      <div
        className={[
          "relative mb-5.5 flex w-full items-center justify-center",
          isActive ? "h-[171px]" : "h-[152px]",
        ].join(" ")}
      >
        <Image
          src={mockTempPackage}
          alt={`${pkg.name} 이미지`}
          className={[
            "w-auto object-contain transition-all duration-500 ease-in-out",
            isActive ? "h-[151px]" : "h-[130px]",
          ].join(" ")}
        />
        <span
          className={[
            "absolute text-emoji-40 leading-[36px] tracking-[0.02em] capitalize",
            idx === 0 ? "-bottom-1.5 right-5" : "-bottom-4.5 right-0",
          ].join(" ")}
          style={{
            fontFamily: "var(--font-ms-madi)",
            color: pkg.msMadiColor,
            transform: `rotate(${pkg.rotate}deg)`,
          }}
        >
          {pkg.tierLabel}
        </span>
      </div>

      <h3
        className={[
          "mb-4 text-center capitalize tracking-[-0.04em]",
          isActive ? "text-[28px] leading-[33px] font-extrabold" : "text-[20px] leading-[24px] font-extrabold",
        ].join(" ")}
        style={{ color: pkg.accentColor }}
      >
        {pkg.name}
      </h3>

      <ul className="flex w-full flex-col gap-3 max-md:pl-9 md:pl-6">
        {pkg.items.map((item) => (
          <li
            key={item}
            className="text-body-14-m flex items-center gap-2 text-black !leading-[1]"
          >
            <CheckIcon color={pkg.accentColor} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PackagePlansSection() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);
  const total = PACKAGES.length;
  const sideOffset = 348;
  const autoRotateMs = 10000;
  const autoRotateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const scheduleAutoRotate = useCallback(() => {
    clearAutoRotateTimer();
    autoRotateTimerRef.current = setTimeout(() => {
      goToNext();
    }, autoRotateMs);
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
    const handleVisibilityChange = () => {
      setIsAutoPlayPaused(document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <section className="bg-white py-12 md:pt-[68px] md:pb-12">
      <div className="mx-auto max-w-content max-md:px-8 md:px-0">
        <Image
          src={packagePlansTitle02}
          alt="원하는 패키지로 선택 후 구독하세요!"
          className="mx-auto h-auto w-full max-w-[260px] md:max-w-[306px]"
        />
        <Text variant="subtitle-18-m" mobileVariant="body-14-m" className="mx-auto mb-7.5 md:mb-11 mt-7 max-w-lg text-center text-[var(--color-text-warm)] max-md:leading-[20px]">
          설문조사 후 우리 아이에게 적절한 <br className="md:hidden" />패키지 박스를 추천받을 수 있습니다!
        </Text>

        <div className="md:hidden">
          <div className="mx-auto w-full max-w-[375px]">
            <PackageCard pkg={PACKAGES[activeIndex]} idx={activeIndex} isActive />
          </div>
        </div>

        <div
          className="relative mx-auto hidden h-[446px] w-full max-w-[1012px] md:block"
          onMouseEnter={() => setIsAutoPlayPaused(true)}
          onMouseLeave={() => setIsAutoPlayPaused(false)}
        >
          {PACKAGES.map((pkg, index) => {
            const offset = getRelativeOffset(index);
            const isActive = offset === 0;
            return (
            <div
              key={pkg.tier}
              className="absolute left-1/2 top-0 -translate-x-1/2 transition-all duration-500 ease-in-out"
              style={{
                left: `calc(50% + ${offset * sideOffset}px)`,
                top: isActive ? 0 : 36,
                zIndex: isActive ? 20 : 10 - Math.abs(offset),
              }}
            >
              <PackageCard pkg={pkg} idx={index} isActive={isActive} />
            </div>
            );
          })}
        </div>

        {/* 캐러셀 인디케이터 */}
        <div className="mt-8 flex items-center justify-center gap-3">
          {PACKAGES.map((pkg, index) => (
            <button
              key={pkg.tier}
              type="button"
              aria-label={`${pkg.tier} 패키지 보기`}
              aria-pressed={activeIndex === index}
              onClick={() => handleIndicatorClick(index)}
              className={[
                "h-3 w-3 rounded-full transition-colors duration-300",
                activeIndex === index ? "bg-[var(--color-accent)]" : "bg-[var(--color-text-muted)]",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
