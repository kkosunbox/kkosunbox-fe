"use client";

import Image from "next/image";
import coupon from "@/shared/assets/promotion-coupon.png";
import { useEffect, useState } from "react";
import { ChecklistRecommendModal } from "@/shared/ui";
import { openChecklistForm } from "@/shared/lib/checklistModal";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { hasChecklistAnswers } from "@/features/profile/lib/profileStatus";
import { PackageShowcaseSection, PackageComparison } from "@/widgets/package-plans";
import type { SubscriptionPlanDto } from "@/features/subscription/api/types";
import type { Profile } from "@/features/profile/api/types";
import type { PackageTier } from "@/entities/package";
import { trackViewItemList } from "@/shared/lib/analytics";

interface Props {
  plans: SubscriptionPlanDto[];
  initialProfile?: Profile | null;
  showChecklistRecommend?: boolean;
  initialSelectedTier?: PackageTier | null;
}

export default function SubscribePlansSection({
  plans,
  initialProfile = null,
  showChecklistRecommend = true,
  initialSelectedTier = null,
}: Props) {
  const { isLoggedIn } = useAuth();
  const { profile: clientProfile, isProfilesReady } = useProfile();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    trackViewItemList();
  }, []);

  const profile = clientProfile ?? initialProfile;
  const isChecklistDone = hasChecklistAnswers(profile);
  // initialProfile이 없을 때 isProfilesReady 전에 modal이 flash되는 것을 방지
  const profileKnown = initialProfile !== null || isProfilesReady;
  const showModal = showChecklistRecommend && isLoggedIn && profileKnown && !isChecklistDone && !isDismissed;

  function handleClose() { setIsDismissed(true); }
  function handleConfirm() { setIsDismissed(true); openChecklistForm(); }

  return (
    <>
      {showModal && <ChecklistRecommendModal onClose={handleClose} onConfirm={handleConfirm} />}

      <div className="bg-white pb-px pt-[var(--header-offset)]">
        <section className="min-h-[70px] bg-[var(--color-purchase-banner-bg)]" aria-label="구독몰 안내">
          <div className="mx-auto flex min-h-[70px] max-w-[1240px] items-center justify-center gap-6 px-6 max-md:gap-3">
            <p className="text-body-16-b max-md:text-body-14-b tracking-[-0.04em] text-white">
              첫 만남은 가볍게, <span className="text-[var(--color-banner-bg)]">꼬순박스를 구독</span>으로 만나보기
            </p>
            <Image src={coupon} alt="" width={172} height={61} className="h-[61px] w-[172px] self-end object-contain max-md:w-[110px]" />
          </div>
        </section>
        <PackageShowcaseSection plans={plans} initialSelectedTier={initialSelectedTier} variant="subscription" />
        <PackageComparison />
      </div>
    </>
  );
}
