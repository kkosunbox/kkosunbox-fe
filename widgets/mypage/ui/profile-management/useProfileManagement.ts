"use client";

import { useRouter } from "next/navigation";
import type { Profile } from "@/features/profile/api/types";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { useAuth } from "@/features/auth";
import { useNewProfileLimitGuard } from "./hooks/useNewProfileLimitGuard";
import { useProfileDelete } from "./hooks/useProfileDelete";
import { useProfileDraft } from "./hooks/useProfileDraft";
import { useProfileImage } from "./hooks/useProfileImage";
import { useProfileSave } from "./hooks/useProfileSave";

/**
 * 프로필 관리 Section의 조정자(Coordinator).
 * 단위 훅(draft·image·guard·delete·save) 조립 + 파생 상태만 담당한다.
 */
export function useProfileManagement({
  profile: serverProfile,
  isNewProfile = false,
}: {
  profile: Profile | null;
  isNewProfile?: boolean;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { profile: activeProfile, profiles, refreshProfile, setActiveProfileId } = useProfile();

  const profile = isNewProfile ? null : (activeProfile ?? serverProfile);
  const isCreating = profile === null;

  const draft = useProfileDraft({ profile, isNewProfile });
  const image = useProfileImage({
    profile,
    isCreating,
    isNewProfile,
    refreshProfile,
    router,
  });

  useNewProfileLimitGuard({
    isNewProfile,
    profilesLength: profiles.length,
    router,
  });

  const deletion = useProfileDelete({
    profile,
    isCreating,
    refreshProfile,
    router,
  });

  const save = useProfileSave({
    draft,
    profileImageUrl: image.profileImageUrl,
    isCreating,
    profile,
    profilesCount: profiles.length,
    refreshProfile,
    setActiveProfileId,
    router,
  });

  const isActionsDisabled =
    save.isPending || image.isUploadingImage || deletion.isDeleting;

  return {
    router,
    user,
    isCreating,
    draft,
    image,
    deletion,
    save,
    isActionsDisabled,
  };
}

export type ProfileManagementSectionVM = ReturnType<typeof useProfileManagement>;
