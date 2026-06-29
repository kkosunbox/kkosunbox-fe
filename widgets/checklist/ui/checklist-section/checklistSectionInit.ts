import type { ChecklistQuestion, Profile } from "@/features/profile/api/types";
import {
  EMPTY_PET_INFO,
  profileToPetInfo,
} from "../checklist-shared/checklistDomain";
import type { SectionDraftSeed } from "./hooks/useChecklistSectionDraft";

export interface SectionInitialState extends SectionDraftSeed {
  initialStep: number;
}

/* ── sessionStorage 1회 소비 (부수효과 격리) ──
 * "신규 프로필에서 진입" 플래그를 읽고 즉시 제거한다. 브라우저 API 호출을
 * 이 unit에 가둬, 조정자(coordinator)가 sessionStorage를 직접 만지지 않게 한다. */
export function consumeFromNewProfileFlag(): boolean {
  const flagged = sessionStorage.getItem("kkosun_from_new_profile") === "1";
  if (flagged) sessionStorage.removeItem("kkosun_from_new_profile");
  return flagged;
}

/* ── 초기 상태 계산 (순수·동기) ──
 * 기존 init 복원 effect의 동기 로직을 순수 함수로 격리한 것.
 * sessionStorage 판독·제거(부수효과)는 호출부(effect)가 수행하고 결과(fromNewProfile)만 받는다.
 * 상태 주입(applyInitial·initTo)도 호출부에서 수행한다. */
export function computeSectionInitialState({
  questions,
  isLoggedIn,
  activeProfile,
  fromNewProfile,
  isRewrite,
  editQuestionId,
}: {
  questions: ChecklistQuestion[];
  isLoggedIn: boolean;
  activeProfile: Profile | null;
  fromNewProfile: boolean;
  isRewrite: boolean;
  editQuestionId: string | null;
}): SectionInitialState {
  let pet = EMPTY_PET_INFO;
  let av: string | null = null;
  let answers: Record<number, number[]> = {};
  let initialStep = 0;

  if (isLoggedIn && activeProfile) {
    pet = profileToPetInfo(activeProfile);
    av = activeProfile.profileImageUrl;
    if (activeProfile.checklistAnswers?.length) {
      answers = Object.fromEntries(
        activeProfile.checklistAnswers.map((a) => [
          a.questionId,
          a.selectedOptions.map((o) => o.id),
        ]),
      );
    }
    if (pet.name.trim()) {
      initialStep = 1;
    }
  }

  if (fromNewProfile) {
    initialStep = 1;
  } else if (isRewrite) {
    initialStep = 1;
  }

  const questionId = Number(editQuestionId);
  if (Number.isFinite(questionId)) {
    const questionIndex = questions.findIndex((q) => q.id === questionId);
    if (questionIndex >= 0) initialStep = questionIndex + 1;
  }

  return { petInfo: pet, avatarSrc: av, answers, initialStep };
}
