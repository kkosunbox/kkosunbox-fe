import type { ChecklistQuestion, Profile } from "@/features/profile/api/types";
import type { ChecklistFormOptions } from "@/shared/lib/checklistModal";
import type { PetInfo } from "../types";
import {
  EMPTY_PET_INFO,
  profileToPetInfo,
} from "../checklist-shared/checklistDomain";

/* ── 초기 상태 계산 (순수·동기) ──
 * 기존 복원 effect의 IIFE 내부 동기 로직을 순수 함수로 격리한 것.
 * 상태 주입(setState)은 호출부(effect)에서 수행한다. */
export interface InitialChecklistState {
  petInfo: PetInfo;
  avatarSrc: string | null;
  answers: Record<number, number[]>;
  initialStep: number;
}

export function computeInitialState({
  questions,
  options,
  isLoggedIn,
  activeProfile,
}: {
  questions: ChecklistQuestion[];
  options: ChecklistFormOptions;
  isLoggedIn: boolean;
  activeProfile: Profile | null;
}): InitialChecklistState {
  let pet = EMPTY_PET_INFO;
  let av: string | null = null;
  let restoredAnswers: Record<number, number[]> = {};
  let initialStep = 0;

  if (options.isNewProfile) {
    pet = EMPTY_PET_INFO;
    av = null;
    restoredAnswers = {};
    initialStep = 0;
  } else if (options.editProfile && isLoggedIn && activeProfile) {
    pet = profileToPetInfo(activeProfile);
    av = activeProfile.profileImageUrl;
    initialStep = 0;
  } else if (isLoggedIn && activeProfile) {
    pet = profileToPetInfo(activeProfile);
    av = activeProfile.profileImageUrl;
    if (activeProfile.checklistAnswers?.length) {
      restoredAnswers = Object.fromEntries(
        activeProfile.checklistAnswers.map((a) => [
          a.questionId,
          a.selectedOptions.map((o) => o.id),
        ]),
      );
    }
    if (pet.name.trim()) initialStep = 1;
  }

  if (!options.isNewProfile && !options.editProfile) {
    if (options.rewrite) {
      initialStep = 1;
    }

    if (options.editQuestionId != null) {
      const idx = questions.findIndex((q) => q.id === options.editQuestionId);
      if (idx >= 0) initialStep = idx + 1;
    }
  }

  return { petInfo: pet, avatarSrc: av, answers: restoredAnswers, initialStep };
}

/* ── CTA 표현 로직 (순수) ── */
export function getChecklistCtaLabel({
  step,
  isEditProfileMode,
  isSaving,
  lastQuestionStep,
}: {
  step: number;
  isEditProfileMode: boolean;
  isSaving: boolean;
  lastQuestionStep: number;
}): string {
  if (step === 0) {
    if (isEditProfileMode) return isSaving ? "저장 중…" : "저장";
    return "체크리스트 작성하기";
  }
  return step === lastQuestionStep ? "결과보기" : "다음";
}

export function isChecklistCtaDisabled({
  isSaving,
  step,
  isStep0NameValid,
  qLen,
  isCurrentQuestionAnswered,
}: {
  isSaving: boolean;
  step: number;
  isStep0NameValid: boolean;
  qLen: number;
  isCurrentQuestionAnswered: boolean;
}): boolean {
  return (
    isSaving ||
    (step === 0 && !isStep0NameValid) ||
    (step >= 1 && step <= qLen && !isCurrentQuestionAnswered)
  );
}
