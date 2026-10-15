"use client";

import { useRef, useState } from "react";
import { ChevronIcon } from "@/shared/ui";

export const DELIVERY_MEMO_MAX_LENGTH = 40;
const MEMO_OPTIONS = [
  "문 앞에 놓아주세요",
  "부재 시 연락주세요",
  "배송 전 미리 연락주세요",
] as const;
const PLACEHOLDER = "배송 시 요청사항을 입력해주세요";

function isPresetMemo(memo: string) {
  return MEMO_OPTIONS.includes(memo as (typeof MEMO_OPTIONS)[number]);
}

interface Props {
  id?: string;
  value: string;
  onChange: (memo: string) => void;
  /** 입력창/드롭다운 트리거 공통 스타일 (높이 40px 기준) */
  inputClassName: string;
}

/** 배송메모 — 프리셋 드롭다운 + "직접 입력하기" */
export function DeliveryMemoField({ id, value, onChange, inputClassName }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(Boolean(value) && !isPresetMemo(value));
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="relative min-w-0 flex-1"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsMenuOpen(false);
        }
      }}
    >
      {isCustom ? (
        <div className="relative pb-5">
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onClick={() => setIsMenuOpen(true)}
            placeholder={PLACEHOLDER}
            maxLength={DELIVERY_MEMO_MAX_LENGTH}
            aria-label="배송메모"
            className={`${inputClassName} w-full pr-10`}
          />
          <span className="pointer-events-none absolute bottom-0 right-0 text-body-13-r text-[var(--color-text-secondary)]">
            {value.length}/{DELIVERY_MEMO_MAX_LENGTH}자
          </span>
        </div>
      ) : (
        <button
          id={id}
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-haspopup="listbox"
          aria-expanded={isMenuOpen}
          aria-label="배송메모"
          className={`${inputClassName} flex w-full items-center pr-10 text-left`}
        >
          <span className={`truncate ${value ? "" : "text-[var(--color-text-secondary)]"}`}>
            {value || PLACEHOLDER}
          </span>
        </button>
      )}

      <span className="pointer-events-none absolute right-3 top-0 flex h-10 items-center" aria-hidden="true">
        <ChevronIcon open={isMenuOpen} size={20} />
      </span>

      {isMenuOpen && (
        <div
          role="listbox"
          aria-label="배송메모 선택"
          className="absolute left-0 right-0 top-10 z-20 mt-1 overflow-hidden rounded-[8px] bg-white py-1 shadow-[0_13px_61px_rgba(169,169,169,0.36)]"
        >
          <button
            type="button"
            role="option"
            aria-selected={isCustom}
            onClick={() => {
              if (!isCustom) onChange("");
              setIsCustom(true);
              setIsMenuOpen(false);
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            className="flex h-10 w-full items-center px-5 text-left text-body-14-m text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-light)]"
          >
            직접 입력하기
            <span className="ml-1 text-[var(--color-text-secondary)]">
              ({value.length}/{DELIVERY_MEMO_MAX_LENGTH}자)
            </span>
          </button>
          {MEMO_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={!isCustom && value === option}
              onClick={() => {
                onChange(option);
                setIsCustom(false);
                setIsMenuOpen(false);
              }}
              className="flex h-10 w-full items-center px-5 text-left text-body-14-m text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-light)]"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
