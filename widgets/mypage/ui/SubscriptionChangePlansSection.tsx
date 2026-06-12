"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ScrollReveal } from "@/shared/ui";
import { useLoadingOverlay, useModal } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import { changePlan } from "@/features/subscription/api/subscriptionApi";
import type { SubscriptionPlanDto, UserSubscriptionDto } from "@/features/subscription/api/types";
import { tierFromSubscriptionPlan } from "@/entities/package";
import { PlanPicker } from "@/widgets/package-plans";
import subscriptionChangeHeroMobile from "../assets/subscription-change-hero-mobile.png";
import subscriptionChangeHeroDesktop from "../assets/subscription-change-hero-desktop.png";

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
    <section className="flex min-h-full flex-1 flex-col bg-white pt-[var(--header-offset)] pb-16 md:pb-20">
      <div className="flex w-full flex-1 flex-col">
        {/* Hero */}
        <ScrollReveal variant="fade-in" duration={600}>
          <div className="mb-6 md:mb-10 lg:mb-10">
            <div className="flex h-[111px] items-center justify-center overflow-hidden md2:hidden">
              <Image
                src={subscriptionChangeHeroMobile}
                alt={heroAlt}
                className="h-[111px] w-full shrink-0 object-cover object-center"
                priority
              />
            </div>
            <div className="max-md2:hidden w-full bg-support-hero-side-bg">
              <div className="relative mx-auto h-[118px] w-full max-w-[1920px] overflow-hidden">
                <Image
                  src={subscriptionChangeHeroDesktop}
                  alt={heroAlt}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  priority
                />
              </div>
            </div>
          </div>
        </ScrollReveal>

        <PlanPicker
          plans={plans}
          initialSelectedTier={initialSelectedTier}
          showSelectedCardHighlight={isChangeMode}
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
      </div>
    </section>
  );
}
