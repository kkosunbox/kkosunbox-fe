"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/shared/ui";
import { useAuth } from "@/features/auth";
import { getChecklistQuestions, updateProfile } from "@/features/profile/api/profileApi";
import type { ChecklistAnswerInput, ChecklistQuestion, Profile } from "@/features/profile/api/types";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { getSubscriptionPlans } from "@/features/subscription/api/subscriptionApi";
import { tierFromSubscriptionPlan } from "@/widgets/subscribe/plans/ui/packageData";
import ChecklistHero from "./ChecklistHero";
import ChecklistPetForm from "./ChecklistPetForm";
import ChecklistQuestionStep from "./ChecklistQuestionStep";
import ChecklistResult from "./ChecklistResult";
import type { PetInfo, RecommendedTier } from "./types";

const CTA_CLASS =
  "!h-[56px] !w-full !bg-[var(--color-accent)] !text-subtitle-16-sb transition-opacity hover:opacity-90 active:opacity-80";

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

function profileToPetInfo(p: Profile): PetInfo {
  return {
    name: p.name?.trim() ?? "",
    birthDate: parseProfileBirthDate(p.birthDate),
    weight: p.weight != null && !Number.isNaN(Number(p.weight)) ? String(p.weight) : "",
    gender: p.gender ?? null,
  };
}

function clonePetInfo(p: PetInfo): PetInfo {
  return {
    name: p.name,
    birthDate: p.birthDate ? new Date(p.birthDate.getTime()) : null,
    weight: p.weight,
    gender: p.gender,
  };
}

function petInfoEqual(a: PetInfo, b: PetInfo): boolean {
  if (a.name !== b.name || a.weight !== b.weight || a.gender !== b.gender) return false;
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
  birthDate: null,
  weight: "",
  gender: null,
};

/* ─── Leave confirm modal ─── */
function LeaveConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-modal-title"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-[320px] rounded-[24px] bg-white px-6 py-8 shadow-[0px_8px_32px_rgba(0,0,0,0.12)] md:max-w-[360px]">
        <p
          id="leave-modal-title"
          className="text-center max-md:text-subtitle-17-b md:text-subtitle-18-b tracking-[-0.02em] text-[var(--color-text)]"
        >
          작성 중인 내용이 있어요
        </p>
        <p className="mt-3 text-center max-md:text-body-13-m md:text-body-14-m leading-[1.6] tracking-[-0.02em] text-[var(--color-text-secondary)]">
          페이지를 나가면 지금까지 작성한
          <br />
          내용이 저장되지 않아요.
        </p>
        <div className="mt-7 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="h-[48px] w-full rounded-full max-md:text-body-14-sb md:text-btn-15-sb tracking-[-0.02em] text-white transition-opacity hover:opacity-90 active:opacity-80"
            style={{ background: "var(--color-accent)" }}
          >
            계속 작성하기
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-[48px] w-full rounded-full bg-[var(--color-surface-light)] max-md:text-body-14-m md:text-body-15-m tracking-[-0.02em] text-[var(--color-text-secondary)] transition-opacity hover:opacity-80 active:opacity-70"
          >
            나가기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Widget ─── */
