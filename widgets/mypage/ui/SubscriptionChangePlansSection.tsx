"use client";

import { useState, useMemo, useTransition } from "react";
import Image, { type StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { ScrollReveal, CheckCircleIcon } from "@/shared/ui";
import { useLoadingOverlay, useModal } from "@/shared/ui";
import { changePlan } from "@/features/subscription/api/subscriptionApi";
import { getErrorMessage } from "@/shared/lib/api";
import type { UserSubscriptionDto, SubscriptionPlanDto } from "@/features/subscription/api/types";
import SubscriptionChangeHero from "@/widgets/mypage/assets/subscribe-change-hero.png";
import packageImageBasic from "@/widgets/home/package-plans/assets/package-image-basic.png";
import packageImagePremium from "@/widgets/home/package-plans/assets/package-image-premium.png";
import packageImageStandard from "@/widgets/home/package-plans/assets/package-image-standard.png";
import {
  comparePlansForDisplayOrder,
  PACKAGES,
  tierFromSubscriptionPlan,
  type PackageTier,
} from "@/widgets/subscribe/plans/ui/packageData";
import { PackageCompareTable } from "@/widgets/subscribe/plans/ui/PackageDetailView";

const PLAN_DISPLAY_ORDER: PackageTier[] = ["Basic", "Standard", "Premium"];

const PLAN_FEATURES: Record<PackageTier, readonly string[]> = {
  Basic: ["100% 원물 프리미엄 져키", "인공 첨가물 0%", "이중 안심 포장"],
  Standard: ["베이직의 모든 구성 포함", "영양 강화 플러스 져키", "균형 잡힌 영양 설계"],
  Premium: ["휴먼그레이드 프리미엄 져키", "1:1 맞춤 큐레이션", "최상의 재료로 만든 패키지"],
};

const PACKAGE_IMAGES: Record<PackageTier, StaticImageData> = {
  Basic: packageImageBasic,
  Standard: packageImageStandard,
  Premium: packageImagePremium,
};

function formatMonthlyPrice(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}

function planForTier(plans: SubscriptionPlanDto[], tier: PackageTier) {
  return plans.find((p) => tierFromSubscriptionPlan(p) === tier);
}

function InfoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="var(--color-text-secondary)" strokeWidth="2" fill="none" />
      <path d="M12 11V17" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1.2" fill="var(--color-text-secondary)" />
    </svg>
  );
}

interface PlanCardProps {
  tier: PackageTier;
  plan: SubscriptionPlanDto;
  isCurrentPlan: boolean;
  isPending: boolean;
  btnLabel: string;
  onAction: () => void;
}

