"use client";

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import mockTempPackage from "@/widgets/home/package-plans/assets/mock-temp-package-4x.png";
import { ChecklistRecommendModal, ScrollReveal } from "@/shared/ui";
import SubscribePlansHeroImage from "@/widgets/subscribe/plans/assets/subscribe-plans-hero.png";
import SubscribePlansHeroImageMobile from "@/widgets/subscribe/plans/assets/subscribe-plans-hero-mobi.png";
import {
  comparePlansForDisplayOrder,
  packageThemeForPlan,
  PACKAGES,
} from "./packageData";
import PackageDetailView from "./PackageDetailView";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";

function formatMonthlyPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

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

interface Props {
  plans: SubscriptionPlanDto[];
}

/* ── Main Section ───────────────────────────────────────────────── */

export default function SubscribePlansSection({ plans }: Props) {
  const router = useRouter();
  const [isDismissed, setIsDismissed] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanDto | null>(null);
  const [hasOpenedDetail, setHasOpenedDetail] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const savedScrollY = useRef(0);

  const handleSelectPlan = useCallback((plan: SubscriptionPlanDto) => {
    setHasOpenedDetail(true);
    // 모바일에서만 스크롤 저장 및 상단 이동
    if (window.innerWidth < 768) {
      savedScrollY.current = window.scrollY;
      setSelectedPlan(plan);
      requestAnimationFrame(() => {
        sectionRef.current?.scrollIntoView({ behavior: "instant" });
      });
    } else {
      setSelectedPlan(plan);
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedPlan(null);
    // 모바일에서만 스크롤 복원
    if (window.innerWidth < 768) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedScrollY.current, behavior: "instant" });
      });
    }
  }, []);

  const sortedPlans = useMemo(
    () => [...plans].sort(comparePlansForDisplayOrder),
    [plans],
  );

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

      <section ref={sectionRef} className="bg-white pb-16 md:pt-0 md:pb-20">
        <div className="mx-auto px-6 md:px-0">
          {/* Hero image */}
          <ScrollReveal variant="fade-in" duration={600}>
            <div className="mb-6 text-center md:mb-8">
              <Image
                src={SubscribePlansHeroImageMobile}
                alt="Subscribe Plans Hero"
                className="max-md:block md:hidden w-[100vw] max-w-none relative left-1/2 -translate-x-1/2"
              />
              <div className="hidden h-[210px] overflow-hidden md:flex md:items-center md:justify-center">
                <Image
                  src={SubscribePlansHeroImage}
                  alt="Subscribe Plans Hero"
                  className="h-[210px] w-auto min-w-[1920px] max-w-none shrink-0"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* 모바일 티어 탭 — 카드 선택 전/후 모두 표시 */}
          <div className="md:hidden mb-4 flex justify-center gap-3">
            {sortedPlans.map((p) => {
              const theme = packageThemeForPlan(p);
              const isActive = selectedPlan?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => isActive ? handleCloseDetail() : handleSelectPlan(p)}
                  className="rounded-full px-3 py-1 text-body-14-sb leading-[17px] text-white"
                  style={{
                    background: isActive ? theme.colorVar : "var(--color-text-muted)",
                  }}
                >
                  {theme.tierLabel}
                </button>
              );
            })}
          </div>

          {selectedPlan ? (
            <div className="mx-auto w-full max-w-[var(--max-width-content)]">
              <PackageDetailView
                plan={selectedPlan}
                allPlans={sortedPlans}
                onSelectPlan={handleSelectPlan}
                onClose={handleCloseDetail}
              />
            </div>
          ) : sortedPlans.length === 0 ? (
            <p className="mx-auto max-w-content text-center text-body-16-m text-[var(--color-text-secondary)]">
              표시할 구독 플랜이 없습니다. 잠시 후 다시 시도해 주세요.
            </p>
          ) : (
            /* Package cards */
            <div className="mx-auto max-w-content flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-4">
              {sortedPlans.map((plan, i) => {
                const theme = packageThemeForPlan(plan);
                const color = theme.colorVar;
                return (
                  <ScrollReveal
                    key={plan.id}
                    variant="fade-up"
                    delay={100 + i * 120}
                    duration={600}
                    immediate={hasOpenedDetail}
                  >
                  <div
                    className="flex flex-col rounded-[20px] bg-[var(--color-background)] px-7 pb-7 pt-5"
                  >
                    <div className="mb-2.5 flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full px-3 py-1 text-body-14-sb leading-[17px] text-white"
                          style={{ background: color }}
                        >
                          {theme.tierLabel}
                        </span>
                        {plan.isRecommended ? (
                          <span className="rounded-full bg-[var(--color-accent-orange)] px-3 py-1 text-body-12-sb text-white">
                            추천
                          </span>
                        ) : null}
                      </div>
                      {/* 우상단 ⓘ 버튼 → 상세 뷰 */}
                      <button
                        type="button"
                        aria-label={`${plan.name} 패키지 상세 정보`}
                        onClick={() => handleSelectPlan(plan)}
                        className="flex shrink-0 items-center justify-center"
                      >
                        <InfoIcon />
                      </button>
                    </div>

                    <div className="mb-[56px] flex justify-center">
                      <Image
                        src={mockTempPackage}
                        alt={`${plan.name} 이미지`}
                        className="h-[150px] w-auto object-contain"
                      />
                    </div>

                    <h2 className="mb-7.5 text-body-20-sb tracking-[-0.04em] text-[var(--color-text)]">
                      {plan.name}
                    </h2>

                    {plan.description ? (
                      <p className="mb-4 text-body-13-r text-[var(--color-text-secondary)]">
                        {plan.description}
                      </p>
                    ) : null}

                    <ul className="mb-7 flex flex-col gap-[14px]">
                      {(PACKAGES.find((p) => p.tier === theme.tier)?.items ?? []).map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-body-13-m leading-[16px] text-black"
                        >
                          <CheckIcon color={color} />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div className="mb-7 mt-auto flex items-center justify-between border-t border-[var(--color-text-muted)] pt-3">
                      <span className="text-body-14-b text-black">월 요금제</span>
                      <span className="text-price-20-eb leading-8 text-[var(--color-surface-dark)]">
                        {formatMonthlyPrice(plan.monthlyPrice)}
                      </span>
                    </div>

                    {/* 제품 상세보기 → 상세 페이지 */}
                    <button
                      type="button"
                      onClick={() => router.push(`/subscribe/detail?planId=${plan.id}`)}
                      className="flex h-[48px] w-full items-center justify-center rounded-[30px] text-subtitle-16-sb leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80"
                      style={{ background: color }}
                    >
                      제품 상세보기
                    </button>
                  </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
