"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Text, ScrollReveal, CheckCircleIcon } from "@/shared/ui";
import {
  PACKAGES,
  PackageTier,
  tierFromSubscriptionPlan,
  PACKAGE_SUMMARY_IMAGES,
  PACKAGE_EXPLAIN_BY_TIER,
  PackageSummaryThumbnail,
  PlanRatingStars,
  TIER_DETAIL_HERO_IMAGES,
  useSvgBridge,
} from "@/entities/package";
import { usePlanRatings } from "@/features/review";
import { PackageNutritionGuide } from "@/entities/package";
import { getSubscriptionPlans } from "@/features/subscription/api";
import type { SubscriptionPlanDto } from "@/features/subscription/api";
import homePackagePlansTitle from "../assets/home-package-plans-title-02.png";

const PACKAGE_SUMMARY_ORDER: PackageTier[] = ["Premium", "Basic", "Standard"];

/** 태블릿 하단 가로 카드 노출 순서 — 베이직→스탠다드→프리미엄 */
const TABLET_SUMMARY_ORDER: PackageTier[] = ["Basic", "Standard", "Premium"];

export default function PackagePlansSection() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<PackageTier>(PACKAGE_SUMMARY_ORDER[0]);
  const [apiPlans, setApiPlans] = useState<SubscriptionPlanDto[]>([]);
  const planRatings = usePlanRatings(apiPlans.map((plan) => plan.id));

  const displayTier = selectedTier;
  const activePackage = PACKAGE_EXPLAIN_BY_TIER[displayTier];
  const activePlan = apiPlans.find((plan) => tierFromSubscriptionPlan(plan) === displayTier);
  const activePkg = PACKAGES.find((pkg) => pkg.tier === displayTier);

  const {
    containerRef,
    leftPanelRef,
    cardColumnRef,
    cardRefs,
    tabletCardColumnRef,
    tabletCardRefs,
    svgBg,
  } = useSvgBridge(PACKAGE_SUMMARY_ORDER, displayTier);

  useEffect(() => {
    getSubscriptionPlans().then((res) => setApiPlans(res.plans)).catch(() => {});
  }, []);

  function handleDetailClick() {
    if (!activePlan) return;
    router.push(`/subscribe/detail?planId=${activePlan.id}`);
  }

  return (
    <section className="bg-white py-12 md:py-24 lg:py-20">
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
          <div
            ref={containerRef}
            className="relative flex items-stretch justify-center max-md:flex-col max-md:items-center max-md:gap-[46px] max-lg:flex-col max-lg:gap-0 md:max-w-[600px] md:mx-auto md:gap-1 lg:max-w-none lg:mx-0 lg:gap-1"
          >
            {/* 선택 카드↔왼쪽 패널 연결 SVG 통합 배경 */}
            {svgBg && (
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute z-0 overflow-visible"
                style={{
                  left: svgBg.left,
                  top: svgBg.top,
                  width: svgBg.width,
                  height: svgBg.height,
                  filter: "drop-shadow(0px 4px 8px #00000033)",
                }}
                viewBox={`0 0 ${svgBg.width} ${svgBg.height}`}
              >
                <path d={svgBg.path} fill="white" />
              </svg>
            )}

            {/* 모바일 전용 — 대표 이미지 + 패키지 정보 */}
            <div className="w-full max-w-[600px] max-md:block md:hidden">
              <div
                className="relative w-full rounded-[22px]"
                style={{ boxShadow: "var(--shadow-card-soft)" }}
              >
                <div
                  className="relative aspect-square w-full overflow-hidden rounded-[22px] bg-white"
                  onClick={handleDetailClick}
                  style={{ cursor: activePlan ? "pointer" : undefined }}
                >
                  {activePkg ? (
                    <Image
                      key={displayTier}
                      src={TIER_DETAIL_HERO_IMAGES[displayTier]}
                      alt={`${activePkg.name} 대표 이미지`}
                      fill
                      className="object-cover transition-opacity duration-500"
                      sizes="100vw"
                      priority
                    />
                  ) : null}
                </div>
                <PackageNutritionGuide initialTier={displayTier} bubbleClassName="h-auto w-[100px]" />
              </div>
              {activePkg ? (
                <div className="mt-4">
                  <p
                    className="text-subtitle-17-b-lh22"
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
              <div className="mt-6 flex justify-center gap-3">
                {PACKAGE_SUMMARY_ORDER.map((tier) => {
                  const pkg = PACKAGES.find((p) => p.tier === tier)!;
                  const isActive = displayTier === tier;
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setSelectedTier(tier)}
                      aria-label={`${tier} 패키지 선택`}
                      className="h-3 w-3 rounded-full transition-colors duration-300"
                      style={{ background: isActive ? pkg.colorVar : "var(--color-border)" }}
                    />
                  );
                })}
              </div>
            </div>

            {/* 태블릿·데스크탑 — 합성 설명 이미지 + 버튼 오버레이 */}
            <div
              ref={leftPanelRef}
              className="relative flex-1 min-w-0 max-w-[600px] rounded-[24px] p-6 pr-4 max-md:hidden max-lg:flex-none max-lg:max-w-none max-lg:pr-6"
            >
              {/* 이미지 영역 560×519 비율, overflow-hidden으로 클리핑 */}
              <div
                className="relative w-full overflow-hidden rounded-[16px]"
                style={{ aspectRatio: "560 / 519", cursor: activePlan ? "pointer" : undefined }}
                onClick={handleDetailClick}
              >
                <Image
                  key={displayTier}
                  src={activePackage.src}
                  alt={activePackage.alt}
                  fill
                  className="object-cover transition-opacity duration-500"
                  sizes="(min-width: 1200px) 560px, (min-width: 768px) calc(60vw - 80px), 100vw"
                  priority
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDetailClick(); }}
                  disabled={!activePlan}
                  className="absolute bottom-4 right-4 z-10 flex h-10 w-[180px] flex-row items-center justify-center gap-[10px] rounded-[8px] bg-[var(--color-btn-dark-warm)] px-6 py-[13px] text-center text-[14px] font-semibold leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60 lg:bottom-8 lg:right-8"
                >
                  제품 상세보기
                </button>
              </div>
              {/* NutritionGuide — absolute inset-6 기준으로 이미지 영역 위에 배치 */}
              <div className="pointer-events-none absolute inset-6">
                <div className="relative h-full w-full">
                  <div className="pointer-events-auto">
                    <PackageNutritionGuide initialTier={displayTier} />
                  </div>
                </div>
              </div>
            </div>

            {/* 태블릿·데스크탑 — 패키지 요약 카드 목록 */}
            <div ref={cardColumnRef} className="max-lg:hidden flex w-full flex-col gap-[14px] max-w-[320px] shrink-0 lg:w-[386px] lg:max-w-none pr-1">
              {PACKAGE_SUMMARY_ORDER.map((tier, i) => {
                const pkg = PACKAGES.find((packageItem) => packageItem.tier === tier)!;
                const img = PACKAGE_SUMMARY_IMAGES[tier];
                const plan = apiPlans.find((p) => tierFromSubscriptionPlan(p) === tier);
                const isSelected = selectedTier === tier;

                return (
                  <button
                    key={tier}
                    ref={(el) => { cardRefs.current[i] = el; }}
                    type="button"
                    disabled={!plan}
                    onClick={() => setSelectedTier(tier)}
                    className={[
                      "group relative flex w-full text-left transition-colors duration-300 rounded-[24px] hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60",
                      isSelected ? "h-[207px] flex-none bg-transparent" : "flex-1",
                    ].join(" ")}
                    style={undefined}
                  >
                    <div className={`relative ${isSelected ? "h-[159px] w-[172px]" : "h-[148px] w-[160px]"} shrink-0 self-center overflow-hidden rounded-[16px] bg-white ${isSelected ? "ml-0" : "ml-3"}`}>
                      <PackageSummaryThumbnail src={img} alt={pkg.name} />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-center pl-6 py-5">
                      <p
                        className={[
                          "mb-2 truncate text-[var(--color-text-emphasis)]",
                          isSelected
                            ? "max-md:text-subtitle-17-eb-lh24 md:text-subtitle-20-eb"
                            : "max-md:text-subtitle-17-m-lh24 md:text-subtitle-18-m",
                        ].join(" ")}
                      >
                        {plan?.name || pkg.name}
                      </p>
                      {plan ? (
                        <>
                          <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0">
                            <span className="max-md:text-price-14-sb md:text-price-16-sb text-[var(--color-cta-button)]">
                              {plan.discountRate}%
                            </span>
                            <span className="max-md:text-price-14-r md:text-price-16-r text-[var(--color-text-secondary)] line-through">
                              {plan.originalPrice.toLocaleString("ko-KR")}원
                            </span>
                          </div>
                          <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0">
                            <span className="max-md:text-price-14-b md:text-price-16-b-tight text-[var(--color-text-body-warm)]">
                              월 요금제
                            </span>
                            <span className="max-md:text-price-17-eb md:text-price-20-eb-lh24 text-[var(--color-text-emphasis)]">
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

            {/* 태블릿 전용 — 패키지 요약 카드 하단 가로 배치 */}
            <div
              ref={tabletCardColumnRef}
              className="max-md:hidden md:flex lg:hidden w-full justify-between items-start"
            >
              {TABLET_SUMMARY_ORDER.map((tier) => {
                const i = PACKAGE_SUMMARY_ORDER.indexOf(tier);
                const pkg = PACKAGES.find((packageItem) => packageItem.tier === tier)!;
                const img = PACKAGE_SUMMARY_IMAGES[tier];
                const plan = apiPlans.find((p) => tierFromSubscriptionPlan(p) === tier);
                const isSelected = selectedTier === tier;

                return (
                  <button
                    key={tier}
                    ref={(el) => { tabletCardRefs.current[i] = el; }}
                    type="button"
                    disabled={!plan}
                    onClick={() => setSelectedTier(tier)}
                    className={[
                      "group relative z-[1] flex flex-col items-start text-left rounded-[24px] transition-colors duration-300 hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60",
                      // 선택: 브릿지 흰 배경 위 패딩 / 미선택: 최소 수평 여백 유지
                      isSelected ? "bg-transparent px-[22px] pb-[22px]" : "mt-6 px-2",
                    ].join(" ")}
                  >
                    <div className="relative h-[148px] w-[160px] shrink-0 overflow-hidden rounded-[16px] bg-white">
                      <PackageSummaryThumbnail src={img} alt={pkg.name} />
                    </div>
                    <div className="min-w-0 w-[160px] flex flex-col pt-3">
                      <p
                        className={[
                          "mb-2 truncate text-[var(--color-text-emphasis)]",
                          isSelected ? "text-subtitle-18-b tracking-[-0.04em]" : "text-subtitle-16-sb tracking-[-0.06em]",
                        ].join(" ")}
                      >
                        {plan?.name || pkg.name}
                      </p>
                      {plan ? (
                        <>
                          <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0">
                            <span className="text-price-16-sb text-[var(--color-cta-button)]">
                              {plan.discountRate}%
                            </span>
                            <span className="text-price-16-r text-[var(--color-text-secondary)] line-through">
                              {plan.originalPrice.toLocaleString("ko-KR")}원
                            </span>
                          </div>
                          <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0">
                            <span className="text-price-16-b-tight text-[var(--color-text-body-warm)]">
                              월 요금제
                            </span>
                            <span
                              className={[
                                "text-[var(--color-text-emphasis)]",
                                isSelected ? "text-price-20-eb-lh24" : "text-price-16-eb",
                              ].join(" ")}
                            >
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
