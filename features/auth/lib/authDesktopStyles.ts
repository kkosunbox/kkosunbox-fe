/* ─── 로그인/회원가입 공용 스타일 — border-bottom 밑줄형 입력 ─── */

export const authLabelCls = "block text-[13px] font-medium leading-4 text-[var(--color-text)]";

export const authUnderlineInputCls =
  "w-full border-0 border-b border-[var(--color-input-underline)] bg-transparent pb-[10px] text-[14px] font-medium leading-[140%] text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)] transition-colors focus:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50";

export const authInlineActionBtnCls =
  "h-10 shrink-0 rounded-[8px] bg-[var(--color-btn-dark-warm)] px-4 text-[13px] font-medium text-white whitespace-nowrap transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50";

/** 모바일 인증번호 전송 등 — 흰 배경 + 오렌지 텍스트 (피그마 모바일) */
export const authMobileInlineActionBtnCls =
  "h-10 shrink-0 rounded-[8px] border border-[var(--color-cta-button)] bg-white px-3 text-[13px] font-medium text-[var(--color-cta-button)] whitespace-nowrap transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50";

export const authCtaButtonCls =
  "flex h-[54px] w-full items-center justify-center rounded-[12px] bg-[var(--color-cta-button)] text-[16px] font-semibold leading-[140%] tracking-[0.2px] text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

/** 모바일 CTA — Figma Frame 41 (327×48, #EC7700) */
export const authMobileCtaButtonCls =
  "flex h-12 w-full items-center justify-center rounded-[12px] bg-[var(--color-cta-button)] text-[14px] font-semibold leading-[17px] tracking-[-0.04em] text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";
