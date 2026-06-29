"use client";

import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import { useAuth } from "@/features/auth";
import { createProfile, updateProfile } from "@/features/profile/api/profileApi";
import type {
  ChecklistAnswerInput,
  ChecklistQuestion,
} from "@/features/profile/api/types";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { hasChecklistAnswers } from "@/features/profile/lib/profileStatus";
import { trackChecklistComplete } from "@/shared/lib/analytics";
import { getSubscriptionPlans } from "@/features/subscription/api/subscriptionApi";
import { tierFromSubscriptionPlan } from "@/entities/package";
import type { PetInfo, RecommendedTier } from "../../types";
import {
  buildCreateProfileBody,
  buildUpdateProfileBody,
  fallbackRecommend,
  profileToPetInfo,
} from "../../checklist-shared/checklistDomain";

export interface UseChecklistSectionSubmitResult {
  recommendedTier: RecommendedTier | null;
  recommendedProfileId: number | null;
  isAnalyzing: boolean;
  /** 체크리스트 제출 — 프로필·답변 저장, 추천 tier 계산 후 인라인 결과 표시 또는 mypage 복귀 */
  handleSubmit: () => Promise<void>;
}

/**
 * 체크리스트 제출 / 추천 tier 계산 / 결과 상태(recommendedTier·isAnalyzing)를 소유한다.
 * 모달 submit과 달리 결과는 화면 이탈이 아니라 인라인(resultStep 점프)으로 표시하며,
 * `?result=1` 진입 시 기존 답변 기반 결과 자동 표시 effect도 함께 보유한다.
 * 현재 질문 응답 여부 가드는 호출부(handleMobileCta)가 책임진다.
 */
export function useChecklistSectionSubmit({
  questions,
  petInfo,
  answersByQuestion,
  setPetInfo,
  handleAvatarChange,
  initTo,
  resultStep,
  initReady,
  isViewResult,
  returnTo,
  isConfirmedLeaveRef,
}: {
  questions: ChecklistQuestion[] | null;
  petInfo: PetInfo;
  answersByQuestion: Record<number, number[]>;
  setPetInfo: Dispatch<SetStateAction<PetInfo>>;
  handleAvatarChange: (src: string | null) => void;
  initTo: (step: number) => void;
  resultStep: number;
  initReady: boolean;
  isViewResult: boolean;
  returnTo: string | null;
  isConfirmedLeaveRef: RefObject<boolean>;
}): UseChecklistSectionSubmitResult {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const {
    profile: activeProfile,
    refreshProfile,
    setActiveProfileId,
  } = useProfile();
  const { openAlert } = useModal();

  const [recommendedTier, setRecommendedTier] = useState<RecommendedTier | null>(
    null,
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedProfileId, setRecommendedProfileId] = useState<
    number | null
  >(null);
  const viewResultDone = useRef(false);

  // ?result=1로 진입 시: 이미 작성된 체크리스트 기반으로 결과 자동 표시
  useEffect(() => {
    if (!isViewResult || !initReady || viewResultDone.current) return;
    if (!activeProfile || !hasChecklistAnswers(activeProfile)) return;

    viewResultDone.current = true;

    const answers = activeProfile.checklistAnswers.map((a) => ({
      questionId: a.questionId,
      optionIds: a.selectedOptions.map((o) => o.id),
    }));

    void (async () => {
      setIsAnalyzing(true);
      try {
        const planRes = await getSubscriptionPlans(activeProfile.id);
        const rec = planRes.plans.find((p) => p.isRecommended);
        let tier: RecommendedTier = fallbackRecommend(answers);
        if (rec) {
          const pt = tierFromSubscriptionPlan(rec);
          tier = pt === "Premium" ? "premium" : pt === "Standard" ? "standard" : "basic";
        }
        setPetInfo(profileToPetInfo(activeProfile));
        handleAvatarChange(activeProfile.profileImageUrl);
        setRecommendedTier(tier);
        setRecommendedProfileId(activeProfile.id);
        initTo(resultStep);
      } catch {
        setPetInfo(profileToPetInfo(activeProfile));
        handleAvatarChange(activeProfile.profileImageUrl);
        setRecommendedTier(fallbackRecommend(answers));
        setRecommendedProfileId(activeProfile.id);
        initTo(resultStep);
      } finally {
        setIsAnalyzing(false);
      }
    })();
  }, [
    isViewResult,
    initReady,
    activeProfile,
    resultStep,
    initTo,
    setPetInfo,
    handleAvatarChange,
  ]);

  async function handleSubmit() {
    if (!questions?.length) return;
    const trimmedName = petInfo.name.trim();
    if (!trimmedName) return;
    isConfirmedLeaveRef.current = true;
    setIsAnalyzing(true);

    const checklistAnswers: ChecklistAnswerInput[] = questions.map((q) => ({
      questionId: q.id,
      optionIds: answersByQuestion[q.id] ?? [],
    }));

    let tier: RecommendedTier = fallbackRecommend(checklistAnswers);
    let savedProfileId: number | null = null;
    let checklistSaved = false;
    let saveError: unknown = null;
    try {
      if (isLoggedIn && activeProfile) {
        await updateProfile(activeProfile.id, {
          ...buildUpdateProfileBody(petInfo),
          checklistAnswers,
        });
        savedProfileId = activeProfile.id;
        checklistSaved = true;
      } else if (isLoggedIn) {
        const newProfile = await createProfile(
          buildCreateProfileBody(petInfo, checklistAnswers),
        );
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
            pt === "Premium" ? "premium" : pt === "Standard" ? "standard" : "basic";
        }
      }
    } catch (e) {
      if (!checklistSaved) saveError = e;
    }

    if (isLoggedIn && !checklistSaved) {
      openAlert({
        title: getErrorMessage(
          saveError,
          "체크리스트 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
        ),
      });
    }

    if (checklistSaved && user?.id) {
      localStorage.setItem(`kkosun_checklist_done_${user.id}`, "true");
    }

    if (returnTo === "mypage") {
      setIsAnalyzing(false);
      router.push("/mypage");
      return;
    }

    trackChecklistComplete({ recommended_tier: tier });
    setRecommendedTier(tier);
    setRecommendedProfileId(savedProfileId);
    setIsAnalyzing(false);
    initTo(resultStep);
  }

  return { recommendedTier, recommendedProfileId, isAnalyzing, handleSubmit };
}
