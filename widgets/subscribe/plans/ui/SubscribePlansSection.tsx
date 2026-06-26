"use client";
/* eslint-disable @next/next/no-img-element -- 히어로 이미지는 고해상도 원본 유지가 필요해 Next/Image 미사용 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChecklistRecommendModal, ScrollReveal } from "@/shared/ui";
import { openChecklistForm } from "@/shared/lib/checklistModal";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { hasChecklistAnswers } from "@/features/profile/lib/profileStatus";
import SubscribePlansHeroImage from "@/widgets/subscribe/plans/assets/subscribe-plans-hero-renewal.webp";
import SubscribePlansHeroImageTablet from "@/widgets/subscribe/plans/assets/subscribe-plans-hero-tablet-renewal.webp";
import SubscribePlansHeroImageMobile from "@/widgets/subscribe/plans/assets/subscribe-plans-hero-mobile-renewal.webp";
import { PlanPicker } from "@/widgets/package-plans";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";
import type { Profile } from "@/features/profile/api/types";
import { trackViewItemList } from "@/shared/lib/analytics";

interface Props {
  plans: SubscriptionPlanDto[];
  initialProfile?: Profile | null;
  showChecklistRecommend?: boolean;
}

export default function SubscribePlansSection({
  plans,
  initialProfile = null,
  showChecklistRecommend = true,
}: Props) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { profile: clientProfile } = useProfile();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    trackViewItemList();
  }, []);

  const profile = clientProfile ?? initialProfile;
  const isChecklistDone = hasChecklistAnswers(profile);
  const showModal = showChecklistRecommend && isLoggedIn && !isChecklistDone && !isDismissed;

  function handleClose() { setIsDismissed(true); }
  function handleConfirm() { setIsDismissed(true); openChecklistForm(); }

  return (
    <>
      {showModal && <ChecklistRecommendModal onClose={handleClose} onConfirm={handleConfirm} />}

      <section className="flex min-h-full flex-1 flex-col bg-white pb-16 md:pb-20">
        <div className="flex w-full flex-1 flex-col">
          {/* Hero */}
          <ScrollReveal variant="fade-in" duration={600}>
            <div className="max-lg:mb-1">
              {/* 모바일 (<768px) */}
              <div className="flex h-[calc(156px+var(--banner-height))] items-end overflow-hidden md:hidden">
                <img
                  src={SubscribePlansHeroImageMobile.src}
                  alt="이제 수제 간식도 맞춤형으로 구독하세요"
                  className="h-[156px] w-full shrink-0 object-cover object-center"
                />
              </div>
              {/* 태블릿 (768px~1199px) */}
              <div className="max-md:hidden lg:hidden flex h-[calc(156px+var(--banner-height))] items-end overflow-hidden">
                <img
                  src={SubscribePlansHeroImageTablet.src}
                  alt="이제 수제 간식도 맞춤형으로 구독하세요"
                  className="h-[156px] w-full shrink-0 object-cover object-center"
                />
              </div>
              {/* 데스크톱 (≥1200px) */}
              <div className="max-lg:hidden relative w-full h-[306px]">
                <div className="absolute inset-x-0 top-0 h-[256px] w-full bg-support-hero-side-bg" />
                <div className="relative mx-auto h-[306px] w-full max-w-[1920px] overflow-hidden">
                  <img
                    src={SubscribePlansHeroImage.src}
                    alt="이제 수제 간식도 맞춤형으로 구독하세요"
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
              getPrimaryButton={(plan) => ({
                label: "제품 상세보기",
                onClick: () => router.push(`/subscribe/detail?planId=${plan.id}`),
              })}
            />
          )}
        </div>
      </section>
    </>
  );
}
