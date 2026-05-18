/** Tailwind `md:` / `max-md:` — globals.css `@theme --breakpoint-md` 와 동기화 */
export const BREAKPOINT_MD_PX = 1040;

export const MEDIA_MD_MIN = `(min-width: ${BREAKPOINT_MD_PX}px)`;

/** Image `sizes` 등 max-md 상한 */
export const MEDIA_MAX_MD_SIZES = `(max-width: ${BREAKPOINT_MD_PX - 1}px)`;

export function isBelowMdViewport(width: number) {
  return width < BREAKPOINT_MD_PX;
}
