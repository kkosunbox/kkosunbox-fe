"use client";

import { useRef } from "react";
import { BreedCombobox, Button, DatePicker } from "@/shared/ui";
import type { PetInfo } from "./types";

const SPECIAL_NOTES_PLACEHOLDER = "예) 푸드퍼즐 간식을 좋아해요.";
const SPECIAL_NOTES_MAX_LENGTH = 200;

function formatBirthDateDisplay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

const CTA_CLASS =
  "!h-12 !w-full !bg-[var(--color-accent)] !text-subtitle-16-sb transition-opacity hover:opacity-90 active:opacity-80 disabled:!cursor-not-allowed disabled:!opacity-50 disabled:hover:!opacity-50";

function BreedSearchGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="var(--color-text-secondary)" strokeWidth="2" />
      <path d="m20 20-3.65-3.65" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
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
        role="button"
        tabIndex={0}
        aria-label="프로필 사진 변경"
        onClick={onButtonClick}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onButtonClick(); } }}
        className="flex h-[88px] w-[88px] cursor-pointer items-center justify-center overflow-hidden rounded-full"
        style={{ background: "var(--color-secondary)" }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="반려견 프로필" className="h-full w-full object-cover" />
        ) : (
          <span className="text-emoji-44">🐶</span>
        )}
      </div>
      <button
        type="button"
        aria-label="프로필 사진 변경"
        onClick={onButtonClick}
        className="absolute bottom-0 right-0 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white shadow-md"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path
            d="M9.5 1.5L11.5 3.5L4.5 10.5H2.5V8.5L9.5 1.5Z"
            stroke="var(--color-text-on-warm)"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

interface Props {
  petInfo: PetInfo;
  setPetInfo: React.Dispatch<React.SetStateAction<PetInfo>>;
  avatarSrc: string | null;
  onAvatarChange: (src: string | null) => void;
  onNext: () => void;
}

export default function ChecklistPetForm({
  petInfo,
  setPetInfo,
  avatarSrc,
  onAvatarChange,
  onNext,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const birthMaxDate = new Date();
  const birthMinDate = new Date(birthMaxDate.getFullYear() - 40, 0, 1);
  const isNameValid = petInfo.name.trim().length > 0;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onAvatarChange(url);
  }

  return (
    <div className="flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <PetAvatar
        src={avatarSrc}
        onButtonClick={() => fileInputRef.current?.click()}
      />

      <div className="mx-auto w-full max-w-[720px]">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-caption-12-r text-[var(--color-text-secondary)]">
              강아지 이름 <span className="text-[var(--color-accent)]">*</span>
            </label>
            <input
              type="text"
              placeholder="이름"
              value={petInfo.name}
              onChange={(e) => setPetInfo((p) => ({ ...p, name: e.target.value }))}
              className="h-10 rounded-full bg-[var(--color-surface-light)] px-5 text-body-14-r text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="checklist-pet-breed" className="text-caption-12-r text-[var(--color-text-secondary)]">
              강아지 품종
            </label>
            <div className="relative w-full">
              <BreedCombobox
                id="checklist-pet-breed"
                value={petInfo.breed}
                onChange={(breed) => setPetInfo((p) => ({ ...p, breed }))}
                placeholder="ex) 웰시코기"
                className="w-full"
                inputClassName="!h-10 !rounded-full !border-0 !bg-[var(--color-surface-light)] !px-5 !pr-[56px] !text-body-14-r !font-normal !tracking-normal placeholder:text-[var(--color-text-secondary)] focus:!border-0 focus:!ring-0"
                clearButtonRight="right-[38px]"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <BreedSearchGlyph />
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="checklist-pet-birth"
              className="text-caption-12-r text-[var(--color-text-secondary)]"
            >
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
              triggerClassName="!h-10 !rounded-full !border-0 !bg-[var(--color-surface-light)] !px-5 hover:!border-0 [&_span]:!text-body-14-r [&_span]:!font-normal [&_span]:!tracking-normal"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-caption-12-r text-[var(--color-text-secondary)]">몸무게</label>
            <div className="relative">
              <input
                type="number"
                value={petInfo.weight}
                onChange={(e) => setPetInfo((p) => ({ ...p, weight: e.target.value }))}
                className="h-10 w-full rounded-full bg-[var(--color-surface-light)] px-5 pr-12 text-body-14-r text-[var(--color-text)] outline-none"
              />
              <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-body-13-r text-[var(--color-text-secondary)]">
                kg
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-caption-12-r text-[var(--color-text-secondary)]">성별</label>
            <div className="flex gap-2.5">
              {(["male", "female"] as const).map((g) => {
                const selected = petInfo.gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setPetInfo((p) => ({ ...p, gender: g }))}
                    className={[
                      "flex min-w-0 flex-1 items-center justify-center px-2.5 text-body-14-sb leading-[17px] transition-colors max-md:h-11 max-md:rounded-full md:h-10 md:rounded-[10px]",
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

          <div className="flex flex-col gap-1.5">
            <label htmlFor="checklist-pet-special" className="text-caption-12-r text-[var(--color-text-secondary)]">
              특징
            </label>
            <input
              id="checklist-pet-special"
              type="text"
              placeholder={SPECIAL_NOTES_PLACEHOLDER}
              value={petInfo.specialNotes}
              maxLength={SPECIAL_NOTES_MAX_LENGTH}
              onChange={(e) => setPetInfo((p) => ({ ...p, specialNotes: e.target.value }))}
              className="h-10 rounded-full bg-[var(--color-surface-light)] px-5 text-body-14-r text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]"
            />
          </div>
        </div>

        {/* PC CTA (모바일은 카드 바깥에서 렌더) */}
        <div className="mt-8 w-full max-md:hidden md:mx-auto md:max-w-[380px]">
          <Button
            type="button"
            onClick={onNext}
            disabled={!isNameValid}
            variant="primary"
            size="lg"
            className={CTA_CLASS}
          >
            체크리스트 작성하기
          </Button>
        </div>
      </div>
    </div>
  );
}
