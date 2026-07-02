/** 프로필 작성 모달·폼 공통 스타일 (Figma Group 1000005502) */

export const PROFILE_PET_FORM_STACK = "flex flex-col gap-4";

export const PROFILE_PET_FIELD = "flex flex-col gap-2";

export const PROFILE_PET_LABEL =
  "text-body-13-m leading-4 text-[var(--color-text-secondary)] opacity-80";

export const PROFILE_PET_INPUT =
  "h-10 w-full rounded-[8px] border-0 bg-[var(--color-surface-light)] px-5 text-body-14-m leading-[1.4] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)] focus:ring-0";

export const PROFILE_PET_WEIGHT_INPUT = `${PROFILE_PET_INPUT} !pr-10`;

export const PROFILE_PET_INPUT_SUFFIX =
  "pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-body-14-m leading-[1.4] text-[var(--color-text-secondary)]";

export const PROFILE_PET_GENDER_ROW = "flex gap-3";

export function profilePetGenderBtnClass(selected: boolean): string {
  return [
    "flex h-9 min-w-0 flex-1 items-center justify-center rounded-[8px] border-0 text-[14px] leading-[17px] transition-colors",
    selected
      ? "bg-[var(--color-profile-gender-selected-bg)] font-semibold text-[var(--color-about-hero-accent)]"
      : "bg-[var(--color-surface-light)] font-medium text-[var(--color-text)]",
  ].join(" ");
}

export const PROFILE_PET_SUBMIT_BTN =
  "flex !h-10 !w-full items-center justify-center rounded-[8px] border-0 !bg-[var(--color-btn-dark-warm)] text-body-14-sb-tight !tracking-[-0.02em] !text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50";

export const PROFILE_PET_BREED_INPUT_CLASS =
  "!h-10 !rounded-[8px] !border-0 !bg-[var(--color-surface-light)] !px-5 !pr-[48px] !text-body-14-m !font-medium !leading-[1.4] !tracking-normal !text-[var(--color-text)] placeholder:!text-[var(--color-text-secondary)] focus:!border-0 focus:!ring-0";

export const PROFILE_PET_DATE_TRIGGER_CLASS =
  "!h-10 !rounded-[8px] !border-0 !bg-[var(--color-surface-light)] !px-5 hover:!border-0 [&_span]:!text-body-14-m [&_span]:!font-medium [&_span]:!leading-[1.4] [&_span]:!tracking-normal !text-[var(--color-text)] data-[placeholder=true]:[&_span]:!text-[var(--color-text-secondary)]";

export const PROFILE_PET_WIDGET_CARD =
  "md:w-[258px] md:rounded-[20px] md:shadow-[0px_4px_32px_rgba(0,0,0,0.22)]";

export const PROFILE_PET_WIDGET_HEADER =
  "shrink-0 px-6 max-md:pt-[env(safe-area-inset-top,0px)]";

/** 프로필 작성 모달 헤더 타이포 (Figma — @source inline 필수) */
export const PROFILE_PET_MODAL_SUBTITLE = "text-profile-modal-subtitle";
