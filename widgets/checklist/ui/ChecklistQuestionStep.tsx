"use client";

import { Button, Text } from "@/shared/ui";
import type { Answers } from "./types";

/* ─── Step config ─── */
export const STEPS = [
  {
    index: 1 as const,
    title: "알러지가 있나요?",
    label: "알러지 유무",
    key: "allergies" as keyof Answers,
    options: ["닭고기 알러지", "소고기 알러지", "유제품(우유) 알러지", "밀(곡물) 알러지"],
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

const CTA_CLASS =
  "!h-[56px] !w-full !bg-[var(--color-accent)] !text-subtitle-16-sb transition-opacity hover:opacity-90 active:opacity-80";

function ProgressBar({ current }: { current: number }) {
  return (
    <div
      className="flex gap-1 max-md:min-w-0 max-md:flex-1 md:flex-none md:gap-2"
      aria-label={`${current} / 4 단계`}
    >
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className="h-[5px] rounded-full transition-colors duration-300 max-md:min-w-0 max-md:flex-1 md:w-[60px] md:flex-none"
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
      className={[
        "flex w-full items-center justify-center border-2 max-md:text-body-14-m md:text-body-15-m transition-colors md:h-[52px] md:rounded-full",
        "max-md:min-h-[52px] max-md:rounded-[14px] max-md:px-4 max-md:py-3.5",
        selected
          ? "max-md:border-[var(--color-accent)] max-md:bg-[var(--color-accent-soft)] max-md:text-[var(--color-text)] md:border-[var(--color-accent)] md:bg-white md:text-[var(--color-accent)]"
          : "max-md:border-transparent max-md:bg-[var(--color-surface-light)] max-md:text-[var(--color-text)] md:border-transparent md:bg-[var(--color-surface-light)] md:text-[var(--color-text)]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

interface Props {
  step: 1 | 2 | 3 | 4;
  answers: Answers;
  onToggle: (key: keyof Answers, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function ChecklistQuestionStep({
  step,
  answers,
  onToggle,
  onBack,
  onNext,
}: Props) {
  const config = STEPS[step - 1];

  return (
    <div className="flex flex-col">
      {/* 모바일 헤더: 뒤로가기 + 진행 바 */}
      <div className="mb-4 flex items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center text-[var(--color-text)]"
          aria-label="이전 단계로"
        >
          <svg width="9" height="16" viewBox="0 0 9 16" fill="none" aria-hidden="true">
            <path
              d="M8 1L1 8L8 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <ProgressBar current={step} />
      </div>

      <Text as="h2" variant="subtitle-18-b" className="mb-2 text-[var(--color-text)] md:hidden">
        {config.title}
      </Text>

      {/* PC 헤더: 뒤로가기 + 타이틀 + 진행 바 */}
      <div className="mb-8 max-md:hidden md:flex md:items-center md:justify-between md:gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 max-md:text-subtitle-16-b md:text-subtitle-18-b text-[var(--color-text)]"
          aria-label="이전 단계로"
        >
          <svg width="9" height="16" viewBox="0 0 9 16" fill="none" aria-hidden="true">
            <path
              d="M8 1L1 8L8 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {config.title}
        </button>
        <ProgressBar current={step} />
      </div>

      {/* 옵션 목록 */}
      <div className="mb-8 max-md:mt-0">
        <p className="mb-3 text-caption-12-r text-[var(--color-text-secondary)]">{config.label}</p>
        <div className="max-md:flex max-md:flex-col max-md:gap-3 md:grid md:grid-cols-2 md:gap-3">
          {config.options.map((option) => (
            <OptionButton
              key={option}
              label={option}
              selected={answers[config.key].includes(option)}
              onClick={() => onToggle(config.key, option)}
            />
          ))}
        </div>
      </div>

      {/* PC CTA (모바일은 카드 바깥에서 렌더) */}
      <div className="w-full max-md:hidden md:mx-auto md:max-w-[380px]">
        <Button
          type="button"
          onClick={onNext}
          variant="primary"
          size="lg"
          className={CTA_CLASS}
        >
          {config.next}
        </Button>
      </div>
    </div>
  );
}
