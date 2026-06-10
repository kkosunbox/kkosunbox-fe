"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

type SvgBgData = {
  left: number;
  top: number;
  width: number;
  height: number;
  path: string;
} | null;

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
  /** false면 우측 카드 선택 배경 강조 미표시 */
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

  // Bridge refs
  const containerRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const cardColumnRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([null, null, null]);
  const [svgBg, setSvgBg] = useState<SvgBgData>(null);

  function handleClose() { setIsDismissed(true); }
  function handleConfirm() { setIsDismissed(true); router.push("/checklist"); }

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

  const updateSvgBg = useCallback(() => {
    const container = containerRef.current;
    const leftPanel = leftPanelRef.current;
    const cardColumn = cardColumnRef.current;
    if (!container || !leftPanel || !cardColumn) { setSvgBg(null); return; }

    const tierIndex = PACKAGE_SUMMARY_ORDER.indexOf(displayTier);
    const card = cardRefs.current[tierIndex];
    if (!card) { setSvgBg(null); return; }

    const cRect = container.getBoundingClientRect();
    const lpRect = leftPanel.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const colRect = cardColumn.getBoundingClientRect();

    if (lpRect.width < 10) { setSvgBg(null); return; }

    const gapWidth = colRect.left - lpRect.right;
    if (gapWidth < 4) { setSvgBg(null); return; }

    const R = 24;
    const FLUSH_THRESHOLD = R;
    const lpW = lpRect.width;
    const lpH = lpRect.height;
    const cardH = cardRect.height;
    const cardLocalTop = cardRect.top - lpRect.top;
    const cardLocalBottom = cardLocalTop + cardH;
    const totalW = colRect.right - lpRect.left;
    const totalH = Math.max(lpH, cardLocalBottom);

    const isTopFlush = cardLocalTop <= FLUSH_THRESHOLD;
    const isBottomFlush = cardLocalBottom >= lpH - FLUSH_THRESHOLD;

    const parts: string[] = [];

    if (isTopFlush) {
      parts.push(`M ${R} 0`);
      parts.push(`L ${totalW - R} 0`);
      parts.push(`a ${R} ${R} 0 0 1 ${R} ${R}`);
    } else {
      parts.push(`M ${R} 0`);
      parts.push(`L ${lpW - R} 0`);
      parts.push(`a ${R} ${R} 0 0 1 ${R} ${R}`);
      parts.push(`L ${lpW} ${cardLocalTop - R}`);
      parts.push(`a ${R} ${R} 0 0 0 ${R} ${R}`);
      parts.push(`L ${totalW - R} ${cardLocalTop}`);
      parts.push(`a ${R} ${R} 0 0 1 ${R} ${R}`);
    }

    parts.push(`L ${totalW} ${cardLocalBottom - R}`);

    if (isBottomFlush) {
      parts.push(`a ${R} ${R} 0 0 1 ${-R} ${R}`);
      parts.push(`L ${R} ${totalH}`);
      parts.push(`a ${R} ${R} 0 0 1 ${-R} ${-R}`);
    } else {
      parts.push(`a ${R} ${R} 0 0 1 ${-R} ${R}`);
      parts.push(`L ${lpW + R} ${cardLocalBottom}`);
      parts.push(`a ${R} ${R} 0 0 0 ${-R} ${R}`);
      parts.push(`L ${lpW} ${lpH - R}`);
      parts.push(`a ${R} ${R} 0 0 1 ${-R} ${R}`);
      parts.push(`L ${R} ${lpH}`);
      parts.push(`a ${R} ${R} 0 0 1 ${-R} ${-R}`);
    }

    parts.push(`L 0 ${R}`);
    parts.push(`a ${R} ${R} 0 0 1 ${R} ${-R}`);
    parts.push(`Z`);

    setSvgBg({
      left: lpRect.left - cRect.left,
      top: lpRect.top - cRect.top,
      width: totalW,
      height: totalH,
      path: parts.join(' '),
    });
  }, [displayTier]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useLayoutEffect(() => { updateSvgBg(); }, [updateSvgBg]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateSvgBg);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateSvgBg]);

  return (
    <>
      {showModal && <ChecklistRecommendModal onClose={handleClose} onConfirm={handleConfirm} />}

      <section className="flex min-h-full flex-1 flex-col bg-white pt-[var(--header-offset)] pb-16 md:pb-20">
        <div className="flex w-full flex-1 flex-col">
          {/* Hero */}
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
                <div
                  ref={containerRef}
                  className="relative flex items-stretch justify-center max-md:flex-col max-md:items-center max-md:gap-[46px] md:gap-1 lg:gap-1"
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
                      <path d={svgBg.path} fill="var(--color-surface-warm)" />
                    </svg>
                  )}

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
                            <span className="rounded-full bg-[var(--color-text)] px-3 py-1 text-body-14-sb-tight text-white">
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
                          {renderPrimaryAction(
                            "flex h-10 w-[108px] shrink-0 items-center justify-center self-center rounded-[8px] text-center text-body-14-sb tracking-[-0.02em]",
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* 태블릿·데스크탑 — 선택된 패키지 설명 */}
                  <div
                    ref={leftPanelRef}
                    className="relative flex-1 min-w-0 max-w-[608px] rounded-[24px] p-6 max-md:hidden"
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
                      {activePkg ? (
                        <Image
                          key={displayTier}
                          src={activeExplain.src}
                          alt={activeExplain.alt}
                          fill
                          className="object-cover transition-opacity duration-500"
                          sizes="(min-width: 1200px) 560px, (min-width: 768px) calc(60vw - 80px), 100vw"
                          priority
                        />
                      ) : null}
                      {activeIsCurrentPlan ? (
                        <div className="absolute left-4 top-4 z-10">
                          <span className="rounded-full bg-[var(--color-text)] px-3 py-1 text-body-14-sb-tight text-white">
                            이용중
                          </span>
                        </div>
                      ) : null}
                      <div className="absolute bottom-4 right-4 z-10">
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

                  {/* 우측 — 패키지 요약 카드 목록 */}
                  <div ref={cardColumnRef} className="flex w-full flex-col gap-[14px] max-w-[320px] shrink-0 lg:w-[386px] lg:max-w-none pr-5">
                    {PACKAGE_SUMMARY_ORDER.map((tier, i) => {
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
                          ref={(el) => { cardRefs.current[i] = el; }}
                          type="button"
                          aria-pressed={showSelectionState ? isSelected : undefined}
                          onClick={() => setSelectedTier((prev) => (prev === tier ? null : tier))}
                          className={[
                            "group relative flex w-full text-left transition-colors duration-300 rounded-[24px] hover:opacity-90 active:opacity-80",
                            showSelectionState && isSelected ? "h-[207px] flex-none bg-transparent" : "flex-1",
                          ].join(" ")}
                        >
                          <div className={`relative ${isSelected ? "h-[167px] w-[180px]" : "h-[148px] w-[160px]"} shrink-0 self-center overflow-hidden rounded-[16px] bg-[var(--color-surface-warm)] ${isSelected ? "ml-0" : "ml-3"}`}>
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
                                "mb-2 truncate max-md:text-subtitle-17-b-lh24 md:text-subtitle-20-b",
                                isSelected
                                  ? "font-extrabold text-[var(--color-text-emphasis)]"
                                  : "font-medium text-[var(--color-text-emphasis)]",
                              ].join(" ")}
                            >
                              {plan.name || pkg.name}
                            </p>
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
