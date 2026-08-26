import { useState, useEffect } from "react";

export function useHeaderScroll(pathname: string) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBannerCollapsed, setIsBannerCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 0);
      // 짧은 페이지에서는 배너가 접히며 문서 높이가 줄어 scrollY가 임계값 아래로
      // 밀릴 수 있다. 같은 임계값으로 다시 펼치면 접힘/펼침이 반복되므로,
      // 한 번 접힌 배너는 실제 최상단에 도달했을 때만 복원한다.
      setIsBannerCollapsed((collapsed) => (collapsed ? y > 0 : y > 36));
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
