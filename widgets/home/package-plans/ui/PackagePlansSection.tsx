"use client";

import Image from "next/image";
import { Text } from "@/shared/ui";
import packagePlanTitle01 from "../assets/home-package-plans-title-01.png";
import mockTempPackage from "../assets/mock-temp-package.png";

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

export default function PackagePlansSection() {
  return (
    <section className="bg-[var(--color-secondary)] py-12 md:py-20">
      <div className="mx-auto max-w-content max-md:px-8 md:px-0">
        <h2 className="sr-only">원하는 패키지로 선택 후 구독하세요!</h2>
        <Image
          src={packagePlanTitle01}
          alt=""
          aria-hidden
          className="mx-auto h-full w-full object-cover md:max-h-[160px] max-md:max-w-[245px] md:max-w-[306px]"
        />
        <Text variant="subtitle-18-m" mobileVariant="body-14-m" className="mx-auto mb-7.5 mt-7 max-w-lg text-center text-[var(--color-text-warm)] max-md:leading-[20px]">
          설문조사 후 우리 아이에게 적절한 <br className="md:hidden" />패키지 박스를 추천받을 수 있습니다!
        </Text>

        <div className="max-md:flex max-md:flex-col-reverse md:grid md:grid-cols-3 gap-5">
          {PACKAGES.map((pkg, idx) => (
            <div
              key={pkg.tier}
              className="flex flex-col items-center rounded-[20px] px-6 pb-8 pt-6"
              style={{ background: pkg.cardBg }}
            >
              {/* Tier chip */}
              <span
                className="text-body-14-sb rounded-full px-3 py-1 text-white !leading-[1]"
                style={{ background: pkg.colorVar }}
              >
                {pkg.tier}
              </span>

              {/* Package image + Ms Madi label */}
              <div className="relative mb-5.5 flex h-[152px] w-full items-center justify-center">
                <Image
                  src={mockTempPackage}
                  alt={`${pkg.name} 이미지`}
                  className="h-[151px] w-auto object-contain"
                />
                <span
                  className={`absolute text-emoji-40 leading-[36px] tracking-[0.02em] capitalize ${
                    idx === 0 ? "-bottom-1.5 right-5" : "-bottom-4.5 right-0"
                  }`}
                  style={{
                    fontFamily: "var(--font-ms-madi)",
                    color: pkg.msMadiColor,
                    transform: `rotate(${pkg.rotate}deg)`,
                  }}
                >
                  {pkg.tierLabel}
                </span>
              </div>

              {/* Package name */}
              <h3
                className="mb-4 text-center text-display-28-eb capitalize"
                style={{ color: pkg.accentColor }}
              >
                {pkg.name}
              </h3>

              {/* Feature list */}
              <ul className="flex w-full flex-col gap-3 max-md:pl-9 md:pl-12">
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
          ))}
        </div>
      </div>
    </section>
  );
}
