"use client";
/* eslint-disable @next/next/no-img-element -- 히어로 이미지는 고해상도 원본 유지가 필요해 Next/Image 미사용 */

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ScrollReveal } from "@/shared/ui";
import { useLoadingOverlay, useModal } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import { changePlan } from "@/features/subscription/api/subscriptionApi";
import type { SubscriptionPlanDto, UserSubscriptionDto } from "@/features/subscription/api/types";
import { tierFromSubscriptionPlan } from "@/entities/package";
import { PlanPicker } from "@/widgets/package-plans";
import subscriptionChangeHeroMobile from "../assets/subscription-change-hero-mobile-renewal.webp";
import subscriptionChangeHeroDesktop from "../assets/subscription-change-hero-desktop-renewal.webp";

interface Props {
  plans: SubscriptionPlanDto[];
  targetSubscription: UserSubscriptionDto | null;
}

export default function SubscriptionChangePlansSection({
  plans,
  targetSubscription,
}: Props) {
  const router = useRouter();
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [isPending, startTransition] = useTransition();

  const isChangeMode = targetSubscription !== null;

  const initialSelectedTier = targetSubscription
    ? tierFromSubscriptionPlan(targetSubscription.plan)
    : null;

  function checkIsCurrentPlan(plan: SubscriptionPlanDto) {
    if (!targetSubscription) return false;
    return tierFromSubscriptionPlan(targetSubscription.plan) === tierFromSubscriptionPlan(plan);
  }

  function handlePlanAction(plan: SubscriptionPlanDto) {
    if (!targetSubscription) {
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

  const heroAlt = "기존 구독을 변경하려면 새로운 구독을 선택하세요";

  return (
    <section className="flex min-h-full flex-1 flex-col bg-white pb-16 md:pb-20">
      <div className="flex w-full flex-1 flex-col">
        {/* Hero */}
        <ScrollReveal variant="fade-in" duration={600}>
          <div className="max-md2:mb-1">
            <div className="flex h-[calc(156px+var(--banner-height))] items-end overflow-hidden md2:hidden">
              <img
                src={subscriptionChangeHeroMobile.src}
                alt={heroAlt}
                className="h-[156px] w-full shrink-0 object-cover object-center"
              />
            </div>
            <div className="max-md2:hidden relative w-full h-[306px]">
              <div className="absolute inset-x-0 top-0 h-[256px] w-full bg-support-hero-side-bg" />
              <div className="relative mx-auto h-[306px] w-full max-w-[1920px] overflow-hidden">
                <img
                  src={subscriptionChangeHeroDesktop.src}
                  alt={heroAlt}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </ScrollReveal>

        {plans.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
            <p className="text-body-16-m text-[var(--color-text-secondary)]">
              잠시 후 다시 시도해 주세요.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-body-14-sb text-[var(--color-accent)] underline underline-offset-2"
            >
              새로고침
            </button>
          </div>
        ) : (
          <PlanPicker
            plans={plans}
            initialSelectedTier={initialSelectedTier}
            isCurrentPlan={checkIsCurrentPlan}
            getPrimaryButton={(plan) => {
              const isCurrent = checkIsCurrentPlan(plan);
              return {
                label: isCurrent ? "현재 구독중" : isChangeMode ? "변경하기" : "구독하기",
                disabled: isPending || isCurrent,
                onClick: () => handlePlanAction(plan),
              };
            }}
          />
        )}
      </div>
    </section>
  );
}
