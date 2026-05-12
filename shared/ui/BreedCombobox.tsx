"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { DOG_BREED_OPTIONS, MIX_BREED_NAME, type DogBreedOption } from "@/shared/config/dogBreeds";

const MAX_VISIBLE_BREED_OPTIONS = 80;

function isMixBreedValue(v: string): boolean {
  return v === MIX_BREED_NAME || /^믹스견\(.+\)$/.test(v);
}

function getMixCustomPart(v: string): string {
  if (v === MIX_BREED_NAME) return "";
  const m = v.match(/^믹스견\((.+)\)$/);
  return m ? m[1] : "";
}

function normalizeBreedSearchText(value: string): string {
  return value.toLowerCase().replace(/[\s()[\],./·ㆍ-]/g, "");
}

function isSubsequence(query: string, target: string): boolean {
  let queryIndex = 0;
  for (const char of target) {
    if (char === query[queryIndex]) queryIndex += 1;
    if (queryIndex === query.length) return true;
  }
  return query.length === 0;
}

function getBreedSearchScore(option: DogBreedOption, normalizedQuery: string): number {
  if (!normalizedQuery) return 0;

  const searchableValues = [option.name, option.englishName, option.groupName, ...(option.aliases ?? [])];
  let bestScore = Number.POSITIVE_INFINITY;

  for (const value of searchableValues) {
    const normalizedValue = normalizeBreedSearchText(value);
    if (!normalizedValue) continue;
    if (normalizedValue === normalizedQuery) bestScore = Math.min(bestScore, 0);
    if (normalizedValue.startsWith(normalizedQuery)) bestScore = Math.min(bestScore, 10 + normalizedValue.length - normalizedQuery.length);

    const includesIndex = normalizedValue.indexOf(normalizedQuery);
    if (includesIndex >= 0) bestScore = Math.min(bestScore, 30 + includesIndex + normalizedValue.length - normalizedQuery.length);
    if (isSubsequence(normalizedQuery, normalizedValue)) bestScore = Math.min(bestScore, 70 + normalizedValue.length - normalizedQuery.length);
  }

  return bestScore;
}

function getBreedOptions(query: string): DogBreedOption[] {
  const normalizedQuery = normalizeBreedSearchText(query);
  const mixOption = DOG_BREED_OPTIONS.find((option) => option.name === MIX_BREED_NAME);
  const baseOptions = DOG_BREED_OPTIONS.filter((option) => option.name !== MIX_BREED_NAME);

  if (!normalizedQuery) {
    return [...baseOptions.slice(0, MAX_VISIBLE_BREED_OPTIONS), ...(mixOption ? [mixOption] : [])];
  }

  const filteredOptions = baseOptions
    .map((option) => ({ option, score: getBreedSearchScore(option, normalizedQuery) }))
    .filter(({ score }) => Number.isFinite(score))
    .sort((a, b) => a.score - b.score || a.option.name.localeCompare(b.option.name, "ko"))
    .slice(0, MAX_VISIBLE_BREED_OPTIONS)
    .map(({ option }) => option);

  return [...filteredOptions, ...(mixOption ? [mixOption] : [])];
}

export interface BreedComboboxProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  clearButtonRight?: string;
}

