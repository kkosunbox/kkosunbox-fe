/** Tailwind `md:` / `max-md:` — 태블릿 시작 (globals.css `@theme --breakpoint-md` 와 동기화) */
export const BREAKPOINT_MD_PX = 900;

export const MEDIA_MD_MIN = `(min-width: ${BREAKPOINT_MD_PX}px)`;

/** Image `sizes` 등 max-md 상한 */
export const MEDIA_MAX_MD_SIZES = `(max-width: ${BREAKPOINT_MD_PX - 1}px)`;

/** Tailwind `lg:` / `max-lg:` — 데스크탑 시작 (globals.css `@theme --breakpoint-lg` 와 동기화) */
export const BREAKPOINT_LG_PX = 1200;

export const MEDIA_LG_MIN = `(min-width: ${BREAKPOINT_LG_PX}px)`;

/** Image `sizes` 등 max-lg 상한 */
export const MEDIA_MAX_LG_SIZES = `(max-width: ${BREAKPOINT_LG_PX - 1}px)`;

export function isBelowMdViewport(width: number) {
  return width < BREAKPOINT_MD_PX;
}

export function isBelowLgViewport(width: number) {
  return width < BREAKPOINT_LG_PX;
}