export default function ChecklistSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuth();
  const { profile: activeProfile, refreshProfile } = useProfile();
  const editQuestionIdParam = searchParams.get("editQuestionId");
  const returnTo = searchParams.get("returnTo");

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
    birthDate: null,
    weight: "",
    gender: null,
  });
  const [answersByQuestion, setAnswersByQuestion] = useState<Record<number, number[]>>({});
  const [recommendedTier, setRecommendedTier] = useState<RecommendedTier | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const pendingNavigateRef = useRef<(() => void) | null>(null);

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
      }

      if (cancelled) return;

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
      setShowLeaveModal(true);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [router]);

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
            setShowLeaveModal(true);
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
  }, [router]);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handler = () => {
      if (!isDirtyRef.current || isConfirmedLeaveRef.current) return;
      window.history.pushState(null, "", window.location.href);
      pendingNavigateRef.current = () => {
        isConfirmedLeaveRef.current = true;
        window.history.go(-2);
      };
      setShowLeaveModal(true);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  function handleLeaveConfirm() {
    setShowLeaveModal(false);
    const navigate = pendingNavigateRef.current;
    pendingNavigateRef.current = null;
    navigate?.();
  }

  function handleLeaveCancel() {
    setShowLeaveModal(false);
    pendingNavigateRef.current = null;
  }

  function toggleOptionForQuestion(questionId: number, optionId: number, multi: boolean) {
    setAnswersByQuestion((prev) => {
      const cur = prev[questionId] ?? [];
      if (multi) {
        return {
          ...prev,
          [questionId]: cur.includes(optionId)
            ? cur.filter((x) => x !== optionId)
            : [...cur, optionId],
        };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  }

  function handleNext() {
    if (!questions?.length) return;
    if (step === 0) {
      setStep(1);
      setMaxVisitedStep((prev) => Math.max(prev, 1));
      return;
    }
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
      setStep(targetStep);
    }
  }

  async function handleSubmit() {
    if (!questions?.length) return;
    isConfirmedLeaveRef.current = true;
    setIsAnalyzing(true);

    const checklistAnswers: ChecklistAnswerInput[] = questions.map((q) => ({
      questionId: q.id,
      optionIds: answersByQuestion[q.id] ?? [],
    }));

    let tier: RecommendedTier = fallbackRecommend(checklistAnswers);
    try {
      if (isLoggedIn && activeProfile) {
        await updateProfile(activeProfile.id, { checklistAnswers });
        await refreshProfile();
        const planRes = await getSubscriptionPlans(activeProfile.id);
        const rec = planRes.plans.find((p) => p.isRecommended);
        if (rec) {
          const pt = tierFromSubscriptionPlan(rec);
          tier =
            pt === "Premium" ? "premium" : pt === "Standard" ? "standard" : "basic";
        }
      }
    } catch (e) {
      console.error("[ChecklistSection] save or plan fetch failed", e);
    }

    localStorage.setItem("kkosun_checklist_done", "true");

    if (returnTo === "mypage") {
      setIsAnalyzing(false);
      router.push("/mypage");
      return;
    }

    setRecommendedTier(tier);
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
          className="text-center max-md:text-body-16-r md:text-subtitle-18-m leading-[1.7] tracking-[-0.02em] text-[var(--color-text)]"
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
        recommendedTier={recommendedTier}
      />
    );
  }

  const qLen = questions?.length ?? 0;
  const lastQuestionStep = qLen;
  const ctaLabel =
    step === 0 ? "체크리스트 작성하기" : step === lastQuestionStep ? "결과보기" : "다음";

  function handleMobileCta() {
    if (step === lastQuestionStep) void handleSubmit();
    else handleNext();
  }

  return (
    <>
      <div className="min-h-[calc(100vh-54px)] bg-white pb-12 max-md:bg-[var(--color-background)] md:bg-white md:pb-16">
        {step === 0 ? (
          <ChecklistHero />
        ) : (
          <div className="max-md:hidden">
            <ChecklistHero />
          </div>
        )}

        <div className="relative z-10 mx-auto w-full max-w-[1013px] px-4 md:px-8">
          <div className={`rounded-[20px] bg-white px-5 py-5 md:py-8 shadow-[0px_4px_24px_rgba(0,0,0,0.08)] md:-mt-[50px] md:px-8 md:py-12 ${step === 0 ? "max-md:-mt-12" : "max-md:mt-4"}`}>
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
                      onAvatarChange={handleAvatarChange}
                      onNext={handleNext}
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
                        toggleOptionForQuestion(
                          questions[step - 1].id,
                          optionId,
                          questions[step - 1].isMultiSelect,
                        )
                      }
                      onBack={handleBack}
                      onNext={step === lastQuestionStep ? () => void handleSubmit() : handleNext}
                      isLastQuestion={step === lastQuestionStep}
                      maxVisitedStep={maxVisitedStep}
                      onStepClick={handleStepClick}
                    />
                  ) : null}
                </>
              )}
            </div>
          </div>

          {questions && questions.length > 0 && initReady ? (
            <div className="mt-6 w-full md:hidden">
              <Button
                type="button"
                onClick={handleMobileCta}
                variant="primary"
                size="lg"
                className={CTA_CLASS}
              >
                {ctaLabel}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {showLeaveModal && (
        <LeaveConfirmModal onConfirm={handleLeaveConfirm} onCancel={handleLeaveCancel} />
      )}
    </>
  );
}
