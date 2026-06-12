"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Button,
  PROFILE_PET_SUBMIT_BTN,
  useModal,
} from "@/shared/ui";
import { unsavedCloseAlertOptions } from "@/shared/lib/modal/alertPresets";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { getProfileImagePresignedUrl, uploadToS3 } from "@/shared/lib/asset";
import { useAuth } from "@/features/auth";
import {
  createProfile,
  getChecklistQuestions,
  updateProfile,
} from "@/features/profile/api/profileApi";
import {
  MAX_PROFILE_COUNT,
  type ChecklistAnswerInput,
  type ChecklistQuestion,
  type CreateProfileRequest,
  type Profile,
} from "@/features/profile/api/types";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { getSubscriptionPlans } from "@/features/subscription/api/subscriptionApi";
import { tierFromSubscriptionPlan } from "@/entities/package";
import type {
  ChecklistFormOptions,
  OpenChecklistFormDetail,
} from "@/shared/lib/checklistModal";
import ChecklistPetForm from "./ChecklistPetForm";
import ChecklistQuestionStep from "./ChecklistQuestionStep";
import type { PetInfo, RecommendedTier } from "./types";

/* ── helpers (로컬) ── */
function parseProfileBirthDate(iso: string | null | undefined): Date | null {
  if (!iso?.trim()) return null;
  const day = iso.slice(0, 10);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function petBirthToIso(date: Date | null): string | null {
  if (!date) return null;
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

function profileToPetInfo(p: Profile): PetInfo {
  return {
    name: p.name?.trim() ?? "",
    breed: p.breed?.trim() ?? "",
    specialNotes: p.specialNotes?.trim() ?? "",
    birthDate: parseProfileBirthDate(p.birthDate),
    weight:
      p.weight != null && !Number.isNaN(Number(p.weight)) ? String(p.weight) : "",
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
  if (
    a.name !== b.name ||
    a.breed !== b.breed ||
    a.specialNotes !== b.specialNotes ||
    a.weight !== b.weight ||
    a.gender !== b.gender
  )
    return false;
  return (a.birthDate?.getTime() ?? null) === (b.birthDate?.getTime() ?? null);
}

function answersEqual(
  a: Record<number, number[]>,
  b: Record<number, number[]>,
): boolean {
  const keys = new Set(
    [...Object.keys(a), ...Object.keys(b)].map(Number),
  );
  for (const k of keys) {
    const ak = [...(a[k] ?? [])].sort((x, y) => x - y);
    const bk = [...(b[k] ?? [])].sort((x, y) => x - y);
    if (ak.length !== bk.length || !ak.every((x, i) => x === bk[i]))
      return false;
  }
  return true;
}

function fallbackRecommend(answers: ChecklistAnswerInput[]): RecommendedTier {
  const n = answers.reduce((s, a) => s + a.optionIds.length, 0);
  if (n >= 6) return "premium";
  if (n >= 3) return "standard";
  return "basic";
}

const EMPTY_PET_INFO: PetInfo = {
  name: "",
  breed: "",
  specialNotes: "",
  birthDate: null,
  weight: "",
  gender: null,
};

interface Baseline {
  petInfo: PetInfo;
  avatarSrc: string | null;
  answers: Record<number, number[]>;
}

const CTA_CLASS = `${PROFILE_PET_SUBMIT_BTN} disabled:hover:!opacity-50`;

/* ── X 아이콘 ── */
function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 2L2 16M2 2L16 16"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── 분석 스피너 ── */
function AnalyzingSpinner() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-6 px-4">
      <div className="relative h-14 w-14">
        <div
          className="absolute inset-0 animate-spin rounded-full border-4 border-transparent"
          style={{
            borderTopColor: "var(--color-accent-orange)",
            borderRightColor: "var(--color-accent-orange)",
          }}
        />
        <div
          className="absolute inset-[6px] animate-spin rounded-full border-4 border-transparent [animation-direction:reverse] [animation-duration:0.8s]"
          style={{
            borderTopColor: "var(--color-basic)",
            borderRightColor: "var(--color-basic)",
          }}
        />
      </div>
      <p
        className="text-center text-body-15-m leading-[1.7] tracking-[-0.02em] text-[var(--color-text)]"
        style={{
          fontFamily:
            '"Griun PolFairness", "Pretendard", "Apple SD Gothic Neo", sans-serif',
        }}
      >
        체크리스트를 분석하고 있습니다.
        <br />
        잠시만 기다려주세요
      </p>
    </div>
  );
}

/* ── Inner modal (실제 로직 보유) ── */
function ChecklistFormModalInner({
  options,
  onClose,
}: {
  options: ChecklistFormOptions;
  onClose: () => void;
}) {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const {
    profile: activeProfile,
    profiles,
    refreshProfile,
    setActiveProfileId,
  } = useProfile();

  const [questions, setQuestions] = useState<ChecklistQuestion[] | null>(null);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const [maxVisitedStep, setMaxVisitedStep] = useState(0);
  const [initReady, setInitReady] = useState(false);
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [petInfo, setPetInfo] = useState<PetInfo>(EMPTY_PET_INFO);
  const [answersByQuestion, setAnswersByQuestion] = useState<
    Record<number, number[]>
  >({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const avatarFileRef = useRef<File | null>(null);
  const { openAlert } = useModal();

  /* body 스크롤 잠금 */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /* 질문 목록 로드 */
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

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  /* 초기 상태 복원 */
  useEffect(() => {
    if (questions === null) return;
    if (stepRef.current > 0) return;

    let cancelled = false;

    void (async () => {
      let pet = EMPTY_PET_INFO;
      let av: string | null = null;
      let restoredAnswers: Record<number, number[]> = {};
      let initialStep = 0;

      if (options.isNewProfile) {
        pet = EMPTY_PET_INFO;
        av = null;
        restoredAnswers = {};
        initialStep = 0;
      } else if (options.editProfile && isLoggedIn && activeProfile) {
        pet = profileToPetInfo(activeProfile);
        av = activeProfile.profileImageUrl;
        initialStep = 0;
      } else if (isLoggedIn && activeProfile) {
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
        if (pet.name.trim()) initialStep = 1;
      }

      if (cancelled) return;

      if (!options.isNewProfile && !options.editProfile) {
        if (options.rewrite) {
          initialStep = 1;
        }

        if (options.editQuestionId != null) {
          const idx = questions.findIndex((q) => q.id === options.editQuestionId);
          if (idx >= 0) initialStep = idx + 1;
        }
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
      avatarFileRef.current = null;
    })();

    return () => {
      cancelled = true;
    };
  }, [questions, isLoggedIn, activeProfile, options]);

  /* blob URL 정리 */
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

  const isDirtyRef = useRef(isDirty);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  });

  /** 미저장 확인 AlertModal(z-[210])이 열려 있을 때 ESC를 ChecklistFormModal이 가로채지 않도록 */
  const closeConfirmOpenRef = useRef(false);

  const promptCloseConfirm = useCallback(() => {
    const resetConfirm = () => {
      closeConfirmOpenRef.current = false;
    };
    closeConfirmOpenRef.current = true;
    const opts = unsavedCloseAlertOptions(() => {
      resetConfirm();
      onClose();
    });
    openAlert({
      ...opts,
      onDismiss: resetConfirm,
      onSecondary: () => {
        opts.onSecondary?.();
        resetConfirm();
      },
    });
  }, [openAlert, onClose]);

  /* ESC 처리 — 캡처 단계에서 가로채 ModalProvider보다 먼저 실행 */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (closeConfirmOpenRef.current) return;
      e.stopImmediatePropagation();
      if (isDirtyRef.current) {
        promptCloseConfirm();
      } else {
        onClose();
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [onClose, promptCloseConfirm]);

  function handleCloseRequest() {
    if (isDirtyRef.current) {
      promptCloseConfirm();
    } else {
      onClose();
    }
  }

  function handleAvatarChange(src: string | null) {
    setAvatarSrc((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return src;
    });
    if (!src) avatarFileRef.current = null;
  }

  function handleAvatarFileSelect(file: File) {
    avatarFileRef.current = file;
  }

  function toggleOptionForQuestion(
    question: ChecklistQuestion,
    optionId: number,
  ) {
    const { id: questionId, isMultiSelect, options: opts } = question;
    setAnswersByQuestion((prev) => {
      const cur = prev[questionId] ?? [];
      if (!isMultiSelect) return { ...prev, [questionId]: [optionId] };
      if (cur.includes(optionId))
        return { ...prev, [questionId]: cur.filter((x) => x !== optionId) };
      const clicked = opts.find((o) => o.id === optionId);
      if (clicked?.isExclusive)
        return { ...prev, [questionId]: [optionId] };
      const exclusiveIds = new Set(
        opts.filter((o) => o.isExclusive).map((o) => o.id),
      );
      return {
        ...prev,
        [questionId]: [...cur.filter((id) => !exclusiveIds.has(id)), optionId],
      };
    });
  }

  const qLen = questions?.length ?? 0;
  const currentQuestionId =
    questions && step >= 1 && step <= qLen ? questions[step - 1].id : null;
  const isCurrentQuestionAnswered =
    currentQuestionId === null
      ? true
      : (answersByQuestion[currentQuestionId] ?? []).length > 0;

  function handleNext() {
    if (!questions?.length) return;
    if (step === 0) {
      if (!petInfo.name.trim()) return;
      if (options.editProfile) {
        void handleSaveProfile();
        return;
      }
      setStep(1);
      setMaxVisitedStep((prev) => Math.max(prev, 1));
      return;
    }
    if (!isCurrentQuestionAnswered) return;
    if (step < qLen) {
      const next = step + 1;
      setStep(next);
      setMaxVisitedStep((prev) => Math.max(prev, next));
    }
  }

  function handleBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  function handleStepClick(targetStep: number) {
    if (
      targetStep >= 1 &&
      targetStep <= maxVisitedStep &&
      targetStep !== step
    ) {
      if (targetStep > step && !isCurrentQuestionAnswered) return;
      setStep(targetStep);
    }
  }

  async function handleSaveProfile() {
    if (!isLoggedIn || !activeProfile) return;
    const trimmedName = petInfo.name.trim();
    if (!trimmedName) return;

    setIsSaving(true);

    const trimmedBreed = petInfo.breed.trim();
    const trimmedNotes = petInfo.specialNotes.trim();
    const trimmedWeight = petInfo.weight.trim();
    const parsedWeight = trimmedWeight ? parseFloat(trimmedWeight) : Number.NaN;
    const weightValue =
      trimmedWeight && !Number.isNaN(parsedWeight) ? parsedWeight : null;
    const birthIso = petBirthToIso(petInfo.birthDate);

    try {
      let profileImageUrl: string | null | undefined;

      const file = avatarFileRef.current;
      if (file) {
        const { uploadUrl, fileUrl } = await getProfileImagePresignedUrl({
          fileName: file.name,
          fileType: file.type,
        });
        await uploadToS3(uploadUrl, file, file.type);
        profileImageUrl = fileUrl;
      }

      await updateProfile(activeProfile.id, {
        name: trimmedName,
        breed: trimmedBreed || null,
        specialNotes: trimmedNotes || null,
        gender: petInfo.gender,
        birthDate: birthIso,
        weight: weightValue,
        ...(profileImageUrl !== undefined ? { profileImageUrl } : {}),
      });
      await refreshProfile();
      avatarFileRef.current = null;
      onClose();
    } catch (e) {
      openAlert({
        title: getErrorMessage(e, "저장 중 오류가 발생했습니다. 다시 시도해주세요."),
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSubmit() {
    if (!questions?.length) return;
    const trimmedName = petInfo.name.trim();
    if (!trimmedName) return;
    if (!isCurrentQuestionAnswered) return;
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

    try {
      if (options.isNewProfile) {
        if (profiles.length >= MAX_PROFILE_COUNT) {
          openAlert({
            type: "info",
            title: `프로필은 최대 ${MAX_PROFILE_COUNT}개까지 등록할 수 있습니다.`,
          });
          setIsAnalyzing(false);
          return;
        }
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
      } else if (isLoggedIn && activeProfile) {
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
            pt === "Premium"
              ? "premium"
              : pt === "Standard"
                ? "standard"
                : "basic";
        }
      }
    } catch (e) {
      console.error("[ChecklistFormModal] save or plan fetch failed", e);
    }

    if (checklistSaved && user?.id) {
      localStorage.setItem(`kkosun_checklist_done_${user.id}`, "true");
    }

    router.push(`/checklist/result?tier=${tier}`);
  }

  const isStep0NameValid = petInfo.name.trim().length > 0;
  const lastQuestionStep = qLen;
  const isEditProfileMode = options.editProfile === true;
  const ctaLabel =
    step === 0
      ? isEditProfileMode
        ? isSaving
          ? "저장 중…"
          : "저장"
        : "체크리스트 작성하기"
      : step === lastQuestionStep
        ? "결과보기"
        : "다음";
  const isMobileCtaDisabled =
    isSaving ||
    (step === 0 && !isStep0NameValid) ||
    (step >= 1 && step <= qLen && !isCurrentQuestionAnswered);

  function handleMobileCta() {
    if (step === 0 && !isStep0NameValid) return;
    if (step === lastQuestionStep) void handleSubmit();
    else handleNext();
  }

  const headerTitle = step === 0 ? "프로필 작성" : "체크리스트 작성";

  return (
    <div
      className="fixed inset-0 z-[200] md:flex md:items-center md:justify-center md:overflow-y-auto md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={headerTitle}
    >
      {/* 배경 — 데스크탑 전용 */}
      <div
        className="absolute inset-0 bg-black/50 max-md:hidden"
        onClick={handleCloseRequest}
        aria-hidden="true"
      />

      {/* 모달 카드 — 모바일: 뷰포트 전체(상단 safe-area 포함) */}
      <div className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden bg-white max-md:min-h-[100dvh] md:h-[610px] md:w-full md:max-w-[908px] md:rounded-[20px] md:shadow-[0px_4px_24px_rgba(0,0,0,0.08)]">
        {/* 헤더 */}
        <div
          className="shrink-0 px-6 max-md:pt-[env(safe-area-inset-top,0px)]"
          style={{ background: "var(--color-cta-button)" }}
        >
          <div className="relative flex h-[48px] items-center">
            <span className="text-subtitle-16-sb tracking-[-0.04em] text-white">
              {headerTitle}
            </span>
            <button
              type="button"
              onClick={handleCloseRequest}
              aria-label="닫기"
              className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center transition-opacity hover:opacity-70"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto max-md:px-5 md:px-10 lg:px-[94px] pt-8 md:pt-14 pb-4">
          {isAnalyzing ? (
            <AnalyzingSpinner />
          ) : questionsError ? (
            <p className="py-12 text-center text-body-15-m text-[var(--color-text-secondary)]">
              {questionsError}
            </p>
          ) : questions === null || !initReady ? (
            <p className="py-12 text-center text-body-15-m text-[var(--color-text-secondary)]">
              불러오는 중…
            </p>
          ) : questions.length === 0 ? (
            <p className="py-12 text-center text-body-15-m text-[var(--color-text-secondary)]">
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
                  onAvatarFileSelect={handleAvatarFileSelect}
                />
              )}
              {step > 0 && step <= qLen && questions[step - 1] ? (
                <ChecklistQuestionStep
                  key={questions[step - 1].id}
                  question={questions[step - 1]}
                  stepIndex={step}
                  totalSteps={qLen}
                  selectedOptionIds={
                    answersByQuestion[questions[step - 1].id] ?? []
                  }
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

        {!isAnalyzing && questions && questions.length > 0 && initReady && (
          <div className="shrink-0 max-md:px-5 md:px-10 lg:px-[94px] pb-7 md:pb-[44px] pt-2 md:pt-4">
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
        )}

      </div>
    </div>
  );
}

/* ── Root (이벤트 리스너 + 마운트 관리) ── */
export default function ChecklistFormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ChecklistFormOptions>({});
  const pathname = usePathname();
  // 리다이렉트 진입(/checklist → / replace) 직후의 1회성 경로 변경으로
  // 방금 연 모달이 닫히는 것을 막기 위한 가드.
  const ignoreNextPathnameRef = useRef(false);

  useEffect(() => {
    if (ignoreNextPathnameRef.current) {
      ignoreNextPathnameRef.current = false;
      return;
    }
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { viaRedirect, ...detail } =
        (e as CustomEvent<OpenChecklistFormDetail>).detail ?? {};
      if (viaRedirect) ignoreNextPathnameRef.current = true;
      setOptions(detail);
      setIsOpen(true);
    };
    window.addEventListener("ggosoon:open-checklist-form", handler);
    return () =>
      window.removeEventListener("ggosoon:open-checklist-form", handler);
  }, []);

  if (!isOpen) return null;

  return (
    <ChecklistFormModalInner
      options={options}
      onClose={() => setIsOpen(false)}
    />
  );
}
