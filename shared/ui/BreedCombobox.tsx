"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { DOG_BREED_OPTIONS, MIX_BREED_NAME, type DogBreedOption } from "@/shared/config/dogBreeds";

const MAX_VISIBLE_BREED_OPTIONS = 80;

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
}

export default function BreedCombobox({
  id,
  value,
  onChange,
  placeholder = "품종 선택",
  className = "",
  inputClassName = "",
}: BreedComboboxProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const options = useMemo(() => getBreedOptions(query), [query]);
  const listboxId = `${id}-listbox`;

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(options.length - 1, 0)));
  }, [options.length]);

  function selectOption(option: DogBreedOption) {
    onChange(option.name);
    setQuery(option.name);
    setIsOpen(false);
    setActiveIndex(0);
  }

  function resetQueryToSelectedValue() {
    setQuery(value);
    setIsOpen(false);
    setActiveIndex(0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
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

  return (
    <div className={["relative", className].join(" ")}>
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
          setQuery(event.target.value);
          setIsOpen(true);
          setActiveIndex(0);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          window.setTimeout(resetQueryToSelectedValue, 100);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={[
          "h-9 w-full min-w-0 truncate rounded-[4px] border border-[var(--color-divider-warm)] bg-white px-3 text-body-13-m text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-accent)]",
          inputClassName,
        ].join(" ")}
      />

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 top-[calc(100%+4px)] z-30 max-h-[240px] w-max min-w-[max(100%,21rem)] max-w-[min(40rem,calc(100vw-1.5rem))] overflow-y-auto overflow-x-auto rounded-[8px] border border-[var(--color-divider-warm)] bg-white p-1 shadow-[0_8px_24px_rgba(78,78,78,0.14)]"
        >
          {options.map((option, index) => {
            const isSelected = option.name === value;
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
