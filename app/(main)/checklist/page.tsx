"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ─── Types ─── */
type Step = 0 | 1 | 2 | 3 | 4;
type Gender = "male" | "female" | null;
type RecommendedTier = "basic" | "standard" | "premium";

interface PetInfo {
  name: string;
  age: string;
  weight: string;
  gender: Gender;
}

interface Answers {
  allergies: string[];
  healthCare: string[];
  snack: string[];
  texture: string[];
}

/* ─── Step config ─── */
const STEPS = [
  {
    index: 1 as const,
    title: "알러지가 있나요?",
    label: "알러지 유무",
    key: "allergies" as keyof Answers,
    options: ["닭고기 알러지", "유제품(우유) 알러지", "소고기 알러지", "밀(곡물) 알러지"],
    next: "다음",
  },
  {
    index: 2 as const,
    title: "어떤 건강 케어가 필요한가요?",
    label: "건강 케어",
    key: "healthCare" as keyof Answers,
    options: ["피모 관리", "관절강화", "다이어트", "치아 건강"],
    next: "다음",
  },
  {
    index: 3 as const,
    title: "선호하는 간식은 무엇인가요?",
    label: "선호하는 간식",
    key: "snack" as keyof Answers,
    options: ["건조간식", "천연 껌 / 뼈", "동결건조", "수제쿠키"],
    next: "다음",
  },
  {
    index: 4 as const,
    title: "선호하는 제형은 무엇인가요?",
    label: "선호하는 제형",
    key: "texture" as keyof Answers,
    options: ["바삭형", "가루형", "딱딱형", "소프트형"],
    next: "결과보기",
  },
] as const;

/* ─── Mock recommendation logic (replace with API later) ─── */
function mockRecommend(petInfo: PetInfo, answers: Answers): RecommendedTier {
  const specialCare = answers.healthCare.filter((h) =>
    ["관절강화", "다이어트"].includes(h)
  ).length;
  const score = answers.allergies.length + specialCare;
  if (score >= 2) return "premium";
  if (score >= 1) return "standard";
  return "basic";
}

/* ─── Sub-components ─── */
function ProgressBar({ current }: { current: number }) {
  return (
    <div className="flex gap-1.5 md:gap-2" aria-label={`${current} / 4 단계`}>
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className="h-[5px] w-[52px] rounded-full transition-colors duration-300 md:w-[60px]"
          style={{ background: n <= current ? "var(--color-accent)" : "var(--color-beige)" }}
        />
      ))}
    </div>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[52px] w-full items-center justify-center rounded-full border-2 text-[14px] font-medium transition-colors md:text-[15px]"
      style={{
        borderColor: selected ? "var(--color-accent)" : "transparent",
        background: selected ? "white" : "var(--color-surface-light)",
        color: selected ? "var(--color-accent)" : "var(--color-text)",
      }}
    >
      {label}
    </button>
  );
}

function PetAvatar({
  src,
  onButtonClick,
}: {
  src: string | null;
  onButtonClick: () => void;
}) {
  return (
    <div className="relative mx-auto mb-6 w-fit">
      <div
        className="flex h-[88px] w-[88px] items-center justify-center rounded-full overflow-hidden"
        style={{ background: "var(--color-secondary)" }}
        aria-hidden="true"
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="반려견 프로필" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[44px]">🐶</span>
        )}
      </div>
      <button
        type="button"
        aria-label="프로필 사진 변경"
        onClick={onButtonClick}
        className="absolute bottom-0 right-0 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white shadow-md"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M9.5 1.5L11.5 3.5L4.5 10.5H2.5V8.5L9.5 1.5Z" stroke="var(--color-text-on-warm)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Page ─── */
