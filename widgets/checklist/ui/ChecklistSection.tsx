"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/shared/ui";
import checklistHeroPcPattern from "../assets/checklist-hero-pc-pattern.png";
import checklistHeroTitle from "../assets/checklist-hero-title.png";

/* ─── Types ─── */
type Step = 0 | 1 | 2 | 3 | 4;
type Gender = "male" | "female" | null;
type RecommendedTier = "basic" | "standard" | "premium";

interface PetInfo {
  name: string;
  birthDate: Date | null;
  weight: string;
  gender: Gender;
}

function formatBirthDateDisplay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
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

/* ─── Widget ─── */
export default function ChecklistSection() {
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
    birthDate: null,
    weight: "",
    gender: null,
  });

  const birthMaxDate = new Date();
  const birthMinDate = new Date(birthMaxDate.getFullYear() - 40, 0, 1);
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
    <div className="min-h-[calc(100vh-54px)] bg-white pb-12 md:pb-16">
      <section
        className="relative flex h-[210px] shrink-0 flex-col items-center justify-center overflow-hidden px-4"
        style={{ background: "var(--gradient-checklist-hero)" }}
        aria-label="체크리스트 페이지 소개"
      >
        {/* 중간층: 그라데이션 위 · 텍스트 아래 — max 940px, 히어로 내 가로·세로 중앙 */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center px-4"
          aria-hidden
        >
          <Image
            src={checklistHeroPcPattern}
            alt=""
            width={checklistHeroPcPattern.width}
            height={checklistHeroPcPattern.height}
            className="h-auto w-full max-w-[940px] object-contain"
            sizes="(max-width: 940px) 100vw, 940px"
            priority
          />
        </div>
        {/* 최상층: 가운데 정렬 타이포 */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className="m-0 flex w-full max-w-[940px] justify-center px-1">
            <Image
              src={checklistHeroTitle}
              alt="체크리스트를 작성해주세요!"
              width={checklistHeroTitle.width}
              height={checklistHeroTitle.height}
              className="h-auto w-full max-w-full object-contain"
              sizes="(max-width: 940px) 100vw, 940px"
              priority
            />
          </h1>
          <p
            className="mt-3 max-w-[345px] px-2 text-[16px] font-normal leading-5 tracking-[-0.02em] text-[var(--color-text)]"
            style={{
              fontFamily: '"Griun PolFairness", "Pretendard", "Apple SD Gothic Neo", sans-serif',
            }}
          >
            강아지의 특징과 선호하는 간식을 작성해주세요!
          </p>
        </div>
      </section>

      <div className="relative z-10 mx-auto w-full max-w-[1013px] px-4 max-md:px-4 md:px-8">
        <div className="max-md:-mt-12 rounded-[20px] bg-white px-5 py-10 shadow-[0px_4px_24px_rgba(0,0,0,0.08)] max-md:py-8 md:-mt-[50px] md:px-8 md:py-12">
          <div className="mx-auto w-full max-w-[900px]">
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

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="checklist-pet-birth" className="text-[12px] text-[var(--color-text-secondary)]">
                      생년월일
                    </label>
                    <DatePicker
                      id="checklist-pet-birth"
                      value={petInfo.birthDate}
                      onChange={(date) => setPetInfo((p) => ({ ...p, birthDate: date }))}
                      placeholder="생년월일 선택"
                      formatDisplay={formatBirthDateDisplay}
                      minDate={birthMinDate}
                      maxDate={birthMaxDate}
                      triggerClassName="!h-[52px] !rounded-full !border-0 !bg-[var(--color-surface-light)] !px-5 hover:!border-0"
                    />
                  </div>

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

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-[var(--color-text-secondary)]">성별</label>
                    <div className="flex gap-2.5">
                      {(["male", "female"] as const).map((g) => {
                        const selected = petInfo.gender === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setPetInfo((p) => ({ ...p, gender: g }))}
                            className={[
                              "flex h-10 min-w-0 flex-1 items-center justify-center rounded-[10px] px-2.5 text-[14px] font-semibold leading-[17px] transition-colors",
                              selected
                                ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                                : "bg-[var(--color-surface-light)] text-[var(--color-text)]",
                            ].join(" ")}
                          >
                            {g === "male" ? "남" : "여"}
                          </button>
                        );
                      })}
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

            {step > 0 && currentStepConfig && (
              <div className="flex flex-col">
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
    </div>
  );
}
