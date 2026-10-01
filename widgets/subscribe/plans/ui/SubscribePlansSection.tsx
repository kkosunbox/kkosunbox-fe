"use client";

import { useEffect, useState } from "react";
import { ChecklistRecommendModal } from "@/shared/ui";
import { openChecklistForm } from "@/shared/lib/checklistModal";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { hasChecklistAnswers } from "@/features/profile/lib/profileStatus";
import { PackageShowcaseSection, PackageComparison, SubscriptionPromoBanner } from "@/widgets/package-plans";
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
        <SubscriptionPromoBanner />
        <PackageShowcaseSection plans={plans} initialSelectedTier={initialSelectedTier} variant="subscription" />
        <PackageComparison />
      </div>
    </>
  );
}
