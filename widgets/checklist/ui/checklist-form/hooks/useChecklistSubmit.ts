"use client";

import { useState, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { getProfileImagePresignedUrl, uploadToS3 } from "@/shared/lib/asset";
import { useAuth } from "@/features/auth";
import { createProfile, updateProfile } from "@/features/profile/api/profileApi";
import {
  MAX_PROFILE_COUNT,
  type ChecklistAnswerInput,
  type ChecklistQuestion,
} from "@/features/profile/api/types";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { getSubscriptionPlans } from "@/features/subscription/api/subscriptionApi";
import { tierFromSubscriptionPlan } from "@/entities/package";
import type { ChecklistFormOptions } from "@/shared/lib/checklistModal";
import type { PetInfo, RecommendedTier } from "../../types";
import {
  buildCreateProfileBody,
  buildUpdateProfileBody,
  fallbackRecommend,
} from "../../checklist-shared/checklistDomain";

export interface UseChecklistSubmitResult {
  isAnalyzing: boolean;
  isSaving: boolean;
  /** editProfile 모드 — 프로필만 저장 후 모달 닫기 */
  handleSaveProfile: () => Promise<void>;
  /** 체크리스트 제출 — 프로필·답변 저장, 추천 tier 계산 후 결과 페이지 이동 */
  handleSubmit: () => Promise<void>;
}

/**
 * 프로필 저장 / 체크리스트 제출 / 추천 tier 계산을 담당한다.
 * 현재 draft 값(petInfo·avatar·answers)과 questions/options를 입력으로 받으며,
 * navigation 상태(step 등)는 참조하지 않는다. 제출 전제(현재 질문 응답 여부)
 * 검증은 호출부(Coordinator)가 책임진다.
 */
export function useChecklistSubmit({
  questions,
  options,
  petInfo,
  avatarFileRef,
  answersByQuestion,
  onClose,
}: {
  questions: ChecklistQuestion[] | null;
  options: ChecklistFormOptions;
  petInfo: PetInfo;
  avatarFileRef: RefObject<File | null>;
  answersByQuestion: Record<number, number[]>;
  onClose: () => void;
}): UseChecklistSubmitResult {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const { profile: activeProfile, profiles, refreshProfile, setActiveProfileId } =
    useProfile();
  const { openAlert } = useModal();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveProfile() {
    if (!isLoggedIn || !activeProfile) return;
    const trimmedName = petInfo.name.trim();
    if (!trimmedName) return;

    setIsSaving(true);

    try {
      let profileImageUrl: string | null | undefined;

      const file = avatarFileRef.current;
      if (file) {
        const { uploadUrl, fileUrl } = await getProfileImagePresignedUrl({
          fileName: file.name,
          fileType: file.type,
        });
        await uploadToS3(uploadUrl, file, file.type);
        profileImageUrl = fileUrl;
      }

      await updateProfile(activeProfile.id, {
        ...buildUpdateProfileBody(petInfo),
        ...(profileImageUrl !== undefined ? { profileImageUrl } : {}),
      });
      await refreshProfile();
      avatarFileRef.current = null;
      onClose();
    } catch (e) {
      openAlert({
        title: getErrorMessage(e, "저장 중 오류가 발생했습니다. 다시 시도해주세요."),
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmit() {
    if (!questions?.length) return;
    const trimmedName = petInfo.name.trim();
    if (!trimmedName) return;
    setIsAnalyzing(true);

    const checklistAnswers: ChecklistAnswerInput[] = questions.map((q) => ({
      questionId: q.id,
      optionIds: answersByQuestion[q.id] ?? [],
    }));

    let tier: RecommendedTier = fallbackRecommend(checklistAnswers);
    let savedProfileId: number | null = null;
    let checklistSaved = false;

    // 아바타 업로드 — 실패해도 프로필 저장은 계속 진행
    let profileImageUrl: string | undefined;
    const file = avatarFileRef.current;
    if (file) {
      try {
        const { uploadUrl, fileUrl } = await getProfileImagePresignedUrl({
          fileName: file.name,
          fileType: file.type,
        });
        await uploadToS3(uploadUrl, file, file.type);
        profileImageUrl = fileUrl;
        avatarFileRef.current = null;
      } catch {
        // non-fatal: 이미지 없이 저장 진행
      }
    }

    try {
      if (options.isNewProfile) {
        if (profiles.length >= MAX_PROFILE_COUNT) {
          openAlert({
            type: "info",
            title: `프로필은 최대 ${MAX_PROFILE_COUNT}개까지 등록할 수 있습니다.`,
          });
          setIsAnalyzing(false);
          return;
        }
        const newProfile = await createProfile({
          ...buildCreateProfileBody(petInfo, checklistAnswers),
          ...(profileImageUrl ? { profileImageUrl } : {}),
        });
        savedProfileId = newProfile.id;
        setActiveProfileId(newProfile.id);
        checklistSaved = true;
      } else if (isLoggedIn && activeProfile) {
        await updateProfile(activeProfile.id, {
          ...buildUpdateProfileBody(petInfo),
          checklistAnswers,
          ...(profileImageUrl !== undefined ? { profileImageUrl } : {}),
        });
        savedProfileId = activeProfile.id;
        checklistSaved = true;
      } else if (isLoggedIn) {
        const newProfile = await createProfile({
          ...buildCreateProfileBody(petInfo, checklistAnswers),
          ...(profileImageUrl ? { profileImageUrl } : {}),
        });
        savedProfileId = newProfile.id;
        setActiveProfileId(newProfile.id);
        checklistSaved = true;
      }

      if (savedProfileId !== null) {
        await refreshProfile();
        const planRes = await getSubscriptionPlans(savedProfileId);
        const rec = planRes.plans.find((p) => p.isRecommended);
        if (rec) {
          const pt = tierFromSubscriptionPlan(rec);
          tier =
            pt === "Premium"
              ? "premium"
              : pt === "Standard"
                ? "standard"
                : "basic";
        }
      }
    } catch (e) {
      console.error("[ChecklistFormModal] save or plan fetch failed", e);
    }

    if (checklistSaved && user?.id) {
      localStorage.setItem(`kkosun_checklist_done_${user.id}`, "true");
    }

    router.push(`/checklist/result?tier=${tier}`);
  }

  return { isAnalyzing, isSaving, handleSaveProfile, handleSubmit };
}