export default function BreedCombobox({
  id,
  value,
  onChange,
  placeholder = "품종 선택",
  className = "",
  inputClassName = "",
  clearButtonRight = "right-2",
}: BreedComboboxProps) {
  const isMix = isMixBreedValue(value);
  const [query, setQuery] = useState(isMix ? getMixCustomPart(value) : value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  // 스테일 클로저 방지용 refs
  const valueRef = useRef(value);
  const queryRef = useRef(query);
  valueRef.current = value;
  queryRef.current = query;

  const options = useMemo(() => getBreedOptions(query), [query]);
  const listboxId = `${id}-listbox`;

  useEffect(() => {
    const mix = isMixBreedValue(value);
    setQuery(mix ? getMixCustomPart(value) : value);
  }, [value]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(options.length - 1, 0)));
  }, [options.length]);

  function selectOption(option: DogBreedOption) {
    onChange(option.name);
    // mix 선택 시 input은 비우고 placeholder "기타"만 표시
    setQuery(option.name === MIX_BREED_NAME ? "" : option.name);
    setIsOpen(false);
    setActiveIndex(0);
  }

  function resetQueryToSelectedValue() {
    const v = valueRef.current;
    setQuery(isMixBreedValue(v) ? getMixCustomPart(v) : v);
    setIsOpen(false);
    setActiveIndex(0);
  }

  function handleClear() {
    onChange("");
    setQuery("");
    setIsOpen(false);
    setActiveIndex(0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // mix 모드에서는 텍스트 입력 그대로, Escape만 처리
    if (isMixBreedValue(valueRef.current)) {
      if (event.key === "Escape") {
        event.preventDefault();
        resetQueryToSelectedValue();
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => Math.min(current + 1, options.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === "Enter" && isOpen) {
      event.preventDefault();
      const option = options[activeIndex];
      if (option) selectOption(option);
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      resetQueryToSelectedValue();
    }
  }

  const isMixMode = isMixBreedValue(value);

  return (
    <div className={["relative", className].join(" ")}>
      <div className="relative">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={isOpen}
          aria-activedescendant={isOpen && options[activeIndex] ? `${listboxId}-option-${activeIndex}` : undefined}
          autoComplete="off"
          value={query}
          onChange={(event) => {
            const text = event.target.value;
            setQuery(text);
            if (isMixBreedValue(valueRef.current)) {
              // mix 모드: 드롭다운 없이 커스텀 텍스트 입력
              onChange(text ? `믹스견(${text})` : MIX_BREED_NAME);
            } else {
              setIsOpen(true);
              setActiveIndex(0);
            }
          }}
          onFocus={() => {
            if (!isMixBreedValue(valueRef.current)) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            window.setTimeout(() => {
              if (isMixBreedValue(valueRef.current)) {
                // blur 시 트리밍 후 최종 커밋
                const trimmed = queryRef.current.trim();
                const committed = trimmed ? `믹스견(${trimmed})` : MIX_BREED_NAME;
                onChange(committed);
                setQuery(trimmed);
              } else {
                resetQueryToSelectedValue();
              }
            }, 100);
          }}
          onKeyDown={handleKeyDown}
          placeholder={isMixMode ? "기타" : placeholder}
          className={[
            "h-9 w-full min-w-0 truncate rounded-[4px] border border-[var(--color-divider-warm)] bg-white px-3 text-body-13-m text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-accent)]",
            query ? "pr-8" : "",
            inputClassName,
          ].join(" ")}
        />
        {(query || isMixMode) && (
          <button
            type="button"
            aria-label="품종 초기화"
            onMouseDown={(event) => {
              event.preventDefault();
              handleClear();
            }}
            className={`absolute ${clearButtonRight} top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-text-muted)] text-white transition-opacity hover:opacity-80`}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
              <path d="M1 1l6 6M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 top-[calc(100%+4px)] z-30 max-h-[240px] w-max min-w-[max(100%,21rem)] max-w-[min(40rem,calc(100vw-1.5rem))] overflow-y-auto overflow-x-auto rounded-[8px] border border-[var(--color-divider-warm)] bg-white p-1 shadow-[0_8px_24px_rgba(78,78,78,0.14)]"
        >
          {options.map((option, index) => {
            const isSelected = option.name === value || (option.name === MIX_BREED_NAME && isMixBreedValue(value));
            const isActive = index === activeIndex;
            return (
              <div
                id={`${listboxId}-option-${index}`}
                key={`${option.groupId}-${option.name}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectOption(option);
                }}
                className={[
                  "cursor-pointer whitespace-nowrap rounded-[6px] px-3 py-2 text-left text-body-13-sb text-[var(--color-text)] transition-colors",
                  isActive || isSelected ? "bg-[var(--color-accent-soft)]" : "hover:bg-[var(--color-background)]",
                ].join(" ")}
              >
                {option.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
