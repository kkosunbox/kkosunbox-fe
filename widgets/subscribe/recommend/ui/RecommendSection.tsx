"use client";

import Image from "next/image";
import mockTempPackage from "@/widgets/home/package-plans/assets/mock-temp-package.png";
import doubleTwinkle from "../assets/double-twinkle.png";
import stamp from "../assets/stamp.png";

export type RecommendedTier = "basic" | "standard" | "premium";

const PACKAGES = [
  {
    id: "basic" as RecommendedTier,
    tier: "Basic",
    colorVar: "var(--color-basic)",
    name: "베이직 패키지 BOX",
    items: ["100% 원물 프리미엄 져키", "인공 첨가물 0%", "이중 안심 포장"],
    price: "15,000원",
    description: "기본에 충실한 베이직 패키지",
  },
  {
    id: "standard" as RecommendedTier,
    tier: "Standard",
    colorVar: "var(--color-plus)",
    name: "스탠다드 패키지 BOX",
    items: ["베이직의 모든 구성 포함", "영양 강화 플러스 져키", "균형 잡힌 영양 설계"],
    price: "20,000원",
    description: "균형 잡힌 영양을 담은 스탠다드 패키지",
  },
  {
    id: "premium" as RecommendedTier,
    tier: "Premium",
    colorVar: "var(--color-premium)",
    name: "프리미엄 패키지 BOX",
    items: ["휴먼그레이드 프리미엄 져키", "1:1 맞춤 큐레이션", "최상의 재료로 만든 패키지"],
    price: "25,000원",
    description: "꼭 필요한 영양만 꽉 채운 프리미엄 패키지",
  },
];

const TIER_LABEL: Record<RecommendedTier, string> = {
  basic: "베이직",
  standard: "스탠다드",
  premium: "프리미엄",
};

const TIER_DISPLAY: Record<RecommendedTier, string> = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium",
};

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0" aria-hidden="true">
      <circle cx="9" cy="9" r="8" style={{ fill: color }} />
      <path d="M6 9L8 11L12 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" className="shrink-0" aria-hidden="true">
      <circle cx="11" cy="11" r="10" stroke="var(--color-icon-muted)" strokeWidth="1.5" fill="none" />
      <path d="M11 10V15" stroke="var(--color-icon-muted)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="11" cy="7.5" r="1" fill="var(--color-icon-muted)" />
    </svg>
  );
}

function PetAvatarPlaceholder() {
  return (
    <div
      className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full text-[28px]"
      style={{ background: "var(--color-secondary)" }}
      aria-hidden="true"
    >
      🐶
    </div>
  );
}

interface RecommendSectionProps {
  recommendedTier: RecommendedTier;
  petName: string;
}

export default function RecommendSection({ recommendedTier, petName }: RecommendSectionProps) {
  const recommended = PACKAGES.find((p) => p.id === recommendedTier)!;

  return (
    <section className="bg-[var(--color-secondary)] py-16 md:py-20">
      <div className="mx-auto max-w-content px-6 md:px-0">

        {/* Hero text */}
        <div className="mb-10 text-center md:mb-12">
          <h1 className="text-[28px] font-extrabold leading-[1.35] tracking-[-0.04em] md:text-[36px]">
            <span style={{ color: "var(--color-primary)" }}>딱 맞는 패키지 BOX</span>
            <span className="text-[var(--color-text)]">를</span>
            <br />
            <span className="text-[var(--color-text)]">추천드립니다!</span>
          </h1>
        </div>

        {/* Recommendation card */}
        <div className="mb-8 rounded-2xl bg-white px-6 py-5 shadow-sm md:mb-10 md:px-8 md:py-6">
          <div className="flex items-center gap-4 md:gap-5">
            <PetAvatarPlaceholder />
            <div className="flex flex-col gap-2">
              <span
                className="w-fit rounded-full px-4 py-1 text-[13px] font-semibold leading-[1] text-white"
                style={{ background: recommended.colorVar }}
              >
                {TIER_DISPLAY[recommendedTier]}
              </span>
              <p className="text-[13px] leading-[1.7] text-[var(--color-text)] md:text-[15px]">
                체크리스트 분석 완료!{" "}
                <strong className="font-extrabold" style={{ color: "var(--color-primary)" }}>
                  {petName}
                </strong>
                에게 꼭 필요한 영양만 꽉 채운{" "}
                <strong className="font-bold">{TIER_LABEL[recommendedTier]} 패키지</strong>
                입니다.
              </p>
            </div>
          </div>
        </div>

        {/* Package cards */}
        <div className="flex flex-col gap-5 md:grid md:grid-cols-3 md:gap-5">
          {PACKAGES.map((pkg) => {
            const isRecommended = pkg.id === recommendedTier;
            return (
              <div
                key={pkg.tier}
                className="flex flex-col rounded-[20px] bg-white px-6 pb-7 pt-5 shadow-sm"
              >
                {/* Top row */}
                <div className="mb-5 flex items-center justify-between">
                  <span
                    className="rounded-full px-4 py-1 text-[14px] font-semibold leading-[1] text-white"
                    style={{ background: pkg.colorVar }}
                  >
                    {pkg.tier}
                  </span>
                  <button aria-label={`${pkg.tier} 패키지 상세 정보`} className="flex items-center justify-center">
                    <InfoIcon />
                  </button>
                </div>

                {/* Package image — recommended gets stamp overlay */}
                <div className="relative mb-6 flex justify-center">
                  <Image
                    src={mockTempPackage}
                    alt={`${pkg.name} 이미지`}
                    className="h-[140px] w-auto object-contain md:h-[120px]"
                  />
                  {isRecommended && (
                    <Image
                      src={stamp}
                      alt="BEST CHOICE 추천 스탬프"
                      className="absolute right-0 top-0 h-[72px] w-[72px] object-contain md:h-[80px] md:w-[80px]"
                    />
                  )}
                </div>

                {/* Package name — recommended gets double-star decoration */}
                <div className="relative mb-4">
                  {isRecommended && (
                    <Image
                      src={doubleTwinkle}
                      alt=""
                      aria-hidden
                      className="absolute -left-2 -top-5 h-[36px] w-[36px] object-contain md:h-[40px] md:w-[40px]"
                    />
                  )}
                  <h2 className="text-[22px] font-extrabold leading-[1.2] tracking-[-0.04em] text-[var(--color-text)] md:text-[20px]">
                    {pkg.name}
                  </h2>
                </div>

                {/* Feature list */}
                <ul className="mb-6 flex flex-col gap-3">
                  {pkg.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[14px] font-medium leading-[1] text-[var(--color-text)]">
                      <CheckIcon color={pkg.colorVar} />
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Price row */}
                <div className="mb-5 mt-auto flex items-center justify-between border-t border-[var(--color-divider-warm)] pt-5">
                  <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">월 요금제</span>
                  <span className="text-[24px] font-extrabold leading-[1] tracking-[-0.04em]" style={{ color: pkg.colorVar }}>
                    {pkg.price}
                  </span>
                </div>

                {/* Subscribe button */}
                <button
                  className="flex h-[52px] w-full items-center justify-center rounded-full text-[16px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
                  style={{ background: pkg.colorVar }}
                >
                  구독하기
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
