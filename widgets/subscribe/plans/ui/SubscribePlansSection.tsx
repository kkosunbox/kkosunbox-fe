"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image, { type StaticImageData } from "next/image";
import { ChecklistRecommendModal, ScrollReveal, Button } from "@/shared/ui";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { hasChecklistAnswers } from "@/features/profile/lib/profileStatus";
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
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";
import type { Profile } from "@/features/profile/api/types";

const PACKAGE_EXPLAIN_IMAGES: Record<PackageTier, StaticImageData> = {
  Basic: packageExplainWithBasic,
  Standard: packageExplainWithStandard,
  Premium: packageExplainWithPremium,
};

const PACKAGE_SUMMARY_IMAGES: Record<PackageTier, StaticImageData> = {
  Basic: packageImageBasic,
  Standard: packageImageStandard,
  Premium: packageImagePremium,
};

/** 메인 PackagePlansSection 과 동일한 우측 카드 순서 */
const PACKAGE_SUMMARY_ORDER: PackageTier[] = ["Premium", "Basic", "Standard"];

function formatMonthlyPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

function planForTier(plans: SubscriptionPlanDto[], tier: PackageTier) {
  return plans.find((p) => tierFromSubscriptionPlan(p) === tier);
}

function initialSelectedTier(plans: SubscriptionPlanDto[]): PackageTier {
  for (const tier of PACKAGE_SUMMARY_ORDER) {
    if (planForTier(plans, tier)) return tier;
  }
  const sorted = [...plans].sort(comparePlansForDisplayOrder);
  const first = sorted[0];
  return first ? tierFromSubscriptionPlan(first) : "Premium";
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

  const [selectedTier, setSelectedTier] = useState<PackageTier>(() =>
    initialSelectedTier(plans),
  );

  const activePlan = planForTier(sortedPlans, selectedTier);
  const activePkg = PACKAGES.find((p) => p.tier === selectedTier);

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
              <div className="flex h-[170px] items-center justify-center overflow-hidden md:hidden lg:hidden">
                <Image
                  src={SubscribePlansHeroImageMobile}
                  alt="이제 수제 간식도 맞춤형으로 구독하세요"
                  className="h-[170px] w-auto max-w-none shrink-0"
                  priority
                />
              </div>
              <div className="relative hidden h-[118px] w-full overflow-hidden md:block lg:block">
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
                <div className="flex items-stretch justify-center gap-6 max-lg:flex-col max-lg:items-center lg:gap-7">
                  {/* 좌측 — 선택된 패키지 설명 (메인 PackagePlansSection 패턴) */}
                  <div className="relative w-full max-w-[600px] overflow-hidden rounded-[22px] shadow-sm md:rounded-[28px]">
                    {activePkg ? (
                      <Image
                        key={selectedTier}
                        src={PACKAGE_EXPLAIN_IMAGES[selectedTier]}
                        alt={`${activePkg.name} 설명`}
                        className="h-auto w-full transition-opacity duration-300"
                        sizes="(min-width: 1200px) 600px, calc(100vw - 40px)"
                        priority
                      />
                    ) : null}
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
                          onClick={() => setSelectedTier(tier)}
                          className="flex h-[132px] w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm transition-shadow hover:shadow-md md:h-[167px] lg:shadow-none lg:hover:shadow-sm"
                        >
                          <div className="relative h-full w-[142px] shrink-0 overflow-hidden rounded-2xl md:w-[180px]">
                            <Image
                              src={img}
                              alt={pkg.name}
                              fill
                              className="object-cover"
                              sizes="180px"
                            />
                          </div>
                          <div className="min-w-0 flex-1 px-4 py-[18px] md:py-[25px] lg:pl-6 lg:pr-0">
                            <p className="mb-4 truncate text-[17px] font-semibold leading-[24px] tracking-[-0.04em] text-[var(--color-text-emphasis)] md:mb-6 md:text-[20px]">
                              {pkg.name}
                            </p>
                            <p className="mb-1.5 text-[14px] font-bold leading-[19px] tracking-[-0.05em] text-[var(--color-text-body-warm)] md:text-[16px]">
                              월 요금제
                            </p>
                            <div className="mb-0.5 flex items-baseline gap-2">
                              <span className="text-[14px] font-semibold leading-[19px] tracking-[-0.05em] text-[var(--color-accent-orange)] md:text-[16px]">
                                {plan.discountRate}%
                              </span>
                              <span className="text-[18px] font-extrabold leading-[24px] tracking-[-0.05em] text-[var(--color-text-emphasis)] md:text-[20px]">
                                {formatMonthlyPrice(plan.monthlyPrice)}
                              </span>
                            </div>
                            <span className="text-[13px] font-semibold leading-[17px] tracking-[-0.05em] text-[var(--color-accent-orange)] md:text-[14px]">
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
