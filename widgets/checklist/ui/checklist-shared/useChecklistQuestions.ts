"use client";

import { useEffect, useState } from "react";
import { getChecklistQuestions } from "@/features/profile/api/profileApi";
import type { ChecklistQuestion } from "@/features/profile/api/types";

export interface UseChecklistQuestionsResult {
  /** null = 로딩 중, [] = 질문 없음 */
  questions: ChecklistQuestion[] | null;
  questionsError: string | null;
}

/**
 * 체크리스트 질문 목록을 1회 로드하고 sortOrder로 정렬한다.
 * 질문·옵션 모두 정렬하며, 실패 시 한국어 에러 메시지를 노출한다.
 * 다른 상태에 의존하지 않는 독립 로더(모달·섹션 공용).
 */
export function useChecklistQuestions(): UseChecklistQuestionsResult {
  const [questions, setQuestions] = useState<ChecklistQuestion[] | null>(null);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getChecklistQuestions()
      .then((res) => {
        if (cancelled) return;
        const sorted = [...res.questions]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((q) => ({
            ...q,
            options: [...q.options].sort((a, b) => a.sortOrder - b.sortOrder),
          }));
        setQuestions(sorted);
      })
      .catch(() => {
        if (!cancelled)
          setQuestionsError("체크리스트 질문을 불러오지 못했습니다.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { questions, questionsError };
}
