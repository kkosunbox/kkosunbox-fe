"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import mockTempPackage from "@/widgets/home/package-plans/assets/mock-temp-package.png";

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
      <circle cx="11" cy="11" r="10" stroke="#CCCCCC" strokeWidth="1.5" fill="none" />
      <path d="M11 10V15" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="11" cy="7.5" r="1" fill="#CCCCCC" />
    </svg>
  );
}

function PawIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <ellipse cx="20" cy="26" rx="8" ry="6.5" fill="var(--color-primary)" />
      <ellipse cx="11" cy="18" rx="3.2" ry="4" fill="var(--color-primary)" />
      <ellipse cx="16.5" cy="14" rx="3.2" ry="4" fill="var(--color-primary)" />
      <ellipse cx="23.5" cy="14" rx="3.2" ry="4" fill="var(--color-primary)" />
      <ellipse cx="29" cy="18" rx="3.2" ry="4" fill="var(--color-primary)" />
    </svg>
  );
}

function ChecklistModal({ onConfirm, onDismiss }: { onConfirm: () => void; onDismiss: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-5"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-[360px] rounded-2xl bg-white px-7 py-8 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex justify-center">
          <PawIcon />
        </div>
        <h2 className="mb-2 text-[18px] font-extrabold tracking-[-0.03em] text-[var(--color-text)]">
          맞춤 패키지 추천받기
        </h2>
        <p className="mb-7 text-[14px] leading-[1.7] text-[var(--color-text-secondary)]">
          체크리스트를 작성해서
          <br />
          맞춤형 제안을 받아보시겠어요?
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onDismiss}
            className="flex h-[48px] flex-1 items-center justify-center rounded-full border border-[var(--color-divider-warm)] text-[14px] font-semibold text-[var(--color-text-secondary)] transition-opacity hover:opacity-80"
          >
            다음에 하기
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-[48px] flex-1 items-center justify-center rounded-full text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--color-accent)" }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubscribePlansSection() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("kkosun_checklist_done") === "true";
    if (!done) setShowModal(true);
  }, []);

  function handleConfirm() {
    setShowModal(false);
    router.push("/checklist");
  }

  function handleDismiss() {
    localStorage.setItem("kkosun_checklist_done", "true");
    setShowModal(false);
  }

  return (
    <>
      {showModal && <ChecklistModal onConfirm={handleConfirm} onDismiss={handleDismiss} />}

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
