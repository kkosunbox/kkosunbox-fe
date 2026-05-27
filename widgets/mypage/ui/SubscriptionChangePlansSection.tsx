"use client";

import { useMemo, useState, useTransition } from "react";
import Image, { type StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { ScrollReveal } from "@/shared/ui";
import { useLoadingOverlay, useModal } from "@/shared/ui";
import { changePlan } from "@/features/subscription/api/subscriptionApi";
import { getErrorMessage } from "@/shared/lib/api";
import type { UserSubscriptionDto, SubscriptionPlanDto } from "@/features/subscription/api/types";
import SubscriptionChangeHero from "@/widgets/mypage/assets/subscribe-change-hero.png";
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
} from "@/widgets/subscribe/plans/ui/packageData";

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

/* ─── Props ─── */

interface Props {
  subscriptions: UserSubscriptionDto[];
  plans: SubscriptionPlanDto[];
  targetSubscriptionId?: number;
}

/* ─── Main ─── */

export default function SubscriptionChangePlansSection({ subscriptions, plans, targetSubscriptionId }: Props) {
  const router = useRouter();
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [isPending, startTransition] = useTransition();

  const sortedPlans = useMemo(
    () => [...plans].sort(comparePlansForDisplayOrder),
    [plans],
  );

  const [selectedTier, setSelectedTier] = useState<PackageTier>(() =>
    initialSelectedTier(plans),
  );

  const isAddMode = !targetSubscriptionId;

  const targetSubscription = useMemo(
    () => subscriptions.find((s) => s.id === targetSubscriptionId) ?? null,
    [subscriptions, targetSubscriptionId],
  );

  const activePlan = planForTier(sortedPlans, selectedTier);
  const activePkg = PACKAGES.find((p) => p.tier === selectedTier);

  function hasActiveSub(tier: PackageTier): boolean {
    return subscriptions.some((s) => tierFromSubscriptionPlan(s.plan) === tier);
  }

  function isDisabledPlan(tier: PackageTier): boolean {
    if (isAddMode) return false;
    return targetSubscription
      ? tierFromSubscriptionPlan(targetSubscription.plan) === tier
      : false;
  }

  function handlePurchase() {
    if (!activePlan) return;

    if (isAddMode || !targetSubscription) {
      router.push(`/order?planId=${activePlan.id}&quantity=1`);
      return;
    }

    showLoading("플랜 변경을 처리하고 있습니다...");
    startTransition(async () => {
      try {
        await changePlan(targetSubscription.id, { newPlanId: activePlan.id });
        openAlert({
          type: "success",
          title: "플랜이 변경되었습니다.",
          description: "변경 사항은 다음 결제일에 반영됩니다.",
        });
        router.push("/mypage/subscription");
        router.refresh();
      } catch (err) {
        openAlert({
          title: getErrorMessage(err, "플랜 변경 처리 중 오류가 발생했습니다."),
        });
      } finally {
        hideLoading();
      }
    });
  }

  function buttonLabel(): string {
    if (isAddMode) return "구독하기";
    return subscriptions.length > 0 ? "변경하기" : "구매하기";
  }

  const selectedDisabled = isDisabledPlan(selectedTier);

  return (
    <section className="flex min-h-full flex-1 flex-col bg-white pb-16 md:pb-20">
      <div className="flex w-full flex-1 flex-col">
        {/* Hero */}
        <ScrollReveal variant="fade-in" duration={600}>
          <div className="mb-6 md:mb-10 lg:mb-10">
            <div className="relative h-[118px] w-full overflow-hidden max-md:h-[90px]">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                <Image
                  src={SubscriptionChangeHero}
                  alt="기존 구독을 변경하려면 새로운 구독을 선택하세요"
                  className="h-full w-auto max-w-none shrink-0"
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
                {/* 좌측 — 선택된 패키지 설명 이미지 + 액션 버튼 */}
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
                  {selectedDisabled ? (
                    <div className="absolute bottom-4 right-4 flex h-10 w-[180px] items-center justify-center rounded-full text-[14px] font-semibold leading-[150%] tracking-[-0.02em] text-white opacity-70 shadow-md max-md:bottom-3 max-md:right-3 max-md:w-[150px] lg:bottom-11 lg:right-11"
                      style={{ background: activePkg?.colorVar ?? "var(--color-brown-dark)" }}>
                      현재 구독중
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isPending || !activePlan}
                      onClick={handlePurchase}
                      className="absolute bottom-4 right-4 flex h-10 w-[180px] items-center justify-center rounded-[8px] bg-[var(--color-brown-dark)] px-6 text-[14px] font-semibold leading-[150%] tracking-[-0.02em] text-white shadow-md transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60 max-md:bottom-3 max-md:right-3 max-md:w-[150px] max-md:px-4 lg:bottom-11 lg:right-11"
                    >
                      {buttonLabel()}
                    </button>
                  )}
                </div>

                {/* 우측 — 패키지 요약 카드 목록 */}
                <div className="flex w-full max-w-[600px] flex-col gap-6 lg:h-[556px] lg:w-[386px] lg:max-w-none lg:shrink-0">
                  {PACKAGE_SUMMARY_ORDER.map((tier) => {
                    const pkg = PACKAGES.find((p) => p.tier === tier)!;
                    const plan = planForTier(sortedPlans, tier);
                    const img = PACKAGE_SUMMARY_IMAGES[tier];
                    const isActive = hasActiveSub(tier);

                    if (!plan) return null;

                    return (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setSelectedTier(tier)}
                        className="group flex h-[132px] w-full overflow-hidden rounded-2xl bg-white text-left shadow-sm md:h-[167px] lg:shadow-none"
                      >
                        <div className="relative h-full w-[142px] shrink-0 overflow-hidden rounded-2xl md:w-[180px]">
                          <Image
                            src={img}
                            alt={pkg.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="180px"
                          />
                          {isActive && (
                            <>
                              <div
                                className="pointer-events-none absolute inset-0 z-10 rounded-2xl"
                                style={{ boxShadow: `inset 0 0 0 1px ${pkg.colorVar}` }}
                              />
                              <div className="absolute left-3 top-3 z-20">
                                <span className="rounded-full bg-[var(--color-text)] px-3 py-1 text-[14px] font-semibold leading-[17px] text-white">
                                  이용중
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 px-4 py-[18px] md:py-[25px] lg:pl-6 lg:pr-0">
                          <div className="mb-4 md:mb-6">
                            <p className="truncate text-[17px] font-semibold leading-[24px] tracking-[-0.04em] text-[var(--color-text-emphasis)] md:text-[20px]">
                              {pkg.name}
                            </p>
                          </div>
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
  );
}
