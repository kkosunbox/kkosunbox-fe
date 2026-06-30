"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProfile, updateProfile } from "@/features/profile/api/profileApi";
import { MAX_PROFILE_COUNT, type Profile } from "@/features/profile/api/types";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { useLoadingOverlay, useModal } from "@/shared/ui";
import { openChecklistForm } from "@/shared/lib/checklistModal";
import { parseWeightForSave } from "../profileManagementHelpers";
import type { useProfileDraft } from "./useProfileDraft";

/**
 * 프로필 저장(create/update) 오케스트레이션 및 단일 isPending(useTransition)을 소유한다.
 */
export function useProfileSave({
  draft,
  profileImageUrl,
  isCreating,
  profile,
  profilesCount,
  refreshProfile,
  setActiveProfileId,
  router,
}: {
  draft: ReturnType<typeof useProfileDraft>;
  profileImageUrl: string | null;
  isCreating: boolean;
  profile: Profile | null;
  profilesCount: number;
  refreshProfile: () => Promise<void>;
  setActiveProfileId: (id: number) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, start] = useTransition();

  function handleSave() {
    setSaveError(null);
    if (isCreating && profilesCount >= MAX_PROFILE_COUNT) {
      openAlert({ type: "info", title: `프로필은 최대 ${MAX_PROFILE_COUNT}개까지 등록할 수 있습니다.` });
      return;
    }
    const weightResult = parseWeightForSave(draft.weight);
    if (!weightResult.ok) {
      setSaveError(weightResult.errorMessage);
      return;
    }
    const { trimmedWeight, parsedWeight } = weightResult;

    const trimmedNotes = draft.specialNotes.trim();

    showLoading("프로필을 저장하고 있습니다...");
    start(async () => {
      try {
        const body = {
          name: draft.petName.trim() || undefined,
          breed: draft.breed.trim() || undefined,
          birthDate: draft.birthDate.trim() || undefined,
          weight: trimmedWeight && !Number.isNaN(parsedWeight) ? parsedWeight : undefined,
          ...(draft.gender !== null ? { gender: draft.gender } : {}),
          ...(profileImageUrl ? { profileImageUrl } : {}),
        };

        if (isCreating) {
          const newProfile = await createProfile({
            ...body,
            ...(trimmedNotes ? { specialNotes: trimmedNotes } : {}),
          });
          await refreshProfile();
          setActiveProfileId(newProfile.id);
          openChecklistForm();
        } else if (profile) {
          await updateProfile(profile.id, {
            ...body,
            breed: draft.breed.trim() || null,
            specialNotes: trimmedNotes || null,
          });
          await refreshProfile();
          router.push("/mypage");
        }

        router.refresh();
      } catch (error) {
        setSaveError(getErrorMessage(error, "저장 중 오류가 발생했습니다. 다시 시도해주세요."));
      } finally {
        hideLoading();
      }
    });
  }

  return {
    saveError,
    isPending,
    handleSave,
  };
}
