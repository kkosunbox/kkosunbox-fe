"use client";

import { useMemo, useState } from "react";
import { DOG_BREED_GROUPS, DOG_BREEDS } from "@/shared/config/dogBreeds";

interface DogBreedSearchModalProps {
  selectedBreed: string;
  onSelect: (breed: string) => void;
  onClose: () => void;
}

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/[\s()-]/g, "");
}

export default function DogBreedSearchModal({
  selectedBreed,
  onSelect,
  onClose,
}: DogBreedSearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(DOG_BREED_GROUPS[0]?.id ?? 1);
  const normalizedQuery = normalizeSearchText(query);

  const filteredBreeds = useMemo(() => {
    if (!normalizedQuery) return [];

    return DOG_BREEDS.filter((breed) => {
      const searchable = [breed.name, breed.englishName, breed.groupName, ...(breed.aliases ?? [])]
        .map(normalizeSearchText)
        .join(" ");
      return searchable.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  const selectedGroup = DOG_BREED_GROUPS.find((group) => group.id === selectedGroupId) ?? DOG_BREED_GROUPS[0];
  const visibleBreeds = normalizedQuery ? filteredBreeds : selectedGroup?.breeds ?? [];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-5"
      role="dialog"
      aria-modal="true"
      aria-label="강아지 품종 검색"
    >
      <div className="w-full max-w-[720px] rounded-[24px] bg-white p-6 shadow-[0_8px_30px_rgba(78,78,78,0.18)] max-md:max-h-[88vh] max-md:overflow-y-auto md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-subtitle-18-b tracking-tightest text-[var(--color-text)]">강아지 품종 검색</h2>
            <p className="mt-2 text-body-13-m text-[var(--color-text-secondary)]">
              품종명으로 검색하거나 그룹에서 세부 품종을 선택해 주세요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="품종 검색 닫기"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-opacity hover:opacity-70"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-6 flex gap-2">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="예) 포메라니안, Pomeranian"
            className="h-10 min-w-0 flex-1 rounded-[8px] border border-[var(--color-divider-warm)] bg-white px-4 text-body-14-m text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-accent)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="h-10 rounded-[8px] bg-[var(--color-ui-inactive-bg)] px-4 text-body-13-m text-[var(--color-text-secondary)] transition-opacity hover:opacity-80"
            >
              초기화
            </button>
          )}
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
          <div className={normalizedQuery ? "hidden md:block" : ""}>
            <p className="mb-3 text-body-13-sb text-[var(--color-text)]">전체 그룹</p>
            <div className="flex gap-2 overflow-x-auto pb-1 md:max-h-[360px] md:flex-col md:overflow-y-auto md:overflow-x-hidden md:pr-1">
              {DOG_BREED_GROUPS.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setSelectedGroupId(group.id)}
                  className={[
                    "shrink-0 rounded-[10px] px-3 py-2 text-left text-body-13-m transition-colors md:w-full",
                    selectedGroupId === group.id
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-background)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]",
                  ].join(" ")}
                >
                  <span className="block font-semibold">{group.id}그룹</span>
                  <span className="block truncate">{group.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-body-13-sb text-[var(--color-text)]">
                {normalizedQuery ? "검색 결과" : `${selectedGroup?.id ?? ""}그룹 세부 품종`}
              </p>
              <span className="text-body-12-m text-[var(--color-text-secondary)]">{visibleBreeds.length}개</span>
            </div>

            {visibleBreeds.length > 0 ? (
              <div className="grid max-h-[360px] gap-2 overflow-y-auto pr-1 md:grid-cols-2">
                {visibleBreeds.map((breed) => {
                  const isSelected = breed.name === selectedBreed;
                  return (
                    <button
                      key={`${breed.englishName}-${breed.name}`}
                      type="button"
                      onClick={() => onSelect(breed.name)}
                      className={[
                        "rounded-[10px] border px-4 py-3 text-left transition-colors",
                        isSelected
                          ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                          : "border-[var(--color-divider-warm)] bg-white hover:border-[var(--color-accent)]",
                      ].join(" ")}
                    >
                      <span className="block text-body-14-sb text-[var(--color-text)]">{breed.name}</span>
                      <span className="mt-1 block text-body-12-m text-[var(--color-text-secondary)]">
                        {breed.englishName}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-[180px] items-center justify-center rounded-[12px] bg-[var(--color-background)] text-center text-body-14-m text-[var(--color-text-secondary)]">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-[120px] items-center justify-center rounded-full bg-[var(--color-text-muted)] text-body-14-sb text-white transition-opacity hover:opacity-80"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
