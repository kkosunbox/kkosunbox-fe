"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChecklistRecommendModal, ScrollReveal } from "@/shared/ui";
import { openChecklistForm } from "@/shared/lib/checklistModal";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { hasChecklistAnswers } from "@/features/profile/lib/profileStatus";
import SubscribePlansHeroImage from "@/widgets/subscribe/plans/assets/subscribe-plans-hero-renewal.png";
import SubscribePlansHeroImageMobile from "@/widgets/subscribe/plans/assets/subscribe-plans-hero-mobi.webp";
import { PlanPicker } from "@/widgets/package-plans";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";
import type { Profile } from "@/features/profile/api/types";

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
            <div className="max-md:mb-6 md:max-md2:mb-10">
              <div className="flex h-[111px] items-center justify-center overflow-hidden md2:hidden">
                <Image
                  src={SubscribePlansHeroImageMobile}
                  alt="이제 수제 간식도 맞춤형으로 구독하세요"
                  className="h-[111px] w-full shrink-0 object-cover object-center"
                  priority
                />
              </div>
              <div className="max-md2:hidden relative w-full h-[306px]">
                <div className="absolute inset-x-0 top-0 h-[256px] w-full bg-support-hero-side-bg" />
                <div className="relative mx-auto h-[306px] w-full max-w-[1920px] overflow-hidden">
                  <Image
                    src={SubscribePlansHeroImage}
                    alt="이제 수제 간식도 맞춤형으로 구독하세요"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                    priority
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>

          <PlanPicker
            plans={plans}
            getPrimaryButton={(plan) => ({
              label: "제품 상세보기",
              onClick: () => router.push(`/subscribe/detail?planId=${plan.id}`),
            })}
          />
        </div>
      </section>
    </>
  );
}
