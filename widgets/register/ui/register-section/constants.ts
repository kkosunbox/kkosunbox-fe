/* ─── 상수 ─── */
export const RESEND_COOLDOWN = 60;

/* ─── 공통 스타일 ─── */
export const inputBase =
  "h-10 w-full md:w-[220px] lg:w-[220px] rounded-[4px] bg-white px-3 text-[13px] font-medium leading-[140%] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none focus:ring-1 focus:ring-[var(--color-accent)] transition-opacity";

export const inputDisabled = "opacity-50 pointer-events-none bg-[var(--color-surface-light)]";

export const actionBtnCls =
  "h-10 shrink-0 rounded-[8px] text-[13px] font-medium leading-4 text-white whitespace-nowrap transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50";

/* ─── 약관 ─── */
export type Agreements = { terms: boolean; privacy: boolean; marketing: boolean };
export type AgreementKey = keyof Agreements;

/* ─── 약관 목록 ─── */
export const AGREEMENTS = [
  { key: "terms"     as const, label: "서비스 이용약관 동의",    required: true  },
  { key: "privacy"   as const, label: "개인정보처리방침 및 동의", required: true  },
  { key: "marketing" as const, label: "마케팅 정보 수신 동의",   required: false },
] as const;
