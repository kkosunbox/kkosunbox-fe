"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image, { type StaticImageData } from "next/image";
import { ChecklistRecommendModal, ScrollReveal } from "@/shared/ui";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { hasChecklistAnswers } from "@/features/profile/lib/profileStatus";
import SubscribePlansHeroImage from "@/widgets/subscribe/plans/assets/subscribe-plans-hero-renewal.png";
import SubscribePlansHeroImageMobile from "@/widgets/subscribe/plans/assets/subscribe-plans-hero-mobi.png";
import { PlanPicker } from "@/widgets/package-plans";
import type { PrimaryButtonConfig } from "@/widgets/package-plans";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";
import type { Profile } from "@/features/profile/api/types";
import type { PackageTier } from "@/entities/package";

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

  const profile = clientProfile ?? initialProfile;
  const isChecklistDone = hasChecklistAnswers(profile);
  const showModal = showChecklistRecommend && isLoggedIn && !isChecklistDone && !isDismissed;

  function handleClose() { setIsDismissed(true); }
  function handleConfirm() { setIsDismissed(true); router.push("/checklist"); }

  const mobileHero = heroMobileImage ?? SubscribePlansHeroImageMobile;
  const desktopHero = heroDesktopImage ?? SubscribePlansHeroImage;

  function defaultGetPrimaryButton(plan: SubscriptionPlanDto): PrimaryButtonConfig {
    return getPrimaryButton?.(plan) ?? {
      label: "제품 상세보기",
      onClick: () => router.push(`/subscribe/detail?planId=${plan.id}`),
    };
  }

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

          <PlanPicker
            plans={plans}
            initialSelectedTier={initialSelectedTier}
            isCurrentPlan={isCurrentPlan}
            showSelectedCardHighlight={showSelectedCardHighlight}
            getPrimaryButton={defaultGetPrimaryButton}
          />
        </div>
      </section>
    </>
  );
}
