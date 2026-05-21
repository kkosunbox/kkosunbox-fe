"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { DOG_BREED_OPTIONS, MIX_BREED_NAME, type DogBreedOption } from "@/shared/config/dogBreeds";

const MAX_VISIBLE_BREED_OPTIONS = 300;

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

function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j - 1], dp[j]);
      prev = temp;
    }
  }
  return dp[n];
}

// 오타 내성: 비슷한 길이의 품종명과 편집 거리 비교 (예: "스피치" → "스피츠")
function getFuzzyScore(query: string, target: string): number {
  if (query.length < 3) return Number.POSITIVE_INFINITY;
  const threshold = query.length <= 4 ? 1 : 2;

  if (Math.abs(target.length - query.length) <= 2) {
    const dist = editDistance(query, target);
    if (dist <= threshold) return 90 + dist * 5;
  }

  if (target.length > query.length) {
    for (let i = 0; i <= target.length - query.length; i++) {
      const dist = editDistance(query, target.substring(i, i + query.length));
      if (dist <= threshold) return 92 + i;
    }
  }

  return Number.POSITIVE_INFINITY;
}

function getBreedSearchScore(option: DogBreedOption, normalizedQuery: string): number {
  if (!normalizedQuery) return 0;

  const searchableValues = [option.name, option.englishName, ...(option.aliases ?? [])];
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

  // 위 조건에서 매칭 안 된 경우에만 퍼지 검색 적용
  if (!Number.isFinite(bestScore)) {
    for (const value of searchableValues) {
      const normalizedValue = normalizeBreedSearchText(value);
      if (!normalizedValue) continue;
      bestScore = Math.min(bestScore, getFuzzyScore(normalizedQuery, normalizedValue));
    }
  }

  return bestScore;
}

function getBreedListItems(query: string): { items: DogBreedOption[]; selectableOptions: DogBreedOption[] } {
  const normalizedQuery = normalizeBreedSearchText(query);
  const mixOption = DOG_BREED_OPTIONS.find((option) => option.name === MIX_BREED_NAME);
  const baseOptions = DOG_BREED_OPTIONS.filter((option) => option.name !== MIX_BREED_NAME);

  let visible: DogBreedOption[];

  if (!normalizedQuery) {
    visible = baseOptions.slice(0, MAX_VISIBLE_BREED_OPTIONS);
  } else {
    visible = baseOptions
      .map((option) => ({ option, score: getBreedSearchScore(option, normalizedQuery) }))
      .filter(({ score }) => Number.isFinite(score))
      .sort((a, b) => a.score - b.score || a.option.name.localeCompare(b.option.name, "ko"))
      .slice(0, MAX_VISIBLE_BREED_OPTIONS)
      .map(({ option }) => option);
  }

  const selectableOptions = mixOption ? [...visible, mixOption] : visible;
  return { items: selectableOptions, selectableOptions };
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

  const { items, selectableOptions } = useMemo(() => getBreedListItems(query), [query]);
  const listboxId = `${id}-listbox`;

  useEffect(() => {
    const mix = isMixBreedValue(value);
    setQuery(mix ? getMixCustomPart(value) : value);
  }, [value]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(selectableOptions.length - 1, 0)));
  }, [selectableOptions.length]);

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
      setActiveIndex((current) => Math.min(current + 1, selectableOptions.length - 1));
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
      const option = selectableOptions[activeIndex];
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
          aria-activedescendant={
            isOpen && selectableOptions[activeIndex]
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
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
          {items.map((option, selectableIndex) => {
            const isSelected = option.name === value || (option.name === MIX_BREED_NAME && isMixBreedValue(value));
            const isActive = selectableIndex === activeIndex;

            return (
              <div
                id={`${listboxId}-option-${selectableIndex}`}
                key={option.name}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(selectableIndex)}
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
