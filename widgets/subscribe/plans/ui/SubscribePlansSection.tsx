"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image, { type StaticImageData } from "next/image";
import { ChecklistRecommendModal, ScrollReveal, Button, CheckCircleIcon } from "@/shared/ui";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { hasChecklistAnswers } from "@/features/profile/lib/profileStatus";
import { MEDIA_MAX_MD_SIZES } from "@/shared/config/breakpoints";
import SubscribePlansHeroImage from "@/widgets/subscribe/plans/assets/subscribe-plans-hero-renewal.png";
import SubscribePlansHeroImageMobile from "@/widgets/subscribe/plans/assets/subscribe-plans-hero-mobi.png";
import packageExplainWithBasic from "@/widgets/home/package-plans/assets/package-explain-with-basic.png";
import packageExplainWithPremium from "@/widgets/home/package-plans/assets/package-explain-with-premium.png";
import packageExplainWithStandard from "@/widgets/home/package-plans/assets/package-explain-with-standard.png";
import packageImageBasic from "@/widgets/home/package-plans/assets/package-image-basic.png";
import packageImagePremium from "@/widgets/home/package-plans/assets/package-image-premium.png";
import packageImageStandard from "@/widgets/home/package-plans/assets/package-image-standard.png";
import {
  comparePlansForDisplayOrder,
  PACKAGES,
  tierFromSubscriptionPlan,
  type PackageTier,
} from "./packageData";
import { TIER_DETAIL_HERO_IMAGES } from "./packageThumbnails";
import PackageNutritionGuide from "./PackageNutritionGuide";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";
import type { Profile } from "@/features/profile/api/types";

const PACKAGE_SUMMARY_IMAGES: Record<PackageTier, StaticImageData> = {
  Basic: packageImageBasic,
  Standard: packageImageStandard,
  Premium: packageImagePremium,
};

/** /subscribe 플랜 목록 노출 순서 */
const PACKAGE_SUMMARY_ORDER: PackageTier[] = ["Premium", "Standard", "Basic"];

const ROTATION_INTERVAL_MS = 8000;

/** 메인 PackagePlansSection 과 동일한 좌측 롤링 순서 */
const PACKAGE_EXPLAIN_ROTATION: Array<{
  tier: PackageTier;
  src: StaticImageData;
  alt: string;
}> = [
  { tier: "Basic", src: packageExplainWithBasic, alt: "베이직 패키지 BOX 설명" },
  { tier: "Standard", src: packageExplainWithStandard, alt: "스탠다드 패키지 BOX 설명" },
  { tier: "Premium", src: packageExplainWithPremium, alt: "프리미엄 패키지 BOX 설명" },
];

function formatMonthlyPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

function planForTier(plans: SubscriptionPlanDto[], tier: PackageTier) {
  return plans.find((p) => tierFromSubscriptionPlan(p) === tier);
}

/* ── Main Section ───────────────────────────────────────────────── */

interface Props {
  plans: SubscriptionPlanDto[];
  initialProfile: Profile | null;
}

