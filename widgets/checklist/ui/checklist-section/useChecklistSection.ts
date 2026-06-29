"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { trackChecklistStart } from "@/shared/lib/analytics";
import { useChecklistQuestions } from "../checklist-shared/useChecklistQuestions";
import { useChecklistNavigation } from "../checklist-shared/useChecklistNavigation";
import { useChecklistSectionDraft } from "./hooks/useChecklistSectionDraft";
import { useChecklistSectionSubmit } from "./hooks/useChecklistSectionSubmit";
import { useLeaveGuard } from "./hooks/useLeaveGuard";
import {
  computeSectionInitialState,
  consumeFromNewProfileFlag,
} from "./checklistSectionInit";

/**
 * 체크리스트 페이지(Section)의 조정자(Coordinator).
 * 유닛(questions·nav·draft·submit·leaveGuard) 조립 + 초기 복원 오케스트레이션 +
 * 파생 값(CTA 라벨/disabled) + CTA 디스패치만 담당한다(wiring 전용).
 * 비즈니스 로직·브라우저 API는 유닛이 소유한다.
 */
export function useChecklistSection() {
  const searchParams = useSearchParams();
  const { isLoggedIn, user } = useAuth();
  const { profile: activeProfile } = useProfile();
  const editQuestionIdParam = searchParams.get("editQuestionId");
  const returnTo = searchParams.get("returnTo");
  const isRewrite = searchParams.get("rewrite") === "1";
  const isViewResult = searchParams.get("result") === "1";

  const { questions, questionsError } = useChecklistQuestions();
  const qLen = questions?.length ?? 0;
  const nav = useChecklistNavigation({ qLen });
  const { step, maxVisitedStep, getStep, initTo } = nav;
  const resultStep = questions && questions.length > 0 ? questions.length + 1 : 6;

  const draft = useChecklistSectionDraft({ questions, step, resultStep });
  const { petInfo, answersByQuestion, initReady, handleAvatarChange } = draft;

  const { isConfirmedLeaveRef } = useLeaveGuard({ isDirty: draft.isDirty });

  const submit = useChecklistSectionSubmit({
    questions,
    petInfo,
    answersByQuestion,
    setPetInfo: draft.setPetInfo,
    handleAvatarChange,
    initTo,
    resultStep,
    initReady,
    isViewResult,
    returnTo,
    isConfirmedLeaveRef,
  });

  /* 초기 복원 오케스트레이션 — 유닛(consumeFromNewProfileFlag·computeSectionInitialState)
   * 호출 결과를 draft·nav에 분배하는 wiring만 한다. 브라우저 API(sessionStorage)는
   * 유닛이 소유하고, setState는 안정적인 분배 함수(applyInitial·initTo)로 미뤄
   * set-state-in-effect(연쇄 렌더)를 피한다. */
  const { applyInitial } = draft;
  useEffect(() => {
    if (questions === null) return;
    if (getStep() > 0) return;

    let cancelled = false;
    void (async () => {
      const fromNewProfile = consumeFromNewProfileFlag();
      if (cancelled) return;
      const seed = computeSectionInitialState({
        questions,
        isLoggedIn,
        activeProfile,
        fromNewProfile,
        isRewrite,
        editQuestionId: editQuestionIdParam,
      });
      applyInitial(seed);
      initTo(seed.initialStep);
    })();
    return () => {
      cancelled = true;
    };
  }, [editQuestionIdParam, questions, isLoggedIn, activeProfile, isRewrite, getStep, initTo, applyInitial]);

  const currentQuestionId =
    questions && step >= 1 && step <= questions.length
      ? questions[step - 1].id
      : null;
  const isCurrentQuestionAnswered =
    currentQuestionId === null
      ? true
      : (answersByQuestion[currentQuestionId] ?? []).length > 0;

  function handleNext() {
    if (!questions?.length) return;
    if (step === 0) {
      if (!petInfo.name.trim()) return;
      trackChecklistStart();
      nav.next();
      return;
    }
    if (!isCurrentQuestionAnswered) return;
    nav.next();
  }

  const lastQuestionStep = qLen;
  const isStep0NameValid = petInfo.name.trim().length > 0;
  const ctaLabel =
    step === 0 ? "체크리스트 작성하기" : step === lastQuestionStep ? "결과보기" : "다음";
  const isMobileCtaDisabled =
    (step === 0 && !isStep0NameValid) ||
    (step >= 1 && step <= qLen && !isCurrentQuestionAnswered);

  /* CTA 디스패치 — 검증→(제출|다음). 행위 자체는 유닛이 소유 */
  function handleMobileCta() {
    if (step === 0 && !isStep0NameValid) return;
    if (step === lastQuestionStep) {
      if (!isCurrentQuestionAnswered) return;
      void submit.handleSubmit();
    } else handleNext();
  }

  return {
    questions, questionsError, qLen, step, maxVisitedStep, resultStep,
    initReady, isAnalyzing: submit.isAnalyzing,
    recommendedTier: submit.recommendedTier,
    recommendedProfileId: submit.recommendedProfileId,
    petInfo, setPetInfo: draft.setPetInfo, avatarSrc: draft.avatarSrc,
    answersByQuestion, userId: user?.id ?? null,
    ctaLabel, isMobileCtaDisabled,
    handleAvatarChange, toggleOptionForQuestion: draft.toggleOptionForQuestion,
    handleBack: nav.back,
    handleStepClick: (target: number) =>
      nav.goToStep(target, isCurrentQuestionAnswered),
    handleMobileCta,
  };
}
