/**
 * 폼·고객센터 페이지 메인 콘텐츠 래퍼
 * - 모바일 (<834px): max-w 640px + px-4
 * - 태블릿 (834–1199px): max-w-content(800px) + px-8
 * - 데스크톱 (≥1200px): max-w-content(1012px), px-0 (중앙 정렬)
 */
export const PAGE_CONTENT_WRAPPER_CLASS =
  "mx-auto w-full max-md:max-w-[640px] max-md:px-6 md:max-w-content lg:max-w-content md:px-8 max-lg:px-8 lg:px-0";

/** flex column 레이아웃이 필요한 고객센터 목록·FAQ 등 */
export const PAGE_CONTENT_WRAPPER_FLEX_CLASS = `${PAGE_CONTENT_WRAPPER_CLASS} flex flex-1 flex-col gap-4 md:gap-6 lg:gap-6`;
