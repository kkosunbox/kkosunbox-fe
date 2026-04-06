"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import mockTempPackage from "@/widgets/home/package-plans/assets/mock-temp-package.png";
import { ChecklistRecommendModal } from "@/shared/ui";
import SubscribePlansHeroImage from "@/widgets/subscribe/plans/assets/subscribe-plans-hero.png";
import SubscribePlansHeroImageMobile from "@/widgets/subscribe/plans/assets/subscribe-plans-hero-mobi.png";
import { PACKAGES, type PackageTier } from "./packageData";
import PackageDetailView from "./PackageDetailView";

/* ── Icons (카드 목록용) ──────────────────────────────────────────── */

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" className="shrink-0" aria-hidden="true">
      <circle cx="9" cy="9" r="8" style={{ fill: color }} />
      <path
        d="M6 9L8 11L12 7"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
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

/* ── Main Section ───────────────────────────────────────────────── */

export default function SubscribePlansSection() {
  const router = useRouter();
  const [isDismissed, setIsDismissed] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PackageTier | null>(null);

  const isChecklistDone = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      window.addEventListener("storage", onStoreChange);
      return () => window.removeEventListener("storage", onStoreChange);
    },
    () => localStorage.getItem("kkosun_checklist_done") === "true",
    () => true,
  );
  const showModal = !isChecklistDone && !isDismissed;

  function handleClose() {
    setIsDismissed(true);
  }

  function handleConfirm() {
    setIsDismissed(true);
    router.push("/checklist");
  }

  return (
    <>
      {showModal && <ChecklistRecommendModal onClose={handleClose} onConfirm={handleConfirm} />}

      <section className="bg-white pb-16 md:pt-0 md:pb-20">
        <div className="mx-auto px-6 md:px-0">
          {/* Hero image */}
          <div className="mb-10 text-center md:mb-8">
            <Image
              src={SubscribePlansHeroImageMobile}
              alt="Subscribe Plans Hero"
              className="md:hidden block w-[100vw] max-w-none relative left-1/2 -translate-x-1/2"
            />
            <Image
              src={SubscribePlansHeroImage}
              alt="Subscribe Plans Hero"
              className="max-md:hidden w-full h-auto"
            />
          </div>

          {selectedTier ? (
            <div className="mx-auto w-full max-w-[var(--max-width-content)]">
              <PackageDetailView
                key={selectedTier}
                selectedTier={selectedTier}
                onSelectTier={setSelectedTier}
                onClose={() => setSelectedTier(null)}
              />
            </div>
          ) : (
            /* Package cards */
            <div className="mx-auto max-w-content flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-4">
              {PACKAGES.map((pkg) => (
                <div
                  key={pkg.tier}
                  className="flex flex-col rounded-[20px] bg-[var(--color-background)] px-7 pb-7 pt-5"
                >
                  <div className="mb-2.5 flex items-center justify-between">
                    <span
                      className="rounded-full px-3 py-1 text-[14px] font-semibold leading-[17px] text-white"
                      style={{ background: pkg.colorVar }}
                    >
                      {pkg.tier}
                    </span>
                    {/* 우상단 ⓘ 버튼 → 상세 뷰 */}
                    <button
                      type="button"
                      aria-label={`${pkg.tier} 패키지 상세 정보`}
                      onClick={() => setSelectedTier(pkg.tier)}
                      className="flex items-center justify-center"
                    >
                      <InfoIcon />
                    </button>
                  </div>

                  <div className="mb-[56px] flex justify-center">
                    <Image
                      src={mockTempPackage}
                      alt={`${pkg.name} 이미지`}
                      className="h-[150px] w-auto object-contain"
                    />
                  </div>

                  <h2 className="mb-7.5 text-[20px] font-semibold leading-[24px] tracking-[-0.04em] text-[var(--color-text)]">
                    {pkg.name}
                  </h2>

                  <ul className="mb-7 flex flex-col gap-[14px]">
                    {pkg.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-[13px] font-medium leading-[16px] text-black"
                      >
                        <CheckIcon color={pkg.colorVar} />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mb-7 mt-auto flex items-center justify-between border-t border-white pt-3">
                    <span className="text-[14px] font-bold text-black">월 요금제</span>
                    <span className="text-[20px] font-extrabold leading-[32px] tracking-[-0.05em] text-[var(--color-surface-dark)]">
                      {pkg.price}
                    </span>
                  </div>

                  {/* 구독하기 → 결제 페이지 */}
                  <button
                    type="button"
                    onClick={() => router.push("/order")}
                    className="flex h-[48px] w-full items-center justify-center rounded-[30px] text-[16px] font-semibold leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80"
                    style={{ background: pkg.colorVar }}
                  >
                    구독하기
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
