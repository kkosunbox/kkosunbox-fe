"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button, PROFILE_PET_SUBMIT_BTN } from "@/shared/ui";
import type {
  ChecklistFormOptions,
  OpenChecklistFormDetail,
} from "@/shared/lib/checklistModal";
import ChecklistPetForm from "./ChecklistPetForm";
import ChecklistQuestionStep from "./ChecklistQuestionStep";
import { useChecklistForm } from "./checklist-form/useChecklistForm";

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
  const {
    questions,
    questionsError,
    initReady,
    isAnalyzing,
    step,
    qLen,
    maxVisitedStep,
    petInfo,
    setPetInfo,
    avatarSrc,
    answersByQuestion,
    userId,
    headerTitle,
    ctaLabel,
    isCtaDisabled,
    handleCloseRequest,
    handleAvatarChange,
    handleAvatarFileSelect,
    toggleOptionForQuestion,
    onBack,
    onStepClick,
    primaryAction,
  } = useChecklistForm(options, onClose);

  /* body 스크롤 잠금 */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
                  userId={userId}
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
                  onBack={onBack}
                  maxVisitedStep={maxVisitedStep}
                  onStepClick={onStepClick}
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
                onClick={primaryAction}
                disabled={isCtaDisabled}
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
  // 방금 연 모달이 닫히는 것을 막기 위한 가드. (렌더 중 읽어야 하므로 ref 대신 state)
  const [ignoreNextPathname, setIgnoreNextPathname] = useState(false);

  // 경로가 바뀌면 모달을 닫는다. effect 안에서 setState하면 연쇄 렌더(set-state-in-effect)가
  // 발생하므로, "직전 경로와 비교해 렌더 중 보정"하는 React 권장 패턴을 사용한다.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (ignoreNextPathname) {
      setIgnoreNextPathname(false);
    } else if (isOpen) {
      setIsOpen(false);
    }
  }

  useEffect(() => {
    const handler = (e: Event) => {
      const { viaRedirect, ...detail } =
        (e as CustomEvent<OpenChecklistFormDetail>).detail ?? {};
      setIgnoreNextPathname(Boolean(viaRedirect));
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