export default function SubscribePlansSection({ plans, initialProfile }: Props) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { profile: clientProfile } = useProfile();
  const [isDismissed, setIsDismissed] = useState(false);

  const sortedPlans = useMemo(
    () => [...plans].sort(comparePlansForDisplayOrder),
    [plans],
  );

  const [activePackageIndex, setActivePackageIndex] = useState(2);
  const activePackage = PACKAGE_EXPLAIN_ROTATION[activePackageIndex];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActivePackageIndex(
        (currentIndex) => (currentIndex + 1) % PACKAGE_EXPLAIN_ROTATION.length,
      );
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  const activePlan = planForTier(sortedPlans, activePackage.tier);
  const activePkg = PACKAGES.find((p) => p.tier === activePackage.tier);

  const profile = clientProfile ?? initialProfile;
  const isChecklistDone = hasChecklistAnswers(profile);
  const showModal = isLoggedIn && !isChecklistDone && !isDismissed;

  function handleClose() {
    setIsDismissed(true);
  }

  function handleConfirm() {
    setIsDismissed(true);
    router.push("/checklist");
  }

  function handleDetailClick() {
    if (!activePlan) return;
    router.push(`/subscribe/detail?planId=${activePlan.id}`);
  }

  return (
    <>
      {showModal && <ChecklistRecommendModal onClose={handleClose} onConfirm={handleConfirm} />}

      <section className="flex min-h-full flex-1 flex-col bg-white pb-16 md:pb-20">
        <div className="flex w-full flex-1 flex-col">
          {/* Hero — 모바일: 전용 이미지 / 데스크톱: 배경 포함 renewal 배너 (118px, 좁은 뷰포트는 가로 중앙) */}
          <ScrollReveal variant="fade-in" duration={600}>
            <div className="mb-6 md:mb-10 lg:mb-10">
              <div className="flex h-[111px] items-center justify-center overflow-hidden md2:hidden">
                <Image
                  src={SubscribePlansHeroImageMobile}
                  alt="이제 수제 간식도 맞춤형으로 구독하세요"
                  className="h-[111px] w-full shrink-0 object-cover object-center"
                  priority
                />
              </div>
              <div className="relative max-md2:hidden h-[118px] w-full overflow-hidden">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                  <Image
                    src={SubscribePlansHeroImage}
                    alt="이제 수제 간식도 맞춤형으로 구독하세요"
                    className="h-[118px] w-auto max-w-none shrink-0"
                    priority
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>

          <div className="mx-auto w-full max-w-content max-md:px-5 md:px-6 lg:px-0">
            {sortedPlans.length === 0 ? (
              <p className="text-center text-body-16-m text-[var(--color-text-secondary)]">
                표시할 구독 플랜이 없습니다. 잠시 후 다시 시도해 주세요.
              </p>
            ) : (
              <ScrollReveal variant="fade-up" delay={150}>
                <div className="flex items-stretch justify-center gap-6 max-lg:flex-col max-lg:items-center max-md:gap-[46px] lg:gap-7">
                  {/* 모바일 — 대표 이미지와 핵심 정보만 분리 표시 */}
                  <div className="w-full max-w-[600px] max-md:block md:hidden lg:hidden">
                    <div
                      className="relative w-full rounded-[22px]"
                      style={{ boxShadow: "var(--shadow-card-soft)" }}
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-[22px] bg-[var(--color-surface-warm)]">
                        {activePkg ? (
                          <Image
                            key={activePackage.tier}
                            src={TIER_DETAIL_HERO_IMAGES[activePackage.tier]}
                            alt={`${activePkg.name} 대표 이미지`}
                            fill
                            className="object-cover transition-opacity duration-500"
                            sizes={`${MEDIA_MAX_MD_SIZES} 100vw, 600px`}
                            priority
                          />
                        ) : null}
                      </div>
                      <PackageNutritionGuide
                        initialTier={activePackage.tier}
                        bubbleClassName="h-auto w-[100px]"
                      />
                    </div>

                    {activePkg ? (
                      <div className="mt-4">
                        <p
                          className="text-[17px] font-bold leading-[22px] tracking-[-0.04em]"
                          style={{ color: activePkg.colorVar }}
                        >
                          {activePkg.name}
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <ul className="min-w-0 flex-1 flex flex-col gap-2">
                            {activePkg.items.map((item) => (
                              <li
                                key={item}
                                className="flex items-start gap-2 text-body-13-m leading-[18px] text-[var(--color-text)]"
                              >
                                <CheckCircleIcon color={activePkg.colorVar} className="mt-0.5 shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                          <button
                            type="button"
                            onClick={handleDetailClick}
                            disabled={!activePlan}
                            className="flex h-10 w-[108px] shrink-0 items-center justify-center self-center rounded-[8px] bg-[var(--color-btn-dark-warm)] text-center text-[14px] font-semibold leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            제품 상세보기
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* 태블릿·데스크톱 — 선택된 패키지 설명 (메인 PackagePlansSection 패턴) */}
                  <div
                    className="relative w-full max-w-[600px] rounded-[22px] max-md:hidden md:rounded-[28px]"
                    style={{ boxShadow: "var(--shadow-card-soft)" }}
                  >
                    <div className="overflow-hidden rounded-[22px] md:rounded-[28px]">
                      {activePkg ? (
                        <Image
                          key={activePackage.tier}
                          src={activePackage.src}
                          alt={activePackage.alt}
                          className="h-auto w-full transition-opacity duration-500"
                          sizes="(min-width: 1200px) 600px, calc(100vw - 40px)"
                          priority
                        />
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      onClick={handleDetailClick}
                      variant="primary"
                      size="lg"
                      disabled={!activePlan}
                      className="absolute bottom-4 right-4 h-10 w-[180px] bg-[var(--color-brown-dark)] px-6 text-[14px] font-semibold leading-[150%] tracking-[-0.02em] shadow-md max-md:bottom-3 max-md:right-3 max-md:w-[150px] max-md:px-4 lg:bottom-11 lg:right-11"
                    >
                      제품 상세보기
                    </Button>
                    <PackageNutritionGuide initialTier={activePackage.tier} />
                  </div>

                  {/* 우측 — 패키지 요약 카드 목록 */}
                  <div className="flex w-full max-w-[600px] flex-col gap-6 lg:h-[556px] lg:w-[386px] lg:max-w-none lg:shrink-0">
                    {PACKAGE_SUMMARY_ORDER.map((tier) => {
                      const pkg = PACKAGES.find((p) => p.tier === tier)!;
                      const plan = planForTier(sortedPlans, tier);
                      const img = PACKAGE_SUMMARY_IMAGES[tier];

                      if (!plan) return null;

                      return (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => router.push(`/subscribe/detail?planId=${plan.id}`)}
                          className="group flex h-[132px] w-full overflow-visible bg-white text-left transition-opacity hover:opacity-90 active:opacity-80 md:h-[167px] md:overflow-hidden md:rounded-2xl md:shadow-sm lg:shadow-none"
                        >
                          <div className="relative h-full w-[142px] shrink-0 overflow-hidden rounded-2xl bg-[var(--color-surface-warm)] md:w-[180px]">
                            <Image
                              src={img}
                              alt={pkg.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="180px"
                            />
                          </div>
                          <div className="min-w-0 flex-1 py-[6px] pl-5 pr-0 md:py-[25px] md:pl-7 md:pr-4 lg:pl-6 lg:pr-0">
                            <p className="mb-1 truncate text-[17px] font-semibold leading-[24px] tracking-[-0.04em] text-[var(--color-text-emphasis)] md:mb-6 md:text-[20px]">
                              {pkg.name}
                            </p>
                            <p className="mb-3 line-clamp-1 text-[13px] font-medium leading-[18px] tracking-[-0.04em] text-[var(--color-text-secondary)] md:hidden">
                              {pkg.items[0]}
                            </p>
                            <p className="mb-1.5 text-[14px] font-bold leading-[19px] tracking-[-0.05em] text-[var(--color-text-body-warm)] md:text-[16px]">
                              월 요금제
                            </p>
                            <div className="mb-0.5 flex items-baseline gap-2">
                              <span
                                className="text-[14px] font-semibold leading-[19px] tracking-[-0.05em] md:text-[16px]"
                                style={{ color: pkg.colorVar }}
                              >
                                {plan.discountRate}%
                              </span>
                              <span className="text-[18px] font-extrabold leading-[24px] tracking-[-0.05em] text-[var(--color-text-emphasis)] md:text-[20px]">
                                {formatMonthlyPrice(plan.monthlyPrice)}
                              </span>
                            </div>
                            <span
                              className="text-[13px] font-semibold leading-[17px] tracking-[-0.05em] md:text-[14px]"
                              style={{ color: pkg.colorVar }}
                            >
                              첫 구독 할인
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
