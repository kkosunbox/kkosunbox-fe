"use client";

import { Button } from "@/shared/ui";
import ChecklistHero from "./ChecklistHero";
import ChecklistPetForm from "./ChecklistPetForm";
import ChecklistQuestionStep from "./ChecklistQuestionStep";
import ChecklistResult from "./ChecklistResult";
import { useChecklistSection } from "./checklist-section/useChecklistSection";

const CTA_CLASS =
  "!h-[56px] !w-full !bg-[var(--color-accent)] !text-subtitle-16-sb transition-opacity hover:opacity-90 active:opacity-80 disabled:!cursor-not-allowed disabled:!opacity-50 disabled:hover:!opacity-50";

/* ─── Widget (표현 전담 — 상태·이펙트는 useChecklistSection 소유) ─── */
export default function ChecklistSection() {
  const {
    questions,
    questionsError,
    qLen,
    step,
    maxVisitedStep,
    resultStep,
    initReady,
    isAnalyzing,
    recommendedTier,
    recommendedProfileId,
    petInfo,
    setPetInfo,
    avatarSrc,
    answersByQuestion,
    userId,
    ctaLabel,
    isMobileCtaDisabled,
    handleAvatarChange,
    toggleOptionForQuestion,
    handleBack,
    handleStepClick,
    handleMobileCta,
  } = useChecklistSection();

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
        userId={userId}
        recommendedTier={recommendedTier}
        profileId={recommendedProfileId}
      />
    );
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
                      userId={userId}
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
