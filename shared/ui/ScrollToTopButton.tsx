"use client";

import { useCallback, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

const EXCLUDED_PATH_PREFIXES = ["/mypage", "/support"] as const;

function isExcludedPath(pathname: string) {
  return EXCLUDED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function getScrollY() {
  return window.scrollY || document.documentElement.scrollTop;
}

function subscribeScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  window.addEventListener("resize", callback, { passive: true });
  return () => {
    window.removeEventListener("scroll", callback);
    window.removeEventListener("resize", callback);
  };
}

function getScrollPastViewportSnapshot() {
  return getScrollY() > window.innerHeight;
}

export default function ScrollToTopButton() {
  const pathname = usePathname();
  const isPastViewport = useSyncExternalStore(
    subscribeScroll,
    getScrollPastViewportSnapshot,
    () => false,
  );

  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (isExcludedPath(pathname)) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="맨 위로 이동"
      className={`fixed right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-text-muted)]/25 bg-white/85 text-[var(--color-text)] shadow-[0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-[2px] transition-[opacity,transform] duration-200 ease-out active:scale-95 md:hidden lg:hidden ${
        isPastViewport
          ? "pointer-events-auto bottom-6 translate-y-0 opacity-100"
          : "pointer-events-none bottom-6 translate-y-2 opacity-0"
      }`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 4L11.2929 3.29289L12 2.58579L12.7071 3.29289L12 4ZM13 19C13 19.5523 12.5523 20 12 20C11.4477 20 11 19.5523 11 19L12 19L13 19ZM6 10L5.29289 9.29289L11.2929 3.29289L12 4L12.7071 4.70711L6.70711 10.7071L6 10ZM12 4L12.7071 3.29289L18.7071 9.29289L18 10L17.2929 10.7071L11.2929 4.70711L12 4ZM12 4L13 4L13 19L12 19L11 19L11 4L12 4Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}
