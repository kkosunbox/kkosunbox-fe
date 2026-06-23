"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { ScrollReveal, CheckCircleIcon } from "@/shared/ui";
import { MEDIA_MAX_MD_SIZES } from "@/shared/config/breakpoints";
import {
  comparePlansForDisplayOrder,
  PACKAGES,
  tierFromSubscriptionPlan,
  PACKAGE_SUMMARY_IMAGES,
  PACKAGE_EXPLAIN_BY_TIER,
  PackageSummaryThumbnail,
  PlanRatingStars,
  TIER_DETAIL_HERO_IMAGES,
  useSvgBridge,
  PackageNutritionGuide,
  type PackageTier,
} from "@/entities/package";
import { usePlanRatings } from "@/features/review";
import { useReferralPricing } from "@/features/referral/model";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";

/** 태블릿 하단 가로 카드 노출 순서 — 베이직→스탠다드→프리미엄 (home과 동일) */
const TABLET_SUMMARY_ORDER: PackageTier[] = ["Basic", "Standard", "Premium"];

/** 데스크탑 카드 열·모바일 네비 기본 순서 — 모듈 상수로 고정해 useSvgBridge 무한 루프 방지 */
const DEFAULT_SUMMARY_ORDER: PackageTier[] = ["Premium", "Standard", "Basic"];

/** 이미지 blur+opacity crossfade에 사용할 전체 티어 목록 */
const ALL_TIERS: PackageTier[] = ["Premium", "Standard", "Basic"];

function formatMonthlyPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

/** 이미지 전환 인라인 스타일 — blur focus-in + 비대칭 타이밍 */
function crossfadeStyle(isActive: boolean): React.CSSProperties {
  return {
    opacity: isActive ? 1 : 0,
    filter: isActive ? "blur(0px)" : "blur(20px)",
    transition: isActive
      ? "opacity 520ms cubic-bezier(0.16, 1, 0.3, 1), filter 660ms cubic-bezier(0.16, 1, 0.3, 1)"
      : "opacity 200ms ease, filter 200ms ease",
  };
}

/** 모바일 좌우 네비 버튼용 셰브론 */
function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={direction === "left" ? "-ml-0.5" : "ml-0.5"}
    >
      <path
        d={direction === "left" ? "M15 6L9 12L15 18" : "M9 6L15 12L9 18"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function planForTier(plans: SubscriptionPlanDto[], tier: PackageTier) {
  return plans.find((p) => tierFromSubscriptionPlan(p) === tier);
}

/** 모바일 패키지 선택 도트 — 재탭 시 onTierSelect가 primary 버튼과 동일 동작 */
export function PlanTierDots({
  tier,
  order,
  onTierSelect,
}: {
  tier: PackageTier;
  order: PackageTier[];
  onTierSelect: (tier: PackageTier) => void;
}) {
  return (
    <div className="mt-6 flex justify-center gap-3">
      {order.map((t) => {
        const pkg = PACKAGES.find((p) => p.tier === t)!;
        const isActive = tier === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => onTierSelect(t)}
            aria-label={`${t} 패키지 선택`}
            aria-pressed={isActive}
            className="h-3 w-3 rounded-full transition-colors duration-300"
            style={{ background: isActive ? pkg.colorVar : "var(--color-border)" }}
          />
        );
      })}
    </div>
  );
}

