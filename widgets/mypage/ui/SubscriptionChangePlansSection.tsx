"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLoadingOverlay, useModal } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import { changePlan } from "@/features/subscription/api/subscriptionApi";
import type { SubscriptionPlanDto, UserSubscriptionDto } from "@/features/subscription/api/types";
import { tierFromSubscriptionPlan } from "@/entities/package";
import {
  PackageComparison,
  PackageShowcaseSection,
  SubscriptionPromoBanner,
} from "@/widgets/package-plans";
import { trackSubscriptionPlanChange } from "@/shared/lib/analytics";

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

    showLoading("구독 변경을 처리하고 있습니다...");
    startTransition(async () => {
      try {
        await changePlan(targetSubscription.id, { newPlanId: plan.id });
        trackSubscriptionPlanChange({ plan_tier: plan.name });
        openAlert({
          type: "success",
          title: "구독이 변경되었습니다.",
          description: "변경 사항은 다음 결제일에 반영됩니다.",
        });
        router.push("/mypage/subscription");
        router.refresh();
      } catch (err) {
        openAlert({ title: getErrorMessage(err, "구독 변경 처리 중 오류가 발생했습니다.") });
      } finally {
        hideLoading();
      }
    });
  }

  return (
    <section className="min-h-full flex-1 bg-white pb-px pt-[var(--header-offset)]">
      <SubscriptionPromoBanner />
      {plans.length === 0 ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 px-6 text-center">
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
        <>
          <PackageShowcaseSection
            plans={plans}
            initialSelectedTier={initialSelectedTier}
            variant="change"
            getPrimaryAction={(plan) => {
              const isCurrent = checkIsCurrentPlan(plan);
              return {
                label: isCurrent ? "현재 구독중" : isChangeMode ? "구독 변경하기" : "구독하기",
                disabled: isPending || isCurrent,
                onClick: () => handlePlanAction(plan),
              };
            }}
          />
          <PackageComparison />
        </>
      )}
    </section>
  );
}
