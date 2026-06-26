"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, useModal } from "@/shared/ui";
import { unsavedLeaveAlertOptions } from "@/shared/lib/modal/alertPresets";
import { getErrorMessage } from "@/shared/lib/api";
import { useAuth } from "@/features/auth";
import {
  createProfile,
  getChecklistQuestions,
  updateProfile,
} from "@/features/profile/api/profileApi";
import type {
  ChecklistAnswerInput,
  ChecklistQuestion,
  CreateProfileRequest,
  Profile,
} from "@/features/profile/api/types";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { hasChecklistAnswers } from "@/features/profile/lib/profileStatus";
import { trackChecklistStart, trackChecklistComplete } from "@/shared/lib/analytics";
import { getSubscriptionPlans } from "@/features/subscription/api/subscriptionApi";
import { tierFromSubscriptionPlan } from "@/entities/package";
import ChecklistHero from "./ChecklistHero";
import ChecklistPetForm from "./ChecklistPetForm";
import ChecklistQuestionStep from "./ChecklistQuestionStep";
import ChecklistResult from "./ChecklistResult";
import type { PetInfo, RecommendedTier } from "./types";

const CTA_CLASS =
  "!h-[56px] !w-full !bg-[var(--color-accent)] !text-subtitle-16-sb transition-opacity hover:opacity-90 active:opacity-80 disabled:!cursor-not-allowed disabled:!opacity-50 disabled:hover:!opacity-50";

function fallbackRecommend(answers: ChecklistAnswerInput[]): RecommendedTier {
  const n = answers.reduce((s, a) => s + a.optionIds.length, 0);
  if (n >= 6) return "premium";
  if (n >= 3) return "standard";
  return "basic";
}

function parseProfileBirthDate(iso: string | null | undefined): Date | null {
  if (!iso?.trim()) return null;
  const day = iso.slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  return new Date(y, mo, d);
}

function petBirthToIso(date: Date | null): string | null {
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function profileToPetInfo(p: Profile): PetInfo {
  return {
    name: p.name?.trim() ?? "",
    breed: p.breed?.trim() ?? "",
    specialNotes: p.specialNotes?.trim() ?? "",
    birthDate: parseProfileBirthDate(p.birthDate),
    weight: p.weight != null && !Number.isNaN(Number(p.weight)) ? String(p.weight) : "",
    gender: p.gender ?? null,
  };
}

function clonePetInfo(p: PetInfo): PetInfo {
  return {
    name: p.name,
    breed: p.breed,
    specialNotes: p.specialNotes,
    birthDate: p.birthDate ? new Date(p.birthDate.getTime()) : null,
    weight: p.weight,
    gender: p.gender,
  };
}

function petInfoEqual(a: PetInfo, b: PetInfo): boolean {
  if (a.name !== b.name || a.breed !== b.breed || a.specialNotes !== b.specialNotes || a.weight !== b.weight || a.gender !== b.gender) return false;
  const at = a.birthDate?.getTime() ?? null;
  const bt = b.birthDate?.getTime() ?? null;
  return at === bt;
}

function answersEqual(a: Record<number, number[]>, b: Record<number, number[]>): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)].map(Number));
  for (const k of keys) {
    const ak = [...(a[k] ?? [])].sort((x, y) => x - y);
    const bk = [...(b[k] ?? [])].sort((x, y) => x - y);
    if (ak.length !== bk.length || !ak.every((x, i) => x === bk[i])) return false;
  }
  return true;
}

interface ChecklistBaseline {
  petInfo: PetInfo;
  avatarSrc: string | null;
  answers: Record<number, number[]>;
}

const EMPTY_PET_INFO: PetInfo = {
  name: "",
  breed: "",
  specialNotes: "",
  birthDate: null,
  weight: "",
  gender: null,
};