function PlanCard({ tier, plan, isCurrentPlan, isPending, btnLabel, onAction }: PlanCardProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const pkg = PACKAGES.find((p) => p.tier === tier)!;
  const img = PACKAGE_IMAGES[tier];
  const isPremium = tier === "Premium";

  return (
    <div
      className={[
        "relative flex w-full max-w-[327px] flex-col overflow-hidden rounded-[20px] bg-[var(--color-background)]",
        isPremium ? "border-[3px] border-[var(--color-premium)]" : "",
      ].join(" ")}
    >
      {/* Image area */}
      <div className="relative aspect-[327/252] w-full overflow-hidden rounded-t-[17px]">
        <Image src={img} alt={pkg.name} fill className="object-cover" sizes="327px" />

        {isCurrentPlan && (
          <div className="absolute left-5 top-5 z-10">
            <span className="rounded-full bg-[var(--color-text)] px-3 py-1 text-[14px] font-semibold leading-[17px] text-white">
              이용중
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          aria-label="영양정보 확인"
          className="absolute right-5 top-5 z-10 transition-opacity hover:opacity-70 active:opacity-50"
        >
          <InfoIcon />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-7 pb-7 pt-6">
        <p className="mb-3 text-[20px] font-bold leading-[24px] tracking-[-0.04em] text-[var(--color-text-emphasis)]">
          {pkg.name}
        </p>

        <div className="mb-[30px] flex flex-col gap-[10px]">
          {PLAN_FEATURES[tier].map((feature) => (
            <div key={feature} className="flex items-center gap-3">
              <CheckCircleIcon color={pkg.colorVar} />
              <span className="text-[13px] font-medium leading-[16px] text-[var(--color-text)]">
                {feature}
              </span>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-col gap-1">
          <p className="text-[16px] font-bold leading-[19px] tracking-[-0.05em] text-[var(--color-text-body-warm)]">
            월 요금제
          </p>
          <div className="flex flex-wrap items-baseline gap-x-[6px] gap-y-0.5">
            <span className="text-[16px] font-semibold leading-[19px] tracking-[-0.05em] text-[var(--color-text-discount)]">
              {plan.discountRate}%
            </span>
            <span className="text-[20px] font-extrabold leading-[24px] tracking-[-0.05em] text-[var(--color-text-price)]">
              {formatMonthlyPrice(plan.monthlyPrice)}
            </span>
            <span className="text-[16px] font-semibold leading-[19px] tracking-[-0.05em] text-[var(--color-text-secondary)] line-through">
              {formatMonthlyPrice(plan.originalPrice)}
            </span>
          </div>
        </div>

        {isCurrentPlan ? (
          <div className="flex h-12 w-full items-center justify-center rounded-[8px] bg-[var(--color-text-secondary)] text-[16px] font-semibold leading-[150%] tracking-[-0.02em] text-white">
            현재 구독중
          </div>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={onAction}
            className="flex h-12 w-full items-center justify-center rounded-[8px] bg-[var(--color-btn-dark-warm)] text-[16px] font-semibold leading-[150%] tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {btnLabel}
          </button>
        )}
      </div>

      {infoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setInfoOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-[520px] overflow-auto rounded-[20px] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <PackageCompareTable initialTier={tier} onClose={() => setInfoOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
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

  const sortedPlans = useMemo(() => [...plans].sort(comparePlansForDisplayOrder), [plans]);

  const isAddMode = !targetSubscriptionId;

  const targetSubscription = useMemo(
    () => subscriptions.find((s) => s.id === targetSubscriptionId) ?? null,
    [subscriptions, targetSubscriptionId],
  );

  function isCurrentPlan(tier: PackageTier): boolean {
    if (isAddMode) return false;
    return targetSubscription ? tierFromSubscriptionPlan(targetSubscription.plan) === tier : false;
  }

  function handleAction(tier: PackageTier) {
    const plan = planForTier(sortedPlans, tier);
    if (!plan) return;

    if (isAddMode || !targetSubscription) {
      router.push(`/order?planId=${plan.id}&quantity=1`);
      return;
    }

    showLoading("플랜 변경을 처리하고 있습니다...");
    startTransition(async () => {
      try {
        await changePlan(targetSubscription.id, { newPlanId: plan.id });
        openAlert({
          type: "success",
          title: "플랜이 변경되었습니다.",
          description: "변경 사항은 다음 결제일에 반영됩니다.",
        });
        router.push("/mypage/subscription");
        router.refresh();
      } catch (err) {
        openAlert({ title: getErrorMessage(err, "플랜 변경 처리 중 오류가 발생했습니다.") });
      } finally {
        hideLoading();
      }
    });
  }

  function btnLabel(): string {
    if (isAddMode) return "구독하기";
    return subscriptions.length > 0 ? "변경하기" : "구매하기";
  }

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
              <div className="flex items-start justify-center gap-4 max-lg:flex-col max-lg:items-center">
                {PLAN_DISPLAY_ORDER.map((tier) => {
                  const plan = planForTier(sortedPlans, tier);
                  if (!plan) return null;

                  return (
                    <PlanCard
                      key={tier}
                      tier={tier}
                      plan={plan}
                      isCurrentPlan={isCurrentPlan(tier)}
                      isPending={isPending}
                      btnLabel={btnLabel()}
                      onAction={() => handleAction(tier)}
                    />
                  );
                })}
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  );
}
