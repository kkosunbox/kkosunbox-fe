"use client";

import { useEffect } from "react";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import type { ChecklistFormOptions } from "@/shared/lib/checklistModal";
import {
  computeInitialState,
  getChecklistCtaLabel,
  isChecklistCtaDisabled,
} from "./checklistFormHelpers";
import { useChecklistQuestions } from "./hooks/useChecklistQuestions";
import { useChecklistNavigation } from "./hooks/useChecklistNavigation";
import { useChecklistDraft } from "./hooks/useChecklistDraft";
import { useChecklistSubmit } from "./hooks/useChecklistSubmit";
import { useUnsavedChangesGuard } from "./hooks/useUnsavedChangesGuard";

/** 조정자(Coordinator). 유닛 조립 + 초기화 오케스트레이션 + CTA 디스패치만 담당. */
export function useChecklistForm(
  options: ChecklistFormOptions,
  onClose: () => void,
) {
  const { isLoggedIn, user } = useAuth();
  const { profile: activeProfile } = useProfile();
  const { questions, questionsError } = useChecklistQuestions();
  const qLen = questions?.length ?? 0;
  const nav = useChecklistNavigation({ qLen });
  const draft = useChecklistDraft({ questions, options, step: nav.step });
  const submit = useChecklistSubmit({
    questions,
    options,
    petInfo: draft.petInfo,
    avatarFileRef: draft.avatarFileRef,
    answersByQuestion: draft.answersByQuestion,
    onClose,
  });
  const { handleCloseRequest } = useUnsavedChangesGuard({
    isDirty: draft.isDirty,
    onClose,
  });
  /* 초기 복원 오케스트레이션 — computeInitialState 결과를 draft·nav에 분배.
   * setState를 마이크로태스크로 미뤄 set-state-in-effect(연쇄 렌더)를 피하고,
   * 안정적인(useCallback) 분배 함수만 의존성으로 사용해 effect 재실행을 막는다. */
  const { applyInitial } = draft;
  const { initTo, getStep } = nav;
  useEffect(() => {
    if (questions === null) return;
    if (getStep() > 0) return;

    let cancelled = false;

    void (async () => {
      const seed = computeInitialState({
        questions,
        options,
        isLoggedIn,
        activeProfile,
      });
      if (cancelled) return;
      applyInitial(seed);
      initTo(seed.initialStep);
    })();

    return () => {
      cancelled = true;
    };
  }, [questions, isLoggedIn, activeProfile, options, applyInitial, initTo, getStep]);

  const currentQuestionId =
    questions && nav.step >= 1 && nav.step <= qLen
      ? questions[nav.step - 1].id
      : null;
  const isCurrentQuestionAnswered =
    currentQuestionId === null
      ? true
      : (draft.answersByQuestion[currentQuestionId] ?? []).length > 0;
  const isStep0NameValid = draft.petInfo.name.trim().length > 0;
  const lastQuestionStep = qLen;
  const ctaLabel = getChecklistCtaLabel({
    step: nav.step,
    isEditProfileMode: options.editProfile === true,
    isSaving: submit.isSaving,
    lastQuestionStep,
  });
  const isCtaDisabled = isChecklistCtaDisabled({
    isSaving: submit.isSaving,
    step: nav.step,
    isStep0NameValid,
    qLen,
    isCurrentQuestionAnswered,
  });
  const headerTitle = nav.step === 0 ? "프로필 작성" : "체크리스트 작성";

  /* CTA 디스패치 — 검증→(저장|제출|다음). 행위 자체는 유닛이 소유 */
  function primaryAction() {
    if (!questions?.length) return;
    if (nav.step === 0) {
      if (!isStep0NameValid) return;
      if (options.editProfile) {
        void submit.handleSaveProfile();
        return;
      }
      nav.next();
      return;
    }
    if (!isCurrentQuestionAnswered) return;
    if (nav.step === lastQuestionStep) {
      void submit.handleSubmit();
      return;
    }
    nav.next();
  }
  return {
    questions, questionsError, qLen,
    step: nav.step, maxVisitedStep: nav.maxVisitedStep,
    initReady: draft.initReady, isAnalyzing: submit.isAnalyzing,
    petInfo: draft.petInfo, setPetInfo: draft.setPetInfo,
    avatarSrc: draft.avatarSrc, answersByQuestion: draft.answersByQuestion,
    userId: user?.id ?? null,
    headerTitle, ctaLabel, isCtaDisabled,
    handleCloseRequest,
    handleAvatarChange: draft.handleAvatarChange,
    handleAvatarFileSelect: draft.handleAvatarFileSelect,
    toggleOptionForQuestion: draft.toggleOptionForQuestion,
    onBack: nav.back,
    onStepClick: (target: number) =>
      nav.goToStep(target, isCurrentQuestionAnswered),
    primaryAction,
  };
}
