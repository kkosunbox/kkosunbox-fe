/* ─── 로그인/회원가입 데스크톱(lg+) 공용 스타일 — border-bottom 밑줄형 입력 ─── */

export const authLabelCls = "block text-[13px] font-medium leading-4 text-[var(--color-text)]";

export const authUnderlineInputCls =
  "w-full border-0 border-b border-[var(--color-input-underline)] bg-transparent pb-[10px] text-[14px] font-medium leading-[140%] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)] transition-colors focus:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50";

export const authInlineActionBtnCls =
  "h-10 shrink-0 rounded-[8px] bg-[var(--color-btn-dark-warm)] px-4 text-[13px] font-medium text-white whitespace-nowrap transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50";

export const authCtaButtonCls =
  "flex h-[54px] w-full items-center justify-center rounded-[12px] bg-[var(--color-cta-button)] text-[16px] font-semibold leading-[140%] tracking-[0.2px] text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";
