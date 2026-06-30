"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MAX_PROFILE_COUNT } from "@/features/profile/api/types";
import { useModal } from "@/shared/ui";

/**
 * 신규 프로필 등록 화면 진입 시 MAX_PROFILE_COUNT 초과 여부를 검사하고
 * 초과 시 alert 후 /mypage로 replace한다.
 */
export function useNewProfileLimitGuard({
  isNewProfile,
  profilesLength,
  router,
}: {
  isNewProfile: boolean;
  profilesLength: number;
  router: ReturnType<typeof useRouter>;
}) {
  const { openAlert } = useModal();
  const hasAlertedLimit = useRef(false);
  const initialProfilesCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isNewProfile) return;
    if (profilesLength === 0) return;
    if (initialProfilesCountRef.current === null) {
      initialProfilesCountRef.current = profilesLength;
    }
    if (initialProfilesCountRef.current < MAX_PROFILE_COUNT) return;
    if (hasAlertedLimit.current) return;
    hasAlertedLimit.current = true;
    openAlert({ type: "info", title: `프로필은 최대 ${MAX_PROFILE_COUNT}개까지 등록할 수 있습니다.` });
    router.replace("/mypage");
  }, [isNewProfile, profilesLength, openAlert, router]);
}
