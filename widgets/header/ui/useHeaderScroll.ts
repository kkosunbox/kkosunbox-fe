import { useState, useEffect } from "react";

export function useHeaderScroll(pathname: string) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBannerCollapsed, setIsBannerCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 0);
      setIsBannerCollapsed(y > 36);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 라우트 변경 시 스크롤 상태 재평가
  useEffect(() => {
    window.dispatchEvent(new Event("scroll"));
  }, [pathname]);

  // 배너 높이 CSS 변수 — 다른 레이아웃 요소가 이 값을 참조함
  useEffect(() => {
    if (isBannerCollapsed) {
      document.documentElement.style.setProperty("--banner-height", "0px");
    } else {
      document.documentElement.style.removeProperty("--banner-height");
    }
  }, [isBannerCollapsed]);

  return { isScrolled, isBannerCollapsed };
}
