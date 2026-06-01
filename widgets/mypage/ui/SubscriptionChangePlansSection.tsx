"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLoadingOverlay, useModal } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import { changePlan } from "@/features/subscription/api/subscriptionApi";
import type { SubscriptionPlanDto, UserSubscriptionDto } from "@/features/subscription/api/types";
import { SubscribePlansSection } from "@/widgets/subscribe/plans";
import { tierFromSubscriptionPlan, type PackageTier } from "@/widgets/subscribe/plans/ui/packageData";
import subscribePlansHeroImageMobile from "@/widgets/subscribe/plans/assets/subscribe-plans-hero-mobi.png";
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

  const initialSelectedTier: PackageTier | undefined = targetSubscription
    ? tierFromSubscriptionPlan(targetSubscription.plan)
    : undefined;

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

  return (
    <SubscribePlansSection
      plans={plans}
      showChecklistRecommend={false}
      initialSelectedTier={initialSelectedTier}
      heroDesktopImage={subscriptionChangeHeroDesktop}
      heroMobileImage={subscribePlansHeroImageMobile}
      heroAlt="기존 구독을 변경하려면 새로운 구독을 선택하세요"
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
  );
}
