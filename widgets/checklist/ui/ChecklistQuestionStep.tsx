"use client";

import { Text } from "@/shared/ui";
import type { ChecklistOption, ChecklistQuestion } from "@/features/profile/api/types";

function optionLabel(o: ChecklistOption): string {
  return o.text || `선택지 ${o.id}`;
}

function ProgressBar({
  current,
  total,
  maxVisited,
  onStepClick,
}: {
  current: number;
  total: number;
  maxVisited: number;
  onStepClick?: (step: number) => void;
}) {
  // 질문이 5개 이상이면 진행 바 영역을 256px로 제한하고 간격을 3px로 좁혀
  // 막대가 영역에 맞게 줄어들도록 한다. 4개 이하면 기존 고정 너비/간격을 유지한다.
  const isMany = total > 4;
  const containerClassName = [
    "flex max-md:min-w-0 max-md:flex-1",
    isMany
      ? "gap-[3px] md:max-w-[256px] lg:max-w-[256px] md:flex-1 lg:flex-1"
      : "gap-1 md:gap-2 lg:gap-2 md:flex-none lg:flex-none",
  ].join(" ");
  const barClassName = [
    "h-[5px] rounded-full transition-colors duration-300 max-md:min-w-0 max-md:flex-1",
    isMany
      ? "md:flex-1 lg:flex-1 md:min-w-0 lg:min-w-0"
      : "md:w-[60px] lg:w-[60px] md:flex-none lg:flex-none",
  ].join(" ");

  return (
    <div className={containerClassName} aria-label={`${current} / ${total} 단계`}>
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
        const visited = n <= maxVisited;
        const clickable = visited && n !== current && onStepClick != null;
        return clickable ? (
          <button
            key={n}
            type="button"
            onClick={() => onStepClick(n)}
            className={`${barClassName} hover:opacity-70`}
            style={{
              background: n <= current ? "var(--color-primary)" : "var(--color-text-muted)",
              cursor: "pointer",
            }}
            aria-label={`${n}단계로 이동`}
          />
        ) : (
          <div
            key={n}
            className={barClassName}
            style={{ background: n <= current ? "var(--color-primary)" : "var(--color-text-muted)" }}
          />
        );
      })}
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
        "flex w-full items-center rounded-[8px] border transition-colors",
        "max-md:min-h-[52px] max-md:px-5 max-md:py-3.5 max-md:justify-start max-md:text-body-14-m",
        "md:h-[40px] md:justify-center md:text-body-15-m lg:h-[40px] lg:justify-center lg:text-body-15-m",
        selected
          ? "border-[var(--color-primary)] bg-[var(--color-secondary)] text-[var(--color-text)]"
          : "border-transparent bg-[var(--color-surface-light)] text-[var(--color-text)]",
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
  maxVisitedStep: number;
  onStepClick?: (step: number) => void;
}

export default function ChecklistQuestionStep({
  question,
  stepIndex,
  totalSteps,
  selectedOptionIds,
  onToggleOption,
  onBack,
  maxVisitedStep,
  onStepClick,
}: Props) {

  return (
    <div className="flex flex-col">
      <div className="mb-4 flex items-center md:hidden lg:hidden -ml-2">
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
        <ProgressBar current={stepIndex} total={totalSteps} maxVisited={maxVisitedStep} onStepClick={onStepClick} />
      </div>

      <Text as="h2" variant="subtitle-18-b" className="mb-2 text-[var(--color-text)] md:hidden lg:hidden">
        {question.text}
      </Text>

      <div className="mb-14 max-md:hidden md:flex lg:flex md:items-center lg:items-center md:justify-between lg:justify-between md:gap-4 lg:gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 md:gap-3 lg:gap-3 max-md:text-subtitle-16-b md:text-subtitle-18-b lg:text-subtitle-18-b text-[var(--color-text)]"
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
        <ProgressBar current={stepIndex} total={totalSteps} maxVisited={maxVisitedStep} onStepClick={onStepClick} />
      </div>

      <div>
        {question.description ? (
          <p className="mb-3 text-caption-12-r text-[var(--color-text-secondary)]">{question.description}</p>
        ) : null}
        <p className="mb-3 text-caption-12-r text-[var(--color-text-secondary)]">
          {question.isMultiSelect ? "복수 선택 가능" : "한 가지를 선택해 주세요"}
        </p>
        <div className="max-md:flex max-md:flex-col max-md:gap-3 md:grid lg:grid md:grid-cols-2 lg:grid-cols-2 md:gap-x-[26px] md:gap-y-5 lg:gap-x-[26px] lg:gap-y-5">
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

    </div>
  );
}
