"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image, { type StaticImageData } from "next/image";
import { ChecklistRecommendModal, ScrollReveal, CheckCircleIcon } from "@/shared/ui";
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
import { PackageSummaryThumbnail } from "@/widgets/home/package-plans/ui/PackageSummaryThumbnail";
import {
  comparePlansForDisplayOrder,
  PACKAGES,
  tierFromSubscriptionPlan,
  type PackageTier,
} from "./packageData";
import { TIER_DETAIL_HERO_IMAGES } from "./packageThumbnails";
import PackageNutritionGuide from "./PackageNutritionGuide";
import { usePlanRatings } from "./usePlanRatings";
import PlanRatingStars from "./PlanRatingStars";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";
import type { Profile } from "@/features/profile/api/types";

const PACKAGE_SUMMARY_IMAGES: Record<PackageTier, StaticImageData> = {
  Basic: packageImageBasic,
  Standard: packageImageStandard,
  Premium: packageImagePremium,
};

const ROTATION_INTERVAL_MS = 8000;

/** /subscribe 플랜 목록 노출 순서 */
const PACKAGE_SUMMARY_ORDER: PackageTier[] = ["Premium", "Standard", "Basic"];

const PACKAGE_EXPLAIN: Record<PackageTier, { src: StaticImageData; alt: string }> = {
  Basic: { src: packageExplainWithBasic, alt: "베이직 패키지 BOX 설명" },
  Standard: { src: packageExplainWithStandard, alt: "스탠다드 패키지 BOX 설명" },
  Premium: { src: packageExplainWithPremium, alt: "프리미엄 패키지 BOX 설명" },
};

function formatMonthlyPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

function planForTier(plans: SubscriptionPlanDto[], tier: PackageTier) {
  return plans.find((p) => tierFromSubscriptionPlan(p) === tier);
}

/* ── Main Section ───────────────────────────────────────────────── */

interface PrimaryButtonConfig {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

interface Props {
  plans: SubscriptionPlanDto[];
  initialProfile?: Profile | null;
  showChecklistRecommend?: boolean;
  initialSelectedTier?: PackageTier | null;
  heroDesktopImage?: StaticImageData;
  heroMobileImage?: StaticImageData;
  heroAlt?: string;
  isCurrentPlan?: (plan: SubscriptionPlanDto) => boolean;
  /** false면 우측 카드 선택 테두리 미표시 (구독 추가 모드 등) */
  showSelectedCardHighlight?: boolean;
  getPrimaryButton?: (plan: SubscriptionPlanDto) => PrimaryButtonConfig;
}

export default function SubscribePlansSection({
  plans,
  initialProfile = null,
  showChecklistRecommend = true,
  initialSelectedTier = null,
  heroDesktopImage,
  heroMobileImage,
  heroAlt = "이제 수제 간식도 맞춤형으로 구독하세요",
  isCurrentPlan,
  showSelectedCardHighlight = true,
  getPrimaryButton,
}: Props) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { profile: clientProfile } = useProfile();
  const [isDismissed, setIsDismissed] = useState(false);

  const sortedPlans = useMemo(
    () => [...plans].sort(comparePlansForDisplayOrder),
    [plans],
  );
  const planRatings = usePlanRatings(sortedPlans.map((plan) => plan.id));

  const [selectedTier, setSelectedTier] = useState<PackageTier | null>(initialSelectedTier);
  const [rotatingIndex, setRotatingIndex] = useState(0);

