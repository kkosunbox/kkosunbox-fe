/** Tailwind `sm:` / `max-sm:` — 모바일 시작 (globals.css `@theme --breakpoint-sm` 와 동기화) */
export const BREAKPOINT_SM_PX = 360;

export const MEDIA_SM_MIN = `(min-width: ${BREAKPOINT_SM_PX}px)`;

/** Image `sizes` 등 max-sm 상한 */
export const MEDIA_MAX_SM_SIZES = `(max-width: ${BREAKPOINT_SM_PX - 1}px)`;

/** Tailwind `md:` / `max-md:` — 태블릿 시작 (globals.css `@theme --breakpoint-md` 와 동기화) */
export const BREAKPOINT_MD_PX = 768;

/** Tailwind `md2:` / `max-md2:` — 일부 hero 섹션 전용 커스텀 브레이크포인트 (globals.css `@theme --breakpoint-md2` 와 동기화) */
export const BREAKPOINT_MD2_PX = 950;

export const MEDIA_MD2_MIN = `(min-width: ${BREAKPOINT_MD2_PX}px)`;

export const MEDIA_MAX_MD2_SIZES = `(max-width: ${BREAKPOINT_MD2_PX - 1}px)`;

export const MEDIA_MD_MIN = `(min-width: ${BREAKPOINT_MD_PX}px)`;

/** Image `sizes` 등 max-md 상한 */
export const MEDIA_MAX_MD_SIZES = `(max-width: ${BREAKPOINT_MD_PX - 1}px)`;

/** Tailwind `lg:` / `max-lg:` — 데스크탑 시작 (globals.css `@theme --breakpoint-lg` 와 동기화) */
export const BREAKPOINT_LG_PX = 1200;

export const MEDIA_LG_MIN = `(min-width: ${BREAKPOINT_LG_PX}px)`;

/** Image `sizes` 등 max-lg 상한 */
export const MEDIA_MAX_LG_SIZES = `(max-width: ${BREAKPOINT_LG_PX - 1}px)`;

/** Tailwind `xl:` / `max-xl:` — 와이드 데스크탑 시작 (globals.css `@theme --breakpoint-xl` 와 동기화) */
export const BREAKPOINT_XL_PX = 1440;

export const MEDIA_XL_MIN = `(min-width: ${BREAKPOINT_XL_PX}px)`;

/** Image `sizes` 등 max-xl 상한 */
export const MEDIA_MAX_XL_SIZES = `(max-width: ${BREAKPOINT_XL_PX - 1}px)`;

export function isBelowSmViewport(width: number) {
  return width < BREAKPOINT_SM_PX;
}

export function isBelowMdViewport(width: number) {
  return width < BREAKPOINT_MD_PX;
}

export function isBelowLgViewport(width: number) {
  return width < BREAKPOINT_LG_PX;
}

export function isBelowXlViewport(width: number) {
  return width < BREAKPOINT_XL_PX;
}
