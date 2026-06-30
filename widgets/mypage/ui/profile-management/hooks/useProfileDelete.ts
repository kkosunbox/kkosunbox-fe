"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProfile } from "@/features/profile/api/profileApi";
import type { Profile } from "@/features/profile/api/types";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { useLoadingOverlay, useModal } from "@/shared/ui";
import { deleteConfirmAlertOptions } from "@/shared/lib/modal/alertPresets";

/**
 * 프로필 삭제 confirm·API 호출·로딩·라우팅을 소유한다.
 */
export function useProfileDelete({
  profile,
  isCreating,
  refreshProfile,
  router,
}: {
  profile: Profile | null;
  isCreating: boolean;
  refreshProfile: () => Promise<void>;
  router: ReturnType<typeof useRouter>;
}) {
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDeleteProfile() {
    if (!profile || isCreating) return;

    setIsDeleting(true);
    showLoading("프로필을 삭제하고 있습니다...");

    let errorMessage: string | null = null;
    try {
      await deleteProfile(profile.id);
      await refreshProfile();
      router.push("/mypage");
      router.refresh();
    } catch (error) {
      errorMessage = getErrorMessage(error, "프로필 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      hideLoading();
      setIsDeleting(false);
    }

    if (errorMessage) {
      openAlert({ title: errorMessage });
    }
  }

  function handleDeleteProfile() {
    if (!profile || isCreating) return;

    openAlert(
      deleteConfirmAlertOptions(
        "프로필을 삭제하시겠습니까?",
        () => {
          void handleConfirmDeleteProfile();
        },
        "작성된 내용은 복구되지 않습니다.",
      ),
    );
  }

  return {
    isDeleting,
    handleDeleteProfile,
  };
}
