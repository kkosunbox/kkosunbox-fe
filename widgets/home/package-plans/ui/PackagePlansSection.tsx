"use client";

import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Text, ScrollReveal, CheckCircleIcon } from "@/shared/ui";
import { PACKAGES, PackageTier, tierFromSubscriptionPlan } from "@/widgets/subscribe/plans/ui/packageData";
import { TIER_DETAIL_HERO_IMAGES } from "@/widgets/subscribe/plans/ui/packageThumbnails";
import { usePlanRatings } from "@/widgets/subscribe/plans/ui/usePlanRatings";
import PlanRatingStars from "@/widgets/subscribe/plans/ui/PlanRatingStars";
import PackageNutritionGuide from "@/widgets/subscribe/plans/ui/PackageNutritionGuide";
import { MEDIA_MAX_MD_SIZES } from "@/shared/config/breakpoints";
import { getSubscriptionPlans } from "@/features/subscription/api";
import type { SubscriptionPlanDto } from "@/features/subscription/api";
import packageExplainWithBasic from "../assets/package-explain-with-basic.png";
import packageExplainWithPremium from "../assets/package-explain-with-premium.png";
import packageExplainWithStandard from "../assets/package-explain-with-standard.png";
import homePackagePlansTitle from "../assets/home-package-plans-title-02.png";
import packageImageBasic from "../assets/package-image-basic.png";
import packageImagePremium from "../assets/package-image-premium.png";
import packageImageStandard from "../assets/package-image-standard.png";
import { PackageSummaryThumbnail } from "./PackageSummaryThumbnail";

const ROTATION_INTERVAL_MS = 8000;

const PACKAGE_EXPLAIN_IMAGES: Array<{
  tier: PackageTier;
  src: StaticImageData;
  alt: string;
}> = [
  {
    tier: "Basic",
    src: packageExplainWithBasic,
    alt: "베이직 패키지 BOX 설명",
  },
  {
    tier: "Standard",
    src: packageExplainWithStandard,
    alt: "스탠다드 패키지 BOX 설명",
  },
  {
    tier: "Premium",
    src: packageExplainWithPremium,
    alt: "프리미엄 패키지 BOX 설명",
  },
];

const PACKAGE_SUMMARY_ORDER: PackageTier[] = ["Premium", "Basic", "Standard"];

const PACKAGE_SUMMARY_IMAGES: Record<PackageTier, StaticImageData> = {
  Basic: packageImageBasic,
  Standard: packageImageStandard,
  Premium: packageImagePremium,
};

