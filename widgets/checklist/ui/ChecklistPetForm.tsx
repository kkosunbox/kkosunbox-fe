"use client";

import { useRef } from "react";
import { BreedCombobox, DatePicker } from "@/shared/ui";
import type { PetInfo } from "./types";

const SPECIAL_NOTES_PLACEHOLDER = "예) 푸드퍼즐 간식을 좋아해요.";
const SPECIAL_NOTES_MAX_LENGTH = 200;

function formatBirthDateDisplay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

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
        className="flex max-md:h-[88px] max-md:w-[88px] md:h-[124px] md:w-[124px] cursor-pointer items-center justify-center overflow-hidden rounded-full"
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
        className="absolute max-md:-bottom-1 md:bottom-0 lg:bottom-0 max-md:-right-1 md:right-0 lg:right-0 flex h-[24px] w-[24px] md:h-[40px] lg:h-[40px] md:w-[40px] lg:w-[40px] items-center justify-center rounded-full bg-white shadow-md"
      >
        <svg className="h-5 w-5 md:h-8 lg:h-8 md:w-8 lg:w-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21.5205 6.42383C21.945 6.46921 22.2837 6.66391 22.5527 6.86914C22.837 7.08606 23.1418 7.39377 23.4551 7.70703L24.626 8.87891L24.6475 8.89941L24.6562 8.91016C24.9589 9.21268 25.254 9.50624 25.4639 9.78125C25.6984 10.0886 25.9189 10.4864 25.9189 11C25.9189 11.5136 25.6984 11.9114 25.4639 12.2188C25.2469 12.5031 24.9393 12.8078 24.626 13.1211L14.4326 23.3154C14.2755 23.4725 14.0713 23.6886 13.8076 23.8379C13.5439 23.9872 13.2536 24.0506 13.0381 24.1045L9.05078 25.1016C8.90291 25.1385 8.6815 25.1968 8.4873 25.2158C8.28067 25.236 7.82868 25.2425 7.45996 24.874C7.09145 24.5055 7.09798 24.0536 7.11816 23.8467C7.13717 23.6523 7.19545 23.4301 7.23242 23.2822L8.22852 19.2949C8.2824 19.0794 8.34678 18.7891 8.49609 18.5254L8.61816 18.3389C8.74905 18.1631 8.8998 18.0191 9.01758 17.9014L19.2119 7.70703C19.5253 7.39369 19.8299 7.08607 20.1143 6.86914C20.4216 6.63466 20.8195 6.41416 21.333 6.41406L21.5205 6.42383Z" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 9.00065L22 6.33398L26 10.334L23.3333 14.334L18 9.00065Z" fill="var(--color-text-secondary)" />
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
}

export default function ChecklistPetForm({
  petInfo,
  setPetInfo,
  avatarSrc,
  onAvatarChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const birthMaxDate = new Date();
  const birthMinDate = new Date(birthMaxDate.getFullYear() - 40, 0, 1);

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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-2 md:gap-4 lg:gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-body-13-m opacity-80 text-[var(--color-text-secondary)]">
              강아지 이름 <span className="text-[var(--color-accent)]">*</span>
            </label>
            <input
              type="text"
              placeholder="이름"
              value={petInfo.name}
              onChange={(e) => setPetInfo((p) => ({ ...p, name: e.target.value }))}
              className="h-10 rounded-[8px] bg-[var(--color-surface-light)] px-5 text-body-14-r text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="checklist-pet-breed" className="text-body-13-m opacity-80 text-[var(--color-text-secondary)]">
              강아지 품종
            </label>
            <div className="relative w-full">
              <BreedCombobox
                id="checklist-pet-breed"
                value={petInfo.breed}
                onChange={(breed) => setPetInfo((p) => ({ ...p, breed }))}
                placeholder="ex) 웰시코기"
                className="w-full"
                inputClassName="!h-10 !rounded-[8px] !border-0 !bg-[var(--color-surface-light)] !px-5 !pr-[56px] !text-body-14-r !font-normal !tracking-normal placeholder:text-[var(--color-text-secondary)] focus:!border-0 focus:!ring-0"
                clearButtonRight="right-[38px]"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                <BreedSearchGlyph />
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 max-md:order-4">
            <label
              htmlFor="checklist-pet-birth"
              className="text-body-13-m opacity-80 text-[var(--color-text-secondary)]"
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
              triggerClassName="!h-10 !rounded-[8px] !border-0 !bg-[var(--color-surface-light)] !px-5 hover:!border-0 [&_span]:!text-body-14-r [&_span]:!font-normal [&_span]:!tracking-normal"
            />
          </div>

          <div className="flex flex-col gap-2 max-md:order-3">
            <label className="text-body-13-m opacity-80 text-[var(--color-text-secondary)]">몸무게</label>
            <div className="relative">
              <input
                type="number"
                value={petInfo.weight}
                onChange={(e) => setPetInfo((p) => ({ ...p, weight: e.target.value }))}
                className="h-10 w-full rounded-[8px] bg-[var(--color-surface-light)] px-5 pr-12 text-body-14-r text-[var(--color-text)] outline-none"
              />
              <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-body-13-r text-[var(--color-text-secondary)]">
                kg
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-body-13-m opacity-80 text-[var(--color-text-secondary)]">성별</label>
            <div className="flex gap-3">
              {(["male", "female"] as const).map((g) => {
                const selected = petInfo.gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setPetInfo((p) => ({ ...p, gender: g }))}
                    className={[
                      "flex h-10 min-w-0 flex-1 items-center justify-center rounded-[8px] px-[10px] leading-[17px] transition-colors",
                      selected
                        ? "bg-[var(--color-accent-soft)] text-[var(--color-brown-dark)] text-body-14-sb"
                        : "bg-[var(--color-surface-light)] text-[var(--color-text)] text-body-14-m",
                    ].join(" ")}
                  >
                    {g === "male" ? "남" : "여"}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="checklist-pet-special" className="text-body-13-m opacity-80 text-[var(--color-text-secondary)]">
              특징
            </label>
            <textarea
              id="checklist-pet-special"
              placeholder={SPECIAL_NOTES_PLACEHOLDER}
              value={petInfo.specialNotes}
              maxLength={SPECIAL_NOTES_MAX_LENGTH}
              onChange={(e) => setPetInfo((p) => ({ ...p, specialNotes: e.target.value }))}
              className="max-md:h-14 md:h-10 resize-none rounded-[8px] bg-[var(--color-surface-light)] px-5 py-2.5 text-body-14-r text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
