"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseChecklistNavigationResult {
  step: number;
  maxVisitedStep: number;
  /** 다음 스텝으로 진행 (step0→1 포함). step >= qLen이면 무시 */
  next: () => void;
  /** 이전 스텝으로 */
  back: () => void;
  /**
   * 방문했던 스텝으로 점프. 앞으로 이동(target > step)은 현재 질문 응답이
   * 끝났을 때만(canAdvanceForward) 허용.
   */
  goToStep: (target: number, canAdvanceForward: boolean) => void;
  /** 초기 스텝 지정 (복원 시) */
  initTo: (initialStep: number) => void;
  /** 렌더 외(effect)에서 현재 스텝을 읽기 위한 ref 접근자 */
  getStep: () => number;
}

/**
 * 체크리스트 스텝 이동만 담당하는 순수 네비게이션 훅.
 * 저장·제출·검증을 알지 못하며, 진행 가능 여부(canAdvanceForward)는 호출부가 판단해 전달한다.
 */
export function useChecklistNavigation({
  qLen,
}: {
  qLen: number;
}): UseChecklistNavigationResult {
  const [step, setStep] = useState(0);
  const [maxVisitedStep, setMaxVisitedStep] = useState(0);
  const stepRef = useRef(0);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const next = useCallback(() => {
    if (step < qLen) {
      const n = step + 1;
      setStep(n);
      setMaxVisitedStep((prev) => Math.max(prev, n));
    }
  }, [step, qLen]);

  const back = useCallback(() => {
    setStep((s) => (s > 0 ? s - 1 : s));
  }, []);

  const goToStep = useCallback(
    (target: number, canAdvanceForward: boolean) => {
      if (target >= 1 && target <= maxVisitedStep && target !== step) {
        if (target > step && !canAdvanceForward) return;
        setStep(target);
      }
    },
    [step, maxVisitedStep],
  );

  const initTo = useCallback((initialStep: number) => {
    setStep(initialStep);
    setMaxVisitedStep(initialStep);
  }, []);

  const getStep = useCallback(() => stepRef.current, []);

  return { step, maxVisitedStep, next, back, goToStep, initTo, getStep };
}