  useEffect(() => {
    if (selectedTier !== null) return;
    const intervalId = window.setInterval(() => {
      setRotatingIndex((i) => (i + 1) % PACKAGE_SUMMARY_ORDER.length);
    }, ROTATION_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [selectedTier]);

  /** 왼쪽 패널 렌더링용 — 미선택 시 자동 회전 tier 표시 */
  const displayTier = selectedTier ?? PACKAGE_SUMMARY_ORDER[rotatingIndex];

  const activeExplain = PACKAGE_EXPLAIN[displayTier];
  const activePlan = planForTier(sortedPlans, displayTier);
  const activePkg = PACKAGES.find((p) => p.tier === displayTier);
  const activeIsCurrentPlan = activePlan ? (isCurrentPlan?.(activePlan) ?? false) : false;

  const profile = clientProfile ?? initialProfile;
  const isChecklistDone = hasChecklistAnswers(profile);
  const showModal = showChecklistRecommend && isLoggedIn && !isChecklistDone && !isDismissed;

  function handleClose() {
    setIsDismissed(true);
  }

  function handleConfirm() {
    setIsDismissed(true);
    router.push("/checklist");
  }

  function primaryButtonFor(plan: SubscriptionPlanDto): PrimaryButtonConfig {
    return getPrimaryButton?.(plan) ?? {
      label: "제품 상세보기",
      onClick: () => router.push(`/subscribe/detail?planId=${plan.id}`),
    };
  }

  function handlePrimaryClick() {
    if (!activePlan) return;
    const primaryButton = primaryButtonFor(activePlan);
    if (primaryButton.disabled) return;
    primaryButton.onClick();
  }

  const activePrimaryButton = activePlan ? primaryButtonFor(activePlan) : null;
  const mobileHero = heroMobileImage ?? SubscribePlansHeroImageMobile;
  const desktopHero = heroDesktopImage ?? SubscribePlansHeroImage;

  function renderPrimaryAction(className: string) {
    if (!activePrimaryButton) return null;

    if (activePrimaryButton.disabled && activePrimaryButton.label === "현재 구독중") {
      return (
        <div
          className={`${className} bg-[var(--color-text-secondary)] text-white disabled:cursor-not-allowed`}
          aria-disabled="true"
        >
          {activePrimaryButton.label}
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={handlePrimaryClick}
        disabled={!activePlan || activePrimaryButton.disabled}
        className={`${className} bg-[var(--color-btn-dark-warm)] text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {activePrimaryButton.label}
      </button>
    );
  }

  return (
    <>
      {showModal && <ChecklistRecommendModal onClose={handleClose} onConfirm={handleConfirm} />}

      <section className="flex min-h-full flex-1 flex-col bg-white pt-[54px] pb-16 md:pb-20">
        <div className="flex w-full flex-1 flex-col">
          {/* Hero — 모바일: 전용 이미지 / 데스크톱: 배경 포함 renewal 배너 (118px, 좁은 뷰포트는 가로 중앙) */}
          <ScrollReveal variant="fade-in" duration={600}>
            <div className="mb-6 md:mb-10 lg:mb-10">
              <div className="flex h-[111px] items-center justify-center overflow-hidden md2:hidden">
                <Image
                  src={mobileHero}
                  alt={heroAlt}
                  className="h-[111px] w-full shrink-0 object-cover object-center"
                  priority
                />
              </div>
              {/* 데스크톱: 1920px 이내는 이미지로 채우고, 초광폭은 좌우를 support hero와 동일 톤으로 보완 */}
              <div className="max-md2:hidden w-full bg-support-hero-side-bg">
                <div className="relative mx-auto h-[118px] w-full max-w-[1920px] overflow-hidden">
                  <Image
                    src={desktopHero}
                    alt={heroAlt}
                    className="absolute inset-0 h-full w-full object-cover object-center"
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
                      <div
                        className="relative aspect-square w-full overflow-hidden rounded-[22px] bg-[var(--color-surface-warm)]"
                        onClick={handlePrimaryClick}
                        style={{ cursor: activePrimaryButton && !activePrimaryButton.disabled ? "pointer" : undefined }}
                      >
                        {activePkg ? (
                          <Image
                            key={displayTier}
                            src={TIER_DETAIL_HERO_IMAGES[displayTier]}
                            alt={`${activePkg.name} 대표 이미지`}
                            fill
                            className="object-cover transition-opacity duration-500"
                            sizes={`${MEDIA_MAX_MD_SIZES} 100vw, 600px`}
                            priority
                          />
                        ) : null}
                        {activeIsCurrentPlan ? (
                          <div className="absolute left-4 top-4 z-10">
                            <span className="rounded-full bg-[var(--color-text)] px-3 py-1 text-[14px] font-semibold leading-[17px] text-white">
                              이용중
                            </span>
                          </div>
                        ) : null}
                      </div>
                      <PackageNutritionGuide
                        initialTier={displayTier}
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
                          {renderPrimaryAction(
                            "flex h-10 w-[108px] shrink-0 items-center justify-center self-center rounded-[8px] text-center text-[14px] font-semibold leading-[150%] tracking-[-0.02em]",
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* 태블릿·데스크톱 — 선택된 패키지 설명 (메인 PackagePlansSection 패턴) */}
                  <div
                    className="relative w-full max-w-[600px] rounded-[22px] max-md:hidden md:rounded-[28px]"
                    style={{ boxShadow: "var(--shadow-card-soft)" }}
                  >
                    <div
                      className="relative overflow-hidden rounded-[22px] md:rounded-[28px]"
                      onClick={handlePrimaryClick}
                      style={{ cursor: activePrimaryButton && !activePrimaryButton.disabled ? "pointer" : undefined }}
                    >
                      {activePkg ? (
                        <Image
                          key={displayTier}
                          src={activeExplain.src}
                          alt={activeExplain.alt}
                          className="h-auto w-full transition-opacity duration-500"
                          sizes="(min-width: 1200px) 600px, calc(100vw - 40px)"
                          priority
                        />
                      ) : null}
                      {activeIsCurrentPlan ? (
                        <div className="absolute left-5 top-5 z-10 lg:left-11 lg:top-11">
                          <span className="rounded-full bg-[var(--color-text)] px-3 py-1 text-[14px] font-semibold leading-[17px] text-white">
                            이용중
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <div className="absolute bottom-4 right-4 lg:bottom-11 lg:right-11">
                      {renderPrimaryAction(
                        "flex h-10 w-[180px] flex-row items-center justify-center gap-[10px] rounded-[8px] px-6 py-[13px] text-center text-[14px] font-semibold leading-[150%] tracking-[-0.02em]",
                      )}
                    </div>
                    <PackageNutritionGuide initialTier={displayTier} />
                  </div>

                  {/* 우측 — 패키지 요약 카드 목록 */}
                  <div className="flex w-full max-w-[600px] flex-col gap-6 lg:h-[556px] lg:w-[386px] lg:max-w-none lg:shrink-0">
                    {PACKAGE_SUMMARY_ORDER.map((tier) => {
                      const pkg = PACKAGES.find((p) => p.tier === tier)!;
                      const plan = planForTier(sortedPlans, tier);
                      const img = PACKAGE_SUMMARY_IMAGES[tier];
                      const isSelected = selectedTier !== null && selectedTier === tier;
                      const showSelectionState = showSelectedCardHighlight;

                      if (!plan) return null;

                      const isPlanCurrent = isCurrentPlan?.(plan) ?? false;

                      return (
                        <button
                          key={tier}
                          type="button"
                          aria-pressed={showSelectionState ? isSelected : undefined}
                          onClick={() => setSelectedTier((prev) => (prev === tier ? null : tier))}
                          className="group relative flex h-[132px] w-full overflow-visible rounded-2xl bg-white text-left transition-all hover:opacity-90 active:opacity-80 md:h-[167px] shadow-none"
                        >
                          <div
                            className={[
                              "relative h-full w-[142px] shrink-0 overflow-hidden rounded-2xl bg-[var(--color-surface-warm)] md:w-[180px]",
                              isSelected ? "outline outline-2 outline-[var(--color-cta-button)]" : "",
                            ].join(" ")}
                          >
                            <PackageSummaryThumbnail src={img} alt={pkg.name} />
                            {isPlanCurrent ? (
                              <div className="absolute left-3 top-3 z-10 md:left-4 md:top-4">
                                <span className="rounded-full bg-[var(--color-text)] px-2.5 py-0.5 text-[12px] font-semibold leading-[15px] text-white md:px-3 md:py-1 md:text-[14px] md:leading-[17px]">
                                  이용중
                                </span>
                              </div>
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1 py-[6px] pl-5 pr-0 md:py-[25px] md:pl-7 md:pr-4 lg:pl-6 lg:pr-0">
                            <p
                              className={[
                                "mb-2 truncate text-[17px] leading-[24px] tracking-[-0.04em] md:mb-6 md:text-[20px]",
                                showSelectionState && isSelected
                                  ? "font-bold text-[var(--color-text-emphasis)]"
                                  : "font-semibold text-[var(--color-text-emphasis)]",
                              ].join(" ")}
                            >
                              {plan.name || pkg.name}
                            </p>
                            <div className="mb-1.5 flex items-baseline gap-2">
                              <span className="text-[14px] font-semibold leading-[19px] tracking-[-0.05em] text-[var(--color-cta-button)] md:text-[16px]">
                                {plan.discountRate}%
                              </span>
                              <span className="text-[14px] font-medium leading-[19px] tracking-[-0.05em] text-[var(--color-text-secondary)] line-through md:text-[16px]">
                                {formatMonthlyPrice(plan.originalPrice)}
                              </span>
                            </div>
                            <div className="mb-2 flex items-baseline gap-2">
                              <span className="text-[14px] font-bold leading-[19px] tracking-[-0.05em] text-[var(--color-text-body-warm)] md:text-[16px]">
                                월 요금제
                              </span>
                              <span className="text-[18px] font-extrabold leading-[24px] tracking-[-0.05em] text-[var(--color-text-emphasis)] md:text-[20px]">
                                {formatMonthlyPrice(plan.monthlyPrice)}
                              </span>
                            </div>
                            {planRatings[plan.id] > 0 ? (
                              <PlanRatingStars rating={planRatings[plan.id]} size={16} />
                            ) : null}
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