export default function PackagePlansSection() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<PackageTier | null>(null);
  const [rotatingIndex, setRotatingIndex] = useState(0);
  const [apiPlans, setApiPlans] = useState<SubscriptionPlanDto[]>([]);
  const planRatings = usePlanRatings(apiPlans.map((plan) => plan.id));

  const displayTier = selectedTier ?? PACKAGE_SUMMARY_ORDER[rotatingIndex];
  const activePackage = PACKAGE_EXPLAIN_IMAGES.find((img) => img.tier === displayTier) ?? PACKAGE_EXPLAIN_IMAGES[0];
  const activePkg = PACKAGES.find((packageItem) => packageItem.tier === displayTier);
  const activePlan = apiPlans.find((plan) => tierFromSubscriptionPlan(plan) === displayTier);

  useEffect(() => {
    if (selectedTier !== null) return;
    const intervalId = window.setInterval(() => {
      setRotatingIndex((i) => (i + 1) % PACKAGE_SUMMARY_ORDER.length);
    }, ROTATION_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [selectedTier]);

  useEffect(() => {
    getSubscriptionPlans().then((res) => setApiPlans(res.plans)).catch(() => {});
  }, []);

  function handleDetailClick() {
    if (!activePlan) return;
    router.push(`/subscribe/detail?planId=${activePlan.id}`);
  }

  return (
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-content max-md:px-5 md:px-6 lg:px-0">
        {/* 섹션 헤더 */}
        <ScrollReveal variant="fade-up">
          <Image
            src={homePackagePlansTitle}
            alt="우리 아이에게 맞는 간식 선택 후 구독하세요!"
            className="mx-auto h-auto w-full max-w-[300px] md:max-w-[352px]"
            sizes="(min-width: 768px) 352px, 300px"
            priority
          />
        </ScrollReveal>
        <ScrollReveal variant="fade-up" delay={150}>
          <Text
            variant="subtitle-18-m"
            mobileVariant="body-14-m"
            className="mt-4 mb-10 md:mb-12 lg:mb-14 text-center text-[var(--color-text-warm)] max-md:leading-[20px]"
          >
            체크리스트 후 우리 아이에게 적절한{" "}
            <br className="md:hidden lg:hidden" />
            패키지 박스를 추천받을 수 있습니다!
          </Text>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={200}>
          <div className="flex items-stretch justify-center gap-6 max-lg:flex-col max-lg:items-center max-md:gap-[46px] lg:gap-7">
            {/* 모바일 — detail 대표 이미지 + 패키지명·설명·상세보기 버튼 분리 */}
            <div className="w-full max-w-[600px] max-md:block md:hidden lg:hidden">
              <div className="relative w-full">
                <div
                  className="overflow-hidden rounded-[22px]"
                  style={{ boxShadow: "var(--shadow-card-soft)" }}
                >
                  <div className="relative aspect-square w-full bg-[var(--color-surface-warm)]">
                    <Image
                      key={activePackage.tier}
                      src={TIER_DETAIL_HERO_IMAGES[activePackage.tier]}
                      alt={`${activePkg?.name ?? activePackage.tier} 대표 이미지`}
                      fill
                      className="object-cover transition-opacity duration-500"
                      sizes={`${MEDIA_MAX_MD_SIZES} 100vw, 600px`}
                      priority
                    />
                  </div>
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
                    <button
                      type="button"
                      onClick={handleDetailClick}
                      disabled={!activePlan}
                      className="flex h-10 w-[108px] shrink-0 flex-row items-center justify-center self-center rounded-[8px] bg-[var(--color-btn-dark-warm)] text-center text-[14px] font-semibold leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      제품 상세보기
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* 태블릿·데스크탑 — 합성 설명 이미지 + 버튼 오버레이 */}
            <div className="relative w-full max-w-[600px] max-md:hidden">
              <div
                className="relative overflow-hidden rounded-[22px] md:rounded-[28px]"
                style={{ boxShadow: "var(--shadow-card-soft)" }}
              >
                <Image
                  key={activePackage.tier}
                  src={activePackage.src}
                  alt={activePackage.alt}
                  className="h-auto w-full transition-opacity duration-500"
                  sizes="(min-width: 1200px) 600px, calc(100vw - 40px)"
                  priority
                />
                <button
                  type="button"
                  onClick={handleDetailClick}
                  disabled={!activePlan}
                  className="absolute bottom-4 right-4 flex h-10 w-[180px] flex-row items-center justify-center gap-[10px] rounded-[8px] bg-[var(--color-btn-dark-warm)] px-6 py-[13px] text-center text-[14px] font-semibold leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60 lg:bottom-11 lg:right-11"
                >
                  제품 상세보기
                </button>
              </div>
              <PackageNutritionGuide initialTier={displayTier} />
            </div>

            <div className="flex w-full max-w-[600px] flex-col gap-6 lg:h-[556px] lg:w-[386px] lg:max-w-none lg:shrink-0">
              {PACKAGE_SUMMARY_ORDER.map((tier) => {
                const pkg = PACKAGES.find((packageItem) => packageItem.tier === tier)!;
                const img = PACKAGE_SUMMARY_IMAGES[tier];
                const plan = apiPlans.find((p) => tierFromSubscriptionPlan(p) === tier);
                const isSelected = selectedTier !== null && selectedTier === tier;
                const isUnselected = selectedTier !== null && !isSelected;

                return (
                  <button
                    key={tier}
                    type="button"
                    disabled={!plan}
                    onClick={() => setSelectedTier((prev) => (prev === tier ? null : tier))}
                    className="group flex h-[132px] w-full overflow-hidden rounded-2xl border-0 bg-white text-left max-md:shadow-none shadow-sm transition-opacity md:h-[167px] lg:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="relative h-full w-[142px] shrink-0 overflow-hidden rounded-2xl md:w-[180px]">
                      <PackageSummaryThumbnail src={img} alt={pkg.name} />
                      {isUnselected && (
                        <div className="absolute inset-0 z-10 rounded-2xl bg-white/40" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pl-7 pr-4 py-[8px] md:py-[25px] lg:pl-6 lg:pr-0">
                      <p
                        className={[
                          "mb-[14px] truncate text-[17px] leading-[24px] tracking-[-0.04em] md:mb-6 md:text-[20px]",
                          isSelected
                            ? "font-bold text-[var(--color-text-emphasis)]"
                            : "font-semibold text-[var(--color-text-label)]",
                        ].join(" ")}
                      >
                        {plan?.name || pkg.name}
                      </p>
                      {plan ? (
                        <>
                          <div className="mb-[6px] flex flex-wrap items-baseline gap-x-2 gap-y-0">
                            <span className="text-left text-[16px] font-semibold leading-[19px] tracking-[-0.05em] text-[var(--color-cta-button)]">
                              {plan.discountRate}%
                            </span>
                            <span className="text-left text-[16px] font-medium leading-[19px] tracking-[-0.05em] text-[var(--color-text-secondary)] line-through">
                              {plan.originalPrice.toLocaleString("ko-KR")}원
                            </span>
                          </div>
                          <div className="mb-[8px] flex flex-wrap items-baseline gap-x-2 gap-y-0">
                            <span className="text-left text-[16px] font-bold leading-[19px] tracking-[-0.05em] text-[var(--color-text-body-warm)]">
                              월 요금제
                            </span>
                            <span className="text-left text-[20px] font-extrabold leading-[24px] tracking-[-0.05em] text-[var(--color-surface-dark)]">
                              {plan.monthlyPrice.toLocaleString("ko-KR")}원
                            </span>
                          </div>
                          {planRatings[plan.id] > 0 ? (
                            <PlanRatingStars rating={planRatings[plan.id]} size={16} />
                          ) : null}
                        </>
                      ) : (
                        <div className="h-10 animate-pulse rounded bg-[var(--color-text-muted)]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