export default function ChecklistPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  }
  const [petInfo, setPetInfo] = useState<PetInfo>({
    name: "",
    age: "",
    weight: "",
    gender: null,
  });
  const [answers, setAnswers] = useState<Answers>({
    allergies: [],
    healthCare: [],
    snack: [],
    texture: [],
  });

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

  function handleStepNext() {
    if (step < 4) {
      setStep((prev) => (prev + 1) as Step);
    }
  }

  function handleBack() {
    if (step > 0) setStep((prev) => (prev - 1) as Step);
  }

  function handleSubmit() {
    const tier = mockRecommend(petInfo, answers);
    localStorage.setItem("kkosun_checklist_done", "true");
    const petName = petInfo.name.trim() || "우리 아이";
    router.push(`/recommend?tier=${tier}&petName=${encodeURIComponent(petName)}`);
  }

  const currentStepConfig = step > 0 ? STEPS[step - 1] : null;

  return (
    <div className="min-h-[calc(100vh-54px)]" style={{ background: "var(--color-secondary)" }}>
      <div className="mx-auto max-w-[900px] px-5 py-10 md:px-6 md:py-14">

        {/* Page title */}
        <div className="mb-8 text-center md:mb-10">
          <h1
            className="text-[28px] font-extrabold tracking-[-0.04em] md:text-[32px]"
            style={{ color: "var(--color-primary)" }}
          >
            체크리스트 작성
          </h1>
          <p className="mt-3 text-[13px] text-[var(--color-text-secondary)] md:text-[15px]">
            강아지의 특징과 선호하는 간식을 작성해주세요!
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white px-6 py-8 shadow-sm md:px-10 md:py-10">

          {/* ── Step 0: Pet info ── */}
          {step === 0 && (
            <div className="flex flex-col">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <PetAvatar
                src={avatarSrc}
                onButtonClick={() => fileInputRef.current?.click()}
              />

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {/* 강아지 이름 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[var(--color-text-secondary)]">강아지 이름</label>
                  <input
                    type="text"
                    placeholder="이름"
                    value={petInfo.name}
                    onChange={(e) => setPetInfo((p) => ({ ...p, name: e.target.value }))}
                    className="h-[52px] rounded-full bg-[var(--color-surface-light)] px-5 text-[14px] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none"
                  />
                </div>

                {/* 강아지 나이 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[var(--color-text-secondary)]">강아지 나이</label>
                  <input
                    type="text"
                    placeholder="나이"
                    value={petInfo.age}
                    onChange={(e) => setPetInfo((p) => ({ ...p, age: e.target.value }))}
                    className="h-[52px] rounded-full bg-[var(--color-surface-light)] px-5 text-[14px] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none"
                  />
                </div>

                {/* 몸무게 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[var(--color-text-secondary)]">몸무게</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder=""
                      value={petInfo.weight}
                      onChange={(e) => setPetInfo((p) => ({ ...p, weight: e.target.value }))}
                      className="h-[52px] w-full rounded-full bg-[var(--color-surface-light)] px-5 pr-12 text-[14px] text-[var(--color-text)] outline-none"
                    />
                    <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[13px] text-[var(--color-text-secondary)]">
                      kg
                    </span>
                  </div>
                </div>

                {/* 성별 */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[var(--color-text-secondary)]">성별</label>
                  <div className="flex h-[52px] gap-2">
                    {(["male", "female"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setPetInfo((p) => ({ ...p, gender: g }))}
                        className="flex flex-1 items-center justify-center rounded-full text-[14px] font-semibold transition-colors"
                        style={{
                          background:
                            petInfo.gender === g ? "var(--color-accent)" : "var(--color-surface-light)",
                          color: petInfo.gender === g ? "white" : "var(--color-text)",
                        }}
                      >
                        {g === "male" ? "남" : "여"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleStepNext}
                className="mt-8 flex h-[56px] w-full items-center justify-center rounded-full text-[16px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
                style={{ background: "var(--color-accent)" }}
              >
                체크리스트 작성하기
              </button>
            </div>
          )}

          {/* ── Steps 1–4 ── */}
          {step > 0 && currentStepConfig && (
            <div className="flex flex-col">
              {/* Step header */}
              <div className="mb-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-[16px] font-bold text-[var(--color-text)] md:text-[18px]"
                  aria-label="이전 단계로"
                >
                  <svg width="9" height="16" viewBox="0 0 9 16" fill="none" aria-hidden="true">
                    <path d="M8 1L1 8L8 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {currentStepConfig.title}
                </button>
                <ProgressBar current={step} />
              </div>

              {/* Options */}
              <div className="mb-8">
                <p className="mb-3 text-[12px] text-[var(--color-text-secondary)]">
                  {currentStepConfig.label}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {currentStepConfig.options.map((option) => (
                    <OptionButton
                      key={option}
                      label={option}
                      selected={answers[currentStepConfig.key].includes(option)}
                      onClick={() => toggleOption(currentStepConfig.key, option)}
                    />
                  ))}
                </div>
              </div>

              {/* Action button */}
              <button
                type="button"
                onClick={step === 4 ? handleSubmit : handleStepNext}
                className="flex h-[56px] w-full items-center justify-center rounded-full text-[16px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
                style={{ background: "var(--color-accent)" }}
              >
                {currentStepConfig.next}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
