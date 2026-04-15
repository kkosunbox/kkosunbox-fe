"use client";

import { Button, Text } from "@/shared/ui";
import type { ChecklistOption, ChecklistQuestion } from "@/features/profile/api/types";

function optionLabel(o: ChecklistOption): string {
  return o.text || `선택지 ${o.id}`;
}

const CTA_CLASS =
  "!h-[56px] !w-full !bg-[var(--color-accent)] !text-subtitle-16-sb transition-opacity hover:opacity-90 active:opacity-80";

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div
      className="flex gap-1 max-md:min-w-0 max-md:flex-1 md:flex-none md:gap-2"
      aria-label={`${current} / ${total} 단계`}
    >
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <div
          key={n}
          className="h-[5px] rounded-full transition-colors duration-300 max-md:min-w-0 max-md:flex-1 md:w-[60px] md:flex-none"
          style={{ background: n <= current ? "var(--color-accent)" : "var(--color-text-muted)" }}
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
  question: ChecklistQuestion;
  /** 1-based 질문 순번 (진행 바) */
  stepIndex: number;
  totalSteps: number;
  selectedOptionIds: number[];
  onToggleOption: (optionId: number) => void;
  onBack: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

export default function ChecklistQuestionStep({
  question,
  stepIndex,
  totalSteps,
  selectedOptionIds,
  onToggleOption,
  onBack,
  onNext,
  isLastQuestion,
}: Props) {
  const nextLabel = isLastQuestion ? "결과보기" : "다음";

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center md:hidden -ml-2">
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
        <ProgressBar current={stepIndex} total={totalSteps} />
      </div>

      <Text as="h2" variant="subtitle-18-b" className="mb-2 text-[var(--color-text)] md:hidden">
        {question.text}
      </Text>

      <div className="mb-8 max-md:hidden md:flex md:items-center md:justify-between md:gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 md:gap-3 max-md:text-subtitle-16-b md:text-subtitle-18-b text-[var(--color-text)]"
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
          {question.text}
        </button>
        <ProgressBar current={stepIndex} total={totalSteps} />
      </div>

      <div className="mb-8 max-md:mt-0">
        {question.description ? (
          <p className="mb-3 text-caption-12-r text-[var(--color-text-secondary)]">{question.description}</p>
        ) : null}
        <p className="mb-3 text-caption-12-r text-[var(--color-text-secondary)]">
          {question.isMultiSelect ? "복수 선택 가능" : "한 가지를 선택해 주세요"}
        </p>
        <div className="max-md:flex max-md:flex-col max-md:gap-3 md:grid md:grid-cols-2 md:gap-3">
          {question.options.map((option) => (
            <OptionButton
              key={option.id}
              label={optionLabel(option)}
              selected={selectedOptionIds.includes(option.id)}
              onClick={() => onToggleOption(option.id)}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-md:hidden md:mx-auto md:max-w-[380px]">
        <Button type="button" onClick={onNext} variant="primary" size="lg" className={CTA_CLASS}>
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}