export interface PrimaryButtonConfig {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export interface PlanPickerProps {
  plans: SubscriptionPlanDto[];
  initialSelectedTier?: PackageTier | null;
  isCurrentPlan?: (plan: SubscriptionPlanDto) => boolean;
  /** false면 데스크탑 카드 선택 배경·높이 강조 미표시 */
  showSelectedCardHighlight?: boolean;
  /** false이면 plans 로딩 중 — plan 없는 슬롯에 pulse 애니메이션 표시. true(기본값)이면 로딩 완료 — 정적 플레이스홀더 표시 */
  plansReady?: boolean;
  getPrimaryButton: (plan: SubscriptionPlanDto) => PrimaryButtonConfig;
  /** 데스크탑 카드 열·모바일 네비 순서. 기본값: ["Premium", "Standard", "Basic"] */
  summaryOrder?: PackageTier[];
  /** 모바일(<768px) 슬롯. 제공 시 기본 셰브론+도트 네비를 대체한다. onTierSelect는 재탭 시 primary 버튼과 동일 동작. */
  mobileSlot?: (tier: PackageTier, onTierSelect: (tier: PackageTier) => void, order: PackageTier[]) => ReactNode;
}

export default function PlanPicker({
  plans,
  initialSelectedTier = null,
  isCurrentPlan,
  showSelectedCardHighlight = true,
  plansReady = true,
  getPrimaryButton,
  summaryOrder = DEFAULT_SUMMARY_ORDER,
  mobileSlot,
}: PlanPickerProps) {
  const sortedPlans = useMemo(
    () => [...plans].sort(comparePlansForDisplayOrder),
    [plans],
  );
  const planRatings = usePlanRatings(sortedPlans.map((plan) => plan.id));

  const [selectedTier, setSelectedTier] = useState<PackageTier>(
    initialSelectedTier ?? summaryOrder[0],
  );

  /** 왼쪽 패널 렌더링용 — 항상 선택된 tier 표시 (미선택 상태 없음) */
  const displayTier = selectedTier;

  const activePlan = planForTier(sortedPlans, displayTier);

  // 레퍼럴 쿠키 보유 시 할인가가 계산되어 대기한다 (UI 변경 없음 — 선 배선).
  // 디자인 확정 후 아래를 JSX 가격 표시에 적용:
  // - referralPrice(plan.monthlyPrice) → formatMonthlyPrice(plan.monthlyPrice) 대체
  // - combinedDiscountPct(plan)        → plan.discountRate 대체
  // - isReferral                       → 레퍼럴 배지 조건부 표시
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const { referralPrice, combinedDiscountPct, additionalDiscountPct, isReferral } =
    useReferralPricing();
  /* eslint-enable @typescript-eslint/no-unused-vars */

  const activePkg = PACKAGES.find((p) => p.tier === displayTier);
  const activeIsCurrentPlan = activePlan ? (isCurrentPlan?.(activePlan) ?? false) : false;

  const {
    containerRef,
    leftPanelRef,
    cardColumnRef,
    cardRefs,
    tabletCardColumnRef,
    tabletCardRefs,
    svgBg,
  } = useSvgBridge(summaryOrder, displayTier);

  /** 모바일 — 이전(-1)/다음(+1) 패키지로 이동 */
  function goToTier(direction: -1 | 1) {
    const len = summaryOrder.length;
    const idx = summaryOrder.indexOf(displayTier);
    const nextIdx = (idx + direction + len) % len;
    setSelectedTier(summaryOrder[nextIdx]);
  }

  const activePrimaryButton = activePlan ? getPrimaryButton(activePlan) : null;

  function handlePrimaryClick() {
    if (!activePlan) return;
    const primaryButton = getPrimaryButton(activePlan);
    if (primaryButton.disabled) return;
    primaryButton.onClick();
  }

  /** 미선택 tier → 선택. 이미 선택된 카드 재클릭 → primary 버튼과 동일 동작 */
  function handleTierSelect(tier: PackageTier) {
    if (selectedTier === tier) {
      handlePrimaryClick();
      return;
    }
    setSelectedTier(tier);
  }

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

  // 기본 선택 티어 — priority 이미지 결정용
  const defaultTier = initialSelectedTier ?? summaryOrder[0];

  return (
    <div className="mx-auto w-full max-w-content max-md:px-5 md:px-6 lg:px-0">
      <ScrollReveal variant="fade-up" delay={150}>
        <div
          ref={containerRef}
          className="relative flex items-stretch justify-center max-md:flex-col max-md:items-center max-md:gap-[46px] max-lg:flex-col max-lg:gap-0 md:max-w-[600px] md:mx-auto md:gap-1 lg:max-w-none lg:mx-0 lg:gap-1"
        >
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

          {/* 모바일 — 대표 이미지 + 네비 + 선택 패키지 정보 */}
          <div className="w-full max-w-[600px] max-md:block md:hidden lg:hidden">
            {mobileSlot ? (
              mobileSlot(displayTier, handleTierSelect, summaryOrder)
            ) : (
              <>
                <div
                  className="relative w-full rounded-[22px]"
                  style={{ boxShadow: "var(--shadow-card-soft)" }}
                >
                  <div
                    className="relative aspect-square w-full overflow-hidden rounded-[22px] bg-white"
                    onClick={handlePrimaryClick}
                    style={{ cursor: activePrimaryButton && !activePrimaryButton.disabled ? "pointer" : undefined }}
                  >
                    {ALL_TIERS.map((tier) => {
                      const pkg = PACKAGES.find((p) => p.tier === tier);
                      return (
                        <Image
                          key={tier}
                          src={TIER_DETAIL_HERO_IMAGES[tier]}
                          alt={`${pkg?.name ?? tier} 대표 이미지`}
                          fill
                          className="object-cover"
                          sizes={`${MEDIA_MAX_MD_SIZES} 100vw, 600px`}
                          priority={tier === defaultTier}
                          style={crossfadeStyle(displayTier === tier)}
                        />
                      );
                    })}
                    {activeIsCurrentPlan ? (
                      <div className="absolute left-4 top-4 z-10">
                        <span className="rounded-full bg-[var(--color-text)] px-3 py-1 text-body-14-sb-tight text-white">
                          이용중
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* 좌우 네비 — 이전/다음 패키지 (이미지 세로 중앙) */}
                  <button
                    type="button"
                    aria-label="이전 패키지"
                    onClick={() => goToTier(-1)}
                    className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-text)]/40 text-white backdrop-blur-sm transition-opacity hover:opacity-90 active:opacity-80"
                  >
                    <ChevronIcon direction="left" />
                  </button>
                  <button
                    type="button"
                    aria-label="다음 패키지"
                    onClick={() => goToTier(1)}
                    className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-text)]/40 text-white backdrop-blur-sm transition-opacity hover:opacity-90 active:opacity-80"
                  >
                    <ChevronIcon direction="right" />
                  </button>

                  <PackageNutritionGuide
                    initialTier={displayTier}
                    bubbleClassName="h-auto w-[100px]"
                  />
                </div>

                {activePkg ? (
                  <div className="mt-4">
                    <p
                      className="text-subtitle-17-b-lh22"
                      style={{ color: activePkg.colorVar }}
                    >
                      {activePkg.name}
                    </p>
                    <ul className="mt-3 flex flex-col gap-2">
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

                    {activePlan ? (
                      <div className="mt-4 border-t border-[var(--color-border-light)] pt-4">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="text-price-16-b-tight text-[var(--color-text-body-warm)]">
                            월 요금제
                          </span>
                          <span className="text-price-16-sb text-[var(--color-cta-button)]">
                            {activePlan.discountRate}%
                          </span>
                          <span className="text-price-16-r text-[var(--color-text-secondary)] line-through">
                            {formatMonthlyPrice(activePlan.originalPrice)}
                          </span>
                          <span className="ml-auto text-price-20-eb-lh24 text-[var(--color-text-emphasis)]">
                            {formatMonthlyPrice(activePlan.monthlyPrice)}
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {renderPrimaryAction(
                      "mt-4 flex h-12 w-full items-center justify-center rounded-[8px] text-center text-body-14-sb tracking-[-0.02em]",
                    )}
                  </div>
                ) : null}
                <PlanTierDots
                  tier={displayTier}
                  order={summaryOrder}
                  onTierSelect={handleTierSelect}
                />
              </>
            )}
          </div>

          {/* 태블릿·데스크탑 — 선택된 패키지 설명 */}
          <div
            ref={leftPanelRef}
            className="relative flex-1 min-w-0 max-w-[600px] rounded-[24px] p-6 pr-4 max-md:hidden max-lg:flex-none max-lg:max-w-none max-lg:pr-6"
          >
            {/* 이미지 영역 560×519 비율, overflow-hidden으로 클리핑 */}
            <div
              className="relative w-full overflow-hidden rounded-[16px]"
              style={{
                aspectRatio: "560 / 519",
                cursor: activePrimaryButton && !activePrimaryButton.disabled ? "pointer" : undefined,
              }}
              onClick={handlePrimaryClick}
            >
              {ALL_TIERS.map((tier) => {
                const explain = PACKAGE_EXPLAIN_BY_TIER[tier];
                return (
                  <Image
                    key={tier}
                    src={explain.src}
                    alt={explain.alt}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1200px) 560px, (min-width: 768px) calc(60vw - 80px), 100vw"
                    priority={tier === defaultTier}
                    style={crossfadeStyle(displayTier === tier)}
                  />
                );
              })}
              {activeIsCurrentPlan ? (
                <div className="absolute left-4 top-4 z-10">
                  <span className="rounded-full bg-[var(--color-text)] px-3 py-1 text-body-14-sb-tight text-white">
                    이용중
                  </span>
                </div>
              ) : null}
              {/* 버튼: 태블릿 bottom-4 right-4 / 데스크탑 bottom-8 right-8 */}
              <div className="absolute bottom-4 right-4 z-10 lg:bottom-8 lg:right-8">
                {renderPrimaryAction(
                  "flex h-10 w-[180px] flex-row items-center justify-center gap-[10px] rounded-[8px] px-6 py-[13px] text-center text-[14px] font-semibold leading-[150%] tracking-[-0.02em]",
                )}
              </div>
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

