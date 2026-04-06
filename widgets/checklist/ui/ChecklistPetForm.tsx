"use client";

import { useRef } from "react";
import { Button, DatePicker } from "@/shared/ui";
import type { PetInfo } from "./types";

function formatBirthDateDisplay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

const CTA_CLASS =
  "!h-[56px] !w-full !bg-[var(--color-accent)] !text-[16px] font-semibold transition-opacity hover:opacity-90 active:opacity-80";

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
        className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full"
        style={{ background: "var(--color-secondary)" }}
        aria-hidden="true"
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="반려견 프로필" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[44px]">🐶</span>
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

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] text-[var(--color-text-secondary)]">강아지 이름</label>
          <input
            type="text"
            placeholder="이름"
            value={petInfo.name}
            onChange={(e) => setPetInfo((p) => ({ ...p, name: e.target.value }))}
            className="h-[52px] rounded-full bg-[var(--color-surface-light)] px-5 text-[14px] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="checklist-pet-birth"
            className="text-[12px] text-[var(--color-text-secondary)]"
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
            triggerClassName="!h-[52px] !rounded-full !border-0 !bg-[var(--color-surface-light)] !px-5 hover:!border-0"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] text-[var(--color-text-secondary)]">몸무게</label>
          <div className="relative">
            <input
              type="number"
              value={petInfo.weight}
              onChange={(e) => setPetInfo((p) => ({ ...p, weight: e.target.value }))}
              className="h-[52px] w-full rounded-full bg-[var(--color-surface-light)] px-5 pr-12 text-[14px] text-[var(--color-text)] outline-none"
            />
            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[13px] text-[var(--color-text-secondary)]">
              kg
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] text-[var(--color-text-secondary)]">성별</label>
          <div className="flex gap-2.5">
            {(["male", "female"] as const).map((g) => {
              const selected = petInfo.gender === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setPetInfo((p) => ({ ...p, gender: g }))}
                  className={[
                    "flex min-w-0 flex-1 items-center justify-center px-2.5 text-[14px] font-semibold leading-[17px] transition-colors max-md:h-11 max-md:rounded-full md:h-10 md:rounded-[10px]",
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
      </div>

      {/* PC CTA (모바일은 카드 바깥에서 렌더) */}
      <div className="mt-8 w-full max-md:hidden md:mx-auto md:max-w-[380px]">
        <Button
          type="button"
          onClick={onNext}
          variant="primary"
          size="lg"
          className={CTA_CLASS}
        >
          체크리스트 작성하기
        </Button>
      </div>
    </div>
  );
}
