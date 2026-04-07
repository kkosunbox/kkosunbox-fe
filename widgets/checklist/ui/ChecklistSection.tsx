"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui";
import ChecklistHero from "./ChecklistHero";
import ChecklistPetForm from "./ChecklistPetForm";
import ChecklistQuestionStep from "./ChecklistQuestionStep";
import ChecklistResult from "./ChecklistResult";
import { mockRecommend } from "./types";
import type { Step, PetInfo, Answers, RecommendedTier } from "./types";

const CTA_CLASS =
  "!h-[56px] !w-full !bg-[var(--color-accent)] !text-subtitle-16-sb transition-opacity hover:opacity-90 active:opacity-80";

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
  const [step, setStep] = useState<Step>(0);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [petInfo, setPetInfo] = useState<PetInfo>({
    name: "",
    birthDate: null,
    weight: "",
    gender: null,
  });
  const [answers, setAnswers] = useState<Answers>({
    allergies: [],
    healthCare: [],
    snack: [],
    texture: [],
  });
  const [recommendedTier, setRecommendedTier] = useState<RecommendedTier | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const pendingNavigateRef = useRef<(() => void) | null>(null);

  // step=5(결과)는 완료 상태 — 이탈 가드 불필요
  const isDirty =
    step > 0 &&
    step < 5 &&
    (petInfo.name !== "" ||
      petInfo.birthDate !== null ||
      petInfo.weight !== "" ||
      petInfo.gender !== null);

  const isDirtyRef = useRef(isDirty);
  const isConfirmedLeaveRef = useRef(false);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  });

  /* avatar URL 정리 */
  function handleAvatarChange(src: string | null) {
    setAvatarSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return src;
    });
  }

  /* ① beforeunload */
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  /* ② <a> 클릭 차단 */
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

  /* ③ history.pushState 패치 */
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
          /* URL 파싱 실패 시 통과 */
        }
      }
      original(state, unused, url);
    };
    return () => {
      window.history.pushState = original;
    };
  }, [router]);

  /* ④ popstate: 뒤로가기 */
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

  function toggleOption(key: keyof Answers, value: string) {
    setAnswers((prev) => {
      const current = prev[key];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      };
    });
  }

  function handleNext() {
    if (step < 4) setStep((prev) => (prev + 1) as Step);
  }

  function handleBack() {
    if (step > 0) setStep((prev) => (prev - 1) as Step);
  }

  function handleSubmit() {
    isConfirmedLeaveRef.current = true;
    const tier = mockRecommend(answers);
    setRecommendedTier(tier);
    localStorage.setItem("kkosun_checklist_done", "true");
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setStep(5);
    }, 2500);
  }

  /* 분석 로딩 화면 */
  if (isAnalyzing) {
    return (
      <div className="flex min-h-[calc(100vh-54px)] flex-col items-center justify-center gap-6 bg-white px-4">
        {/* 스피너 */}
        <div className="relative h-16 w-16">
          <div
            className="absolute inset-0 animate-spin rounded-full border-4 border-transparent"
            style={{ borderTopColor: "var(--color-accent-orange)", borderRightColor: "var(--color-accent-orange)" }}
          />
          <div
            className="absolute inset-[6px] animate-spin rounded-full border-4 border-transparent [animation-direction:reverse] [animation-duration:0.8s]"
            style={{ borderTopColor: "var(--color-basic)", borderRightColor: "var(--color-basic)" }}
          />
        </div>
        {/* 문구 */}
        <p
          className="text-center max-md:text-body-16-r md:text-subtitle-18-m leading-[1.7] tracking-[-0.02em] text-[var(--color-text)]"
          style={{
            fontFamily: '"Griun PolFairness", "Pretendard", "Apple SD Gothic Neo", sans-serif',
          }}
        >
          체크리스트를 생성성하고 있습니다.
          <br />
          잠시만 기다려주세요
        </p>
      </div>
    );
  }

  /* step=5: 결과 페이지 */
  if (step === 5 && recommendedTier) {
    return (
      <ChecklistResult
        petInfo={petInfo}
        avatarSrc={avatarSrc}
        recommendedTier={recommendedTier}
      />
    );
  }

  /* step 0~4: 히어로 + 폼 카드 */
  const ctaLabel =
    step === 0
      ? "체크리스트 작성하기"
      : step === 4
        ? "결과보기"
        : "다음";

  function handleMobileCta() {
    if (step === 4) handleSubmit();
    else handleNext();
  }

  return (
    <>
      <div className="min-h-[calc(100vh-54px)] bg-white pb-12 max-md:bg-[var(--color-background)] md:bg-white md:pb-16">
        <ChecklistHero />

        <div className="relative z-10 mx-auto w-full max-w-[1013px] px-4 md:px-8">
          <div className="rounded-[20px] bg-white px-5 py-8 shadow-[0px_4px_24px_rgba(0,0,0,0.08)] max-md:-mt-12 md:-mt-[50px] md:px-8 md:py-12">
            <div className="mx-auto w-full max-w-[900px]">
              {step === 0 && (
                <ChecklistPetForm
                  petInfo={petInfo}
                  setPetInfo={setPetInfo}
                  avatarSrc={avatarSrc}
                  onAvatarChange={handleAvatarChange}
                  onNext={handleNext}
                />
              )}
              {step > 0 && step < 5 && (
                <ChecklistQuestionStep
                  step={step as 1 | 2 | 3 | 4}
                  answers={answers}
                  onToggle={toggleOption}
                  onBack={handleBack}
                  onNext={step === 4 ? handleSubmit : handleNext}
                />
              )}
            </div>
          </div>

          {/* 모바일 CTA */}
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
        </div>
      </div>

      {showLeaveModal && (
        <LeaveConfirmModal onConfirm={handleLeaveConfirm} onCancel={handleLeaveCancel} />
      )}
    </>
  );
}