          {/* 우측 — 패키지 요약 카드 목록 (데스크탑 전용) */}
          <div ref={cardColumnRef} className="max-lg:hidden lg:flex w-full flex-col gap-[14px] max-w-[320px] shrink-0 lg:w-[386px] lg:max-w-none pr-4">
            {summaryOrder.map((tier, i) => {
              const pkg = PACKAGES.find((p) => p.tier === tier)!;
              const plan = planForTier(sortedPlans, tier);
              const img = PACKAGE_SUMMARY_IMAGES[tier];
              const isSelected = selectedTier === tier;
              const showSelectionState = showSelectedCardHighlight;
              const isPlanCurrent = plan ? (isCurrentPlan?.(plan) ?? false) : false;

              return (
                <button
                  key={tier}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  type="button"
                  disabled={!plan}
                  aria-pressed={showSelectionState ? isSelected : undefined}
                  onClick={() => handleTierSelect(tier)}
                  className={[
                    "group relative flex w-full text-left rounded-[24px] hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60",
                    showSelectionState && isSelected ? "h-[207px] flex-none bg-transparent" : "flex-1",
                  ].join(" ")}
                >
                  <div className={`relative ${isSelected ? "h-[159px] w-[172px]" : "h-[148px] w-[160px]"} shrink-0 self-center overflow-hidden rounded-[16px] bg-white ${isSelected ? "ml-0" : "ml-3"}`}>
                    <PackageSummaryThumbnail src={img} alt={pkg.name} />
                    {isPlanCurrent ? (
                      <div className="absolute left-3 top-3 z-10 md:left-4 md:top-4">
                        <span className="rounded-full bg-[var(--color-text)] px-2.5 py-0.5 text-[12px] font-semibold leading-[15px] text-white md:px-3 md:py-1 md:text-[14px] md:leading-[17px]">
                          이용중
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 flex flex-col justify-center pl-6 py-5">
                    <p
                      className={[
                        "mb-2 truncate text-[var(--color-text-emphasis)]",
                        isSelected
                          ? "max-md:text-subtitle-17-eb-lh24 md:text-subtitle-18-eb"
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
                            {formatMonthlyPrice(plan.originalPrice)}
                          </span>
                        </div>
                        <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0">
                          <span className="max-md:text-price-14-b md:text-price-16-b-tight text-[var(--color-text-body-warm)]">
                            월 요금제
                          </span>
                          <span className="max-md:text-price-17-eb md:text-price-20-eb-lh24 text-[var(--color-text-emphasis)]">
                            {formatMonthlyPrice(plan.monthlyPrice)}
                          </span>
                        </div>
                        {planRatings[plan.id] > 0 ? (
                          <PlanRatingStars rating={planRatings[plan.id]} size={16} />
                        ) : null}
                      </>
                    ) : (
                      <div className={`h-10 rounded bg-[var(--color-text-muted)] ${plansReady ? "opacity-30" : "animate-pulse"}`} />
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
              const i = summaryOrder.indexOf(tier);
              const pkg = PACKAGES.find((p) => p.tier === tier)!;
              const plan = planForTier(sortedPlans, tier);
              const img = PACKAGE_SUMMARY_IMAGES[tier];
              const isSelected = selectedTier === tier;
              const isPlanCurrent = plan ? (isCurrentPlan?.(plan) ?? false) : false;

              return (
                <button
                  key={tier}
                  ref={(el) => { tabletCardRefs.current[i] = el; }}
                  type="button"
                  disabled={!plan}
                  aria-pressed={isSelected}
                  onClick={() => handleTierSelect(tier)}
                  className={[
                    "group relative z-[1] flex flex-col items-start text-left rounded-[24px] hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60",
                    isSelected ? "bg-transparent px-[22px] pb-[22px]" : "mt-6 px-2",
                  ].join(" ")}
                >
                  <div className="relative h-[148px] w-[160px] shrink-0 overflow-hidden rounded-[16px] bg-white">
                    <PackageSummaryThumbnail src={img} alt={pkg.name} />
                    {isPlanCurrent ? (
                      <div className="absolute left-3 top-3 z-10 md:left-4 md:top-4">
                        <span className="rounded-full bg-[var(--color-text)] px-2.5 py-0.5 text-[12px] font-semibold leading-[15px] text-white md:px-3 md:py-1 md:text-[14px] md:leading-[17px]">
                          이용중
                        </span>
                      </div>
                    ) : null}
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
                            {formatMonthlyPrice(plan.originalPrice)}
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
                            {formatMonthlyPrice(plan.monthlyPrice)}
                          </span>
                        </div>
                        {planRatings[plan.id] > 0 ? (
                          <PlanRatingStars rating={planRatings[plan.id]} size={16} />
                        ) : null}
                      </>
                    ) : (
                      <div className={`h-10 rounded bg-[var(--color-text-muted)] ${plansReady ? "opacity-30" : "animate-pulse"}`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
