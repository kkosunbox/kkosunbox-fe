"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { openChecklistForm } from "@/shared/lib/checklistModal";

/** 메인·초대 Hero의 "우리 아이한테 딱 맞는 간식 알아보기" CTA 동작. */
export function useHeroChecklistCta() {
  const { isLoggedIn } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();

  return function handleCta() {
    if (!isLoggedIn) {
      router.push("/login?next=/checklist");
      return;
    }

    if ((profile?.checklistAnswers?.length ?? 0) > 0) {
      router.push("/checklist/result");
      return;
    }

    openChecklistForm();
  };
}
