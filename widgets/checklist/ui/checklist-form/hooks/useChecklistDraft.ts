"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import type { ChecklistQuestion } from "@/features/profile/api/types";
import type { ChecklistFormOptions } from "@/shared/lib/checklistModal";
import type { PetInfo } from "../../types";
import {
  answersEqual,
  clonePetInfo,
  EMPTY_PET_INFO,
  petInfoEqual,
  type Baseline,
} from "../../checklist-shared/checklistDomain";
import type { InitialChecklistState } from "../checklistFormHelpers";

export interface UseChecklistDraftResult {
  petInfo: PetInfo;
  setPetInfo: Dispatch<SetStateAction<PetInfo>>;
  avatarSrc: string | null;
  answersByQuestion: Record<number, number[]>;
  initReady: boolean;
  /** baseline 대비 변경 여부. editProfile step0과 질문 스텝의 비교 범위가 다름 */
  isDirty: boolean;
  avatarFileRef: RefObject<File | null>;
  handleAvatarChange: (src: string | null) => void;
  handleAvatarFileSelect: (file: File) => void;
  toggleOptionForQuestion: (
    question: ChecklistQuestion,
    optionId: number,
  ) => void;
  /** 복원 seed로 draft·baseline 초기화 (init effect에서 호출) */
  applyInitial: (seed: InitialChecklistState) => void;
}

/**
 * 편집 중 데이터(프로필·아바타·답변)와 그 baseline을 소유하는 Aggregate.
 * 책임은 생성(applyInitial)·수정(mutator)·비교(isDirty)뿐이며, 복원 계산은
 * 외부 순수 함수(computeInitialState)가 담당한다. step은 isDirty 비교 범위 판단용으로만 입력받는다.
 */
export function useChecklistDraft({
  questions,
  options,
  step,
}: {
  questions: ChecklistQuestion[] | null;
  options: ChecklistFormOptions;
  step: number;
}): UseChecklistDraftResult {
  const [petInfo, setPetInfo] = useState<PetInfo>(EMPTY_PET_INFO);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [answersByQuestion, setAnswersByQuestion] = useState<
    Record<number, number[]>
  >({});
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [initReady, setInitReady] = useState(false);
  const avatarFileRef = useRef<File | null>(null);

  const handleAvatarChange = useCallback((src: string | null) => {
    setAvatarSrc((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return src;
    });
    if (!src) avatarFileRef.current = null;
  }, []);

  const handleAvatarFileSelect = useCallback((file: File) => {
    avatarFileRef.current = file;
  }, []);

  const toggleOptionForQuestion = useCallback(
    (question: ChecklistQuestion, optionId: number) => {
      const { id: questionId, isMultiSelect, options: opts } = question;
      setAnswersByQuestion((prev) => {
        const cur = prev[questionId] ?? [];
        if (!isMultiSelect) return { ...prev, [questionId]: [optionId] };
        if (cur.includes(optionId))
          return { ...prev, [questionId]: cur.filter((x) => x !== optionId) };
        const clicked = opts.find((o) => o.id === optionId);
        if (clicked?.isExclusive) return { ...prev, [questionId]: [optionId] };
        const exclusiveIds = new Set(
          opts.filter((o) => o.isExclusive).map((o) => o.id),
        );
        return {
          ...prev,
          [questionId]: [...cur.filter((id) => !exclusiveIds.has(id)), optionId],
        };
      });
    },
    [],
  );

  const applyInitial = useCallback((seed: InitialChecklistState) => {
    setPetInfo(seed.petInfo);
    setAvatarSrc((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return seed.avatarSrc;
    });
    setAnswersByQuestion(seed.answers);
    setBaseline({
      petInfo: clonePetInfo(seed.petInfo),
      avatarSrc: seed.avatarSrc,
      answers: { ...seed.answers },
    });
    setInitReady(true);
    avatarFileRef.current = null;
  }, []);

  /* blob URL 정리 (언마운트) */
  useEffect(() => {
    return () => {
      setAvatarSrc((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, []);

  const isDirty =
    questions !== null &&
    baseline !== null &&
    (options.editProfile && step === 0
      ? !petInfoEqual(petInfo, baseline.petInfo) ||
        avatarSrc !== baseline.avatarSrc
      : step > 0 &&
        (!petInfoEqual(petInfo, baseline.petInfo) ||
          avatarSrc !== baseline.avatarSrc ||
          !answersEqual(answersByQuestion, baseline.answers)));

  return {
    petInfo,
    setPetInfo,
    avatarSrc,
    answersByQuestion,
    initReady,
    isDirty,
    avatarFileRef,
    handleAvatarChange,
    handleAvatarFileSelect,
    toggleOptionForQuestion,
    applyInitial,
  };
}
