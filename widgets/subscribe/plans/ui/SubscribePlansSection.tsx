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

const DEFER_STORAGE_KEY = "kkosoon_checklist_recommend_deferred_date";

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

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
  // "다음에 하기"를 누른 날(로컬 기준)에는 자정까지 노출하지 않는다. 확인 전에는 숨겨 flash 방지.
  const [isDeferCheckDone, setIsDeferCheckDone] = useState(false);
  const [isDeferredToday, setIsDeferredToday] = useState(false);

  useEffect(() => {
    trackViewItemList();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setIsDeferredToday(localStorage.getItem(DEFER_STORAGE_KEY) === getLocalDateKey());
      } catch {
        // 저장소를 사용할 수 없으면 기존처럼 노출한다.
      }
      setIsDeferCheckDone(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const profile = clientProfile ?? initialProfile;
  const isChecklistDone = hasChecklistAnswers(profile);
  // initialProfile이 없을 때 isProfilesReady 전에 modal이 flash되는 것을 방지
  const profileKnown = initialProfile !== null || isProfilesReady;
  const showModal = showChecklistRecommend && isLoggedIn && profileKnown && !isChecklistDone && !isDismissed
    && isDeferCheckDone && !isDeferredToday;

  function handleClose() { setIsDismissed(true); }
  function handleDefer() {
    try {
      localStorage.setItem(DEFER_STORAGE_KEY, getLocalDateKey());
    } catch {
      // 저장에 실패해도 현재 열린 모달은 닫을 수 있어야 한다.
    }
    setIsDismissed(true);
  }
  function handleConfirm() { setIsDismissed(true); openChecklistForm(); }

  return (
    <>
      {showModal && <ChecklistRecommendModal onClose={handleClose} onConfirm={handleConfirm} onDefer={handleDefer} />}

      <div className="bg-white pb-px pt-[var(--header-offset)]">
        <SubscriptionPromoBanner />
        <PackageShowcaseSection plans={plans} initialSelectedTier={initialSelectedTier} variant="subscription" />
        <PackageComparison />
      </div>
    </>
  );
}