/* ─── Widget ─── */
export default function ChecklistSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, user } = useAuth();
  const { profile: activeProfile, refreshProfile, setActiveProfileId } = useProfile();
  const editQuestionIdParam = searchParams.get("editQuestionId");
  const returnTo = searchParams.get("returnTo");
  const isRewrite = searchParams.get("rewrite") === "1";
  const isViewResult = searchParams.get("result") === "1";

  const [questions, setQuestions] = useState<ChecklistQuestion[] | null>(null);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const [maxVisitedStep, setMaxVisitedStep] = useState(0);
  const [initReady, setInitReady] = useState(false);
  const [baseline, setBaseline] = useState<ChecklistBaseline | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [petInfo, setPetInfo] = useState<PetInfo>({
    name: "",
    breed: "",
    specialNotes: "",
    birthDate: null,
    weight: "",
    gender: null,
  });
  const [answersByQuestion, setAnswersByQuestion] = useState<Record<number, number[]>>({});
  const [recommendedTier, setRecommendedTier] = useState<RecommendedTier | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedProfileId, setRecommendedProfileId] = useState<number | null>(null);
  const { openAlert } = useModal();
  const pendingNavigateRef = useRef<(() => void) | null>(null);
  const viewResultDone = useRef(false);

  const resultStep = questions && questions.length > 0 ? questions.length + 1 : 6;

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
        if (!cancelled) setQuestionsError("체크리스트 질문을 불러오지 못했습니다.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    if (questions === null) return;
    if (stepRef.current > 0) return;

    let cancelled = false;

    void (async () => {
      let pet = EMPTY_PET_INFO;
      let av: string | null = null;
      let restoredAnswers: Record<number, number[]> = {};
      let initialStep = 0;

      if (isLoggedIn && activeProfile) {
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
        if (pet.name.trim()) {
          initialStep = 1;
        }
      }

      if (cancelled) return;

      const fromNewProfile = sessionStorage.getItem("kkosun_from_new_profile") === "1";
      if (fromNewProfile) {
        sessionStorage.removeItem("kkosun_from_new_profile");
        initialStep = 1;
      } else if (isRewrite) {
        initialStep = 1;
      }

      const questionId = Number(editQuestionIdParam);
      if (Number.isFinite(questionId)) {
        const questionIndex = questions.findIndex((question) => question.id === questionId);
        if (questionIndex >= 0) initialStep = questionIndex + 1;
      }

      setPetInfo(pet);
      setStep(initialStep);
      setMaxVisitedStep(initialStep);
      setAvatarSrc((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return av;
      });
      setAnswersByQuestion(restoredAnswers);
      setBaseline({
        petInfo: clonePetInfo(pet),
        avatarSrc: av,
        answers: { ...restoredAnswers },
      });
      setInitReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [editQuestionIdParam, questions, isLoggedIn, activeProfile]);

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
        setAvatarSrc(activeProfile.profileImageUrl);
        setRecommendedTier(tier);
        setRecommendedProfileId(activeProfile.id);
        setStep(resultStep);
      } catch {
        setPetInfo(profileToPetInfo(activeProfile));
        setAvatarSrc(activeProfile.profileImageUrl);
        setRecommendedTier(fallbackRecommend(answers));
        setRecommendedProfileId(activeProfile.id);
        setStep(resultStep);
      } finally {
        setIsAnalyzing(false);
      }
    })();
  }, [isViewResult, initReady, activeProfile, resultStep]);

  const isDirty =
    questions !== null &&
    baseline !== null &&
    step > 0 &&
    step < resultStep &&
    (!petInfoEqual(petInfo, baseline.petInfo) ||
      avatarSrc !== baseline.avatarSrc ||
      !answersEqual(answersByQuestion, baseline.answers));

  const isDirtyRef = useRef(isDirty);
  const isConfirmedLeaveRef = useRef(false);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  });

  function handleAvatarChange(src: string | null) {
    setAvatarSrc((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return src;
    });
  }

  const clearPendingLeave = useCallback(() => {
    pendingNavigateRef.current = null;
  }, []);

  const promptLeaveConfirm = useCallback(() => {
    openAlert({
      ...unsavedLeaveAlertOptions(() => {
        const navigate = pendingNavigateRef.current;
        pendingNavigateRef.current = null;
        navigate?.();
      }),
      onDismiss: clearPendingLeave,
    });
  }, [openAlert, clearPendingLeave]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!isDirtyRef.current || isConfirmedLeaveRef.current) return;
      const anchor = (e.target as Element).closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      try {
        const url = new URL(anchor.href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname) return;
      } catch {
        return;
      }
      e.preventDefault();
      e.stopImmediatePropagation();
      const targetHref = anchor.href;
      pendingNavigateRef.current = () => {
        isConfirmedLeaveRef.current = true;
        router.push(targetHref);
      };
      promptLeaveConfirm();
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [router, promptLeaveConfirm]);

  useEffect(() => {
    const original = window.history.pushState.bind(window.history);
    window.history.pushState = function (
      state: unknown,
      unused: string,
      url?: string | URL | null,
    ) {
      if (isDirtyRef.current && !isConfirmedLeaveRef.current && url != null) {
        try {
          const targetPath = new URL(url.toString(), window.location.origin).pathname;
          if (targetPath !== window.location.pathname) {
            const targetUrl = url.toString();
            pendingNavigateRef.current = () => {
              isConfirmedLeaveRef.current = true;
              router.push(targetUrl);
            };
            promptLeaveConfirm();
            return;
          }
        } catch {
          /* ignore */
        }
      }
      original(state, unused, url);
    };
    return () => {
      window.history.pushState = original;
    };
  }, [router, promptLeaveConfirm]);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handler = () => {
      if (!isDirtyRef.current || isConfirmedLeaveRef.current) return;
      window.history.pushState(null, "", window.location.href);
      pendingNavigateRef.current = () => {
        isConfirmedLeaveRef.current = true;
        window.history.go(-2);
      };
      promptLeaveConfirm();
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [promptLeaveConfirm]);

  function toggleOptionForQuestion(question: ChecklistQuestion, optionId: number) {
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
  }

  const currentQuestionId =
    questions && step >= 1 && step <= questions.length ? questions[step - 1].id : null;
  const isCurrentQuestionAnswered =
    currentQuestionId === null
      ? true
      : (answersByQuestion[currentQuestionId] ?? []).length > 0;

  function handleNext() {
    if (!questions?.length) return;
    if (step === 0) {
      if (!petInfo.name.trim()) return;
      trackChecklistStart();
      setStep(1);
      setMaxVisitedStep((prev) => Math.max(prev, 1));
      return;
    }
    if (!isCurrentQuestionAnswered) return;
    if (step < questions.length) {
      const next = step + 1;
      setStep(next);
      setMaxVisitedStep((prev) => Math.max(prev, next));
    }
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  function handleStepClick(targetStep: number) {
    if (targetStep >= 1 && targetStep <= maxVisitedStep && targetStep !== step) {
      if (targetStep > step && !isCurrentQuestionAnswered) return;
      setStep(targetStep);
    }
  }

  async function handleSubmit() {
    if (!questions?.length) return;
    const trimmedName = petInfo.name.trim();
    if (!trimmedName) return;
    if (!isCurrentQuestionAnswered) return;
    isConfirmedLeaveRef.current = true;
    setIsAnalyzing(true);

    const checklistAnswers: ChecklistAnswerInput[] = questions.map((q) => ({
      questionId: q.id,
      optionIds: answersByQuestion[q.id] ?? [],
    }));

    const trimmedBreed = petInfo.breed.trim();
    const trimmedNotes = petInfo.specialNotes.trim();
    const trimmedWeight = petInfo.weight.trim();
    const parsedWeight = trimmedWeight ? parseFloat(trimmedWeight) : Number.NaN;
    const weightValue =
      trimmedWeight && !Number.isNaN(parsedWeight) ? parsedWeight : null;
    const birthIso = petBirthToIso(petInfo.birthDate);

    let tier: RecommendedTier = fallbackRecommend(checklistAnswers);
    let savedProfileId: number | null = null;
    let checklistSaved = false;
    let saveError: unknown = null;
    try {
      if (isLoggedIn && activeProfile) {
        await updateProfile(activeProfile.id, {
          checklistAnswers,
          name: trimmedName,
          breed: trimmedBreed || null,
          specialNotes: trimmedNotes || null,
          gender: petInfo.gender,
          birthDate: birthIso,
          weight: weightValue,
        });
        savedProfileId = activeProfile.id;
        checklistSaved = true;
      } else if (isLoggedIn) {
        const body: CreateProfileRequest = {
          name: trimmedName,
          checklistAnswers,
          ...(trimmedBreed ? { breed: trimmedBreed } : {}),
          ...(trimmedNotes ? { specialNotes: trimmedNotes } : {}),
          ...(petInfo.gender ? { gender: petInfo.gender } : {}),
          ...(birthIso ? { birthDate: birthIso } : {}),
          ...(weightValue !== null ? { weight: weightValue } : {}),
        };
        const newProfile = await createProfile(body);
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
        title: getErrorMessage(saveError, "체크리스트 저장에 실패했습니다. 잠시 후 다시 시도해 주세요."),
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
    setStep(resultStep);
  }

  if (isAnalyzing) {
    return (
      <div className="flex min-h-[calc(100vh-54px)] flex-col items-center justify-center gap-6 bg-white px-4">
        <div className="relative h-16 w-16">
          <div
            className="absolute inset-0 animate-spin rounded-full border-4 border-transparent"
            style={{
              borderTopColor: "var(--color-accent-orange)",
              borderRightColor: "var(--color-accent-orange)",
            }}
          />
          <div
            className="absolute inset-[6px] animate-spin rounded-full border-4 border-transparent [animation-direction:reverse] [animation-duration:0.8s]"
            style={{ borderTopColor: "var(--color-basic)", borderRightColor: "var(--color-basic)" }}
          />
        </div>
        <p
          className="text-center max-md:text-body-16-r md:text-subtitle-18-m lg:text-subtitle-18-m leading-[1.7] tracking-[-0.02em] text-[var(--color-text)]"
          style={{
            fontFamily: '"Griun PolFairness", "Pretendard", "Apple SD Gothic Neo", sans-serif',
          }}
        >
          체크리스트를 생성하고 있습니다.
          <br />
          잠시만 기다려주세요
        </p>
      </div>
    );
  }

  if (step === resultStep && recommendedTier) {
    return (
      <ChecklistResult
        petInfo={petInfo}
        avatarSrc={avatarSrc}
        userId={user?.id ?? null}
        recommendedTier={recommendedTier}
        profileId={recommendedProfileId}
      />
    );
  }

  const qLen = questions?.length ?? 0;
  const lastQuestionStep = qLen;
  const ctaLabel =
    step === 0 ? "체크리스트 작성하기" : step === lastQuestionStep ? "결과보기" : "다음";
  const isStep0NameValid = petInfo.name.trim().length > 0;
  const isMobileCtaDisabled =
    (step === 0 && !isStep0NameValid) ||
    (step >= 1 && step <= qLen && !isCurrentQuestionAnswered);

  function handleMobileCta() {
    if (step === 0 && !isStep0NameValid) return;
    if (step === lastQuestionStep) void handleSubmit();
    else handleNext();
  }

  return (
    <>
      <div className="min-h-[calc(100vh-54px)] bg-white pb-12 bg-white md:pb-16 lg:pb-16">
        {step === 0 ? (
          <ChecklistHero />
        ) : (
          <div className="max-md:hidden">
            <ChecklistHero />
          </div>
        )}

        <div className="relative z-10 mx-auto w-full max-md:max-w-[640px] md:max-w-[1013px] lg:max-w-[1013px] px-4 md:px-8 lg:px-8">
          <div className={`rounded-[20px] bg-white px-5 py-5 md:py-8 lg:py-8 shadow-[0px_4px_24px_rgba(0,0,0,0.08)] md:-mt-[50px] lg:-mt-[50px] md:px-8 lg:px-8 md:py-12 lg:py-12 ${step === 0 ? "max-md:-mt-9.5" : "max-md:mt-4"}`}>
            <div className="mx-auto w-full max-w-[900px]">
              {questionsError ? (
                <p className="text-center text-body-16-m text-[var(--color-text-secondary)]">{questionsError}</p>
              ) : questions === null ? (
                <p className="text-center text-body-16-m text-[var(--color-text-secondary)]">불러오는 중…</p>
              ) : !initReady ? (
                <p className="text-center text-body-16-m text-[var(--color-text-secondary)]">프로필 불러오는 중…</p>
              ) : questions.length === 0 ? (
                <p className="text-center text-body-16-m text-[var(--color-text-secondary)]">
                  표시할 질문이 없습니다.
                </p>
              ) : (
                <>
                  {step === 0 && (
                    <ChecklistPetForm
                      petInfo={petInfo}
                      setPetInfo={setPetInfo}
                      avatarSrc={avatarSrc}
                      userId={user?.id ?? null}
                      onAvatarChange={handleAvatarChange}
                    />
                  )}
                  {step > 0 && step <= qLen && questions[step - 1] ? (
                    <ChecklistQuestionStep
                      key={questions[step - 1].id}
                      question={questions[step - 1]}
                      stepIndex={step}
                      totalSteps={qLen}
                      selectedOptionIds={answersByQuestion[questions[step - 1].id] ?? []}
                      onToggleOption={(optionId) =>
                        toggleOptionForQuestion(questions[step - 1], optionId)
                      }
                      onBack={handleBack}
                      maxVisitedStep={maxVisitedStep}
                      onStepClick={handleStepClick}
                    />
                  ) : null}
                </>
              )}
            </div>
          </div>

          {questions && questions.length > 0 && initReady ? (
            <div className="mt-8 md:mt-10 w-full">
              <div className="md:mx-auto md:max-w-[320px]">
                <Button
                  type="button"
                  onClick={handleMobileCta}
                  disabled={isMobileCtaDisabled}
                  variant="primary"
                  size="lg"
                  className={CTA_CLASS}
                >
                  {ctaLabel}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

    </>
  );
}
