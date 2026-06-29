"use client";

import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { ChecklistQuestion } from "@/features/profile/api/types";
import type { PetInfo } from "../../types";
import {
  answersEqual,
  clonePetInfo,
  EMPTY_PET_INFO,
  petInfoEqual,
  type Baseline,
} from "../../checklist-shared/checklistDomain";

/** 복원 seed — draft·baseline 초기화 입력(step은 nav가 별도로 받는다). */
export interface SectionDraftSeed {
  petInfo: PetInfo;
  avatarSrc: string | null;
  answers: Record<number, number[]>;
}

export interface UseChecklistSectionDraftResult {
  petInfo: PetInfo;
  setPetInfo: Dispatch<SetStateAction<PetInfo>>;
  avatarSrc: string | null;
  answersByQuestion: Record<number, number[]>;
  initReady: boolean;
  /** baseline 대비 변경 여부. 질문 진행 구간(step>0 && step<resultStep)에서만 평가 */
  isDirty: boolean;
  handleAvatarChange: (src: string | null) => void;
  toggleOptionForQuestion: (
    question: ChecklistQuestion,
    optionId: number,
  ) => void;
  /** 복원 seed로 draft·baseline 초기화 (init effect에서 호출) */
  applyInitial: (seed: SectionDraftSeed) => void;
}

/**
 * 체크리스트 페이지(Section)의 편집 데이터(프로필·아바타·답변)와 baseline을 소유한다.
 * 모달 draft와 달리 아바타는 표시 전용(S3 업로드·avatarFileRef 없음)이며,
 * isDirty는 질문 진행 구간에서만 평가한다. step·resultStep은 그 비교 범위 판단용 입력이다.
 */
export function useChecklistSectionDraft({
  questions,
  step,
  resultStep,
}: {
  questions: ChecklistQuestion[] | null;
  step: number;
  resultStep: number;
}): UseChecklistSectionDraftResult {
  const [petInfo, setPetInfo] = useState<PetInfo>(EMPTY_PET_INFO);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [answersByQuestion, setAnswersByQuestion] = useState<
    Record<number, number[]>
  >({});
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [initReady, setInitReady] = useState(false);

  const handleAvatarChange = useCallback((src: string | null) => {
    setAvatarSrc((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return src;
    });
  }, []);

  const toggleOptionForQuestion = useCallback(
    (question: ChecklistQuestion, optionId: number) => {
      const { id: questionId, isMultiSelect, options } = question;
      setAnswersByQuestion((prev) => {
        const cur = prev[questionId] ?? [];

        if (!isMultiSelect) {
          return { ...prev, [questionId]: [optionId] };
        }

        // 이미 선택된 경우 해제
        if (cur.includes(optionId)) {
          return { ...prev, [questionId]: cur.filter((x) => x !== optionId) };
        }

        const clickedOption = options.find((o) => o.id === optionId);

        // 배타적 선택지 클릭 → 다른 모든 선택 해제 후 단독 선택
        if (clickedOption?.isExclusive) {
          return { ...prev, [questionId]: [optionId] };
        }

        // 일반 선택지 클릭 → 배타적 선택지가 있다면 제거 후 추가
        const exclusiveIds = new Set(
          options.filter((o) => o.isExclusive).map((o) => o.id),
        );
        return {
          ...prev,
          [questionId]: [...cur.filter((id) => !exclusiveIds.has(id)), optionId],
        };
      });
    },
    [],
  );

  const applyInitial = useCallback((seed: SectionDraftSeed) => {
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
  }, []);

  const isDirty =
    questions !== null &&
    baseline !== null &&
    step > 0 &&
    step < resultStep &&
    (!petInfoEqual(petInfo, baseline.petInfo) ||
      avatarSrc !== baseline.avatarSrc ||
      !answersEqual(answersByQuestion, baseline.answers));

  return {
    petInfo,
    setPetInfo,
    avatarSrc,
    answersByQuestion,
    initReady,
    isDirty,
    handleAvatarChange,
    toggleOptionForQuestion,
    applyInitial,
  };
}
