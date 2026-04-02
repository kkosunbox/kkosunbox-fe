"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import mockTempPackage from "@/widgets/home/package-plans/assets/mock-temp-package.png";
import { ChecklistRecommendModal } from "@/shared/ui";

const PACKAGES = [
  {
    tier: "Basic",
    colorVar: "var(--color-basic)",
    name: "베이직 패키지 BOX",
    items: ["100% 원물 프리미엄 져키", "인공 첨가물 0%", "이중 안심 포장"],
    price: "15,000원",
  },
  {
    tier: "Standard",
    colorVar: "var(--color-plus)",
    name: "스탠다드 패키지 BOX",
    items: ["베이직의 모든 구성 포함", "영양 강화 플러스 져키", "균형 잡힌 영양 설계"],
    price: "20,000원",
  },
  {
    tier: "Premium",
    colorVar: "var(--color-premium)",
    name: "프리미엄 패키지 BOX",
    items: ["휴먼그레이드 프리미엄 져키", "1:1 맞춤 큐레이션", "최상의 재료로 만든 패키지"],
    price: "25,000원",
  },
];

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

export default function SubscribePlansSection() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("kkosun_checklist_done") === "true";
    if (!done) setShowModal(true);
  }, []);

  function handleClose() {
    setShowModal(false);
  }

  function handleConfirm() {
    setShowModal(false);
    router.push("/checklist");
  }

  return (
    <>
      {showModal && <ChecklistRecommendModal onClose={handleClose} onConfirm={handleConfirm} />}

      <section className="bg-[var(--color-secondary)] py-16 md:py-20">
        <div className="mx-auto max-w-content px-6 md:px-0">
          {/* Hero text */}
          <div className="mb-10 text-center md:mb-12">
            <h1 className="text-[32px] font-extrabold leading-[1.3] tracking-[-0.04em] text-[var(--color-text)] md:text-[40px]">
              이제 수제 간식도
              <br />
              <span style={{ color: "var(--color-primary)" }}>맞춤형으로 구독하세요!</span>
            </h1>
            <p className="mt-4 text-[14px] leading-[1.6] text-[var(--color-text-warm)] md:text-[16px]">
              우리 강아지가 꼬순박스만 오면 현관문 앞에서 기다려요!
            </p>
          </div>

          {/* Package cards */}
          <div className="flex flex-col gap-5 md:grid md:grid-cols-3 md:gap-5">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.tier}
                className="flex flex-col rounded-[20px] bg-white px-6 pb-7 pt-5 shadow-sm"
              >
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

                <div className="mb-6 flex justify-center">
                  <Image
                    src={mockTempPackage}
                    alt={`${pkg.name} 이미지`}
                    className="h-[140px] w-auto object-contain md:h-[120px]"
                  />
                </div>

                <h2 className="mb-4 text-[22px] font-extrabold leading-[1.2] tracking-[-0.04em] text-[var(--color-text)] md:text-[20px]">
                  {pkg.name}
                </h2>

                <ul className="mb-6 flex flex-col gap-3">
                  {pkg.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[14px] font-medium leading-[1] text-[var(--color-text)]">
                      <CheckIcon color={pkg.colorVar} />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mb-5 mt-auto flex items-center justify-between border-t border-[var(--color-divider-warm)] pt-5">
                  <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">월 요금제</span>
                  <span className="text-[24px] font-extrabold leading-[1] tracking-[-0.04em]" style={{ color: pkg.colorVar }}>
                    {pkg.price}
                  </span>
                </div>

                <button
                  className="flex h-[52px] w-full items-center justify-center rounded-full text-[16px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
                  style={{ background: pkg.colorVar }}
                >
                  구독하기
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
