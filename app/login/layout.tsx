import type { Metadata, Viewport } from "next";
import { Header } from "@/widgets/header";
import { FooterSection } from "@/widgets/footer";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const viewport: Viewport = {
  themeColor: "#FFF4EA",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  ...NOINDEX_METADATA,
  appleWebApp: {
    statusBarStyle: "default",
  },
};

/**
 * 로그인 페이지 레이아웃
 * - 모바일·태블릿: Header/Footer 미노출 (전체화면 앱 스타일)
 * - 데스크톱(lg+): Header/Footer 노출
 *
 * `display: none`은 position: fixed 자식 포함 하위 요소 전체를
 * 렌더링 트리에서 제거하므로 max-lg:hidden 감싸기가 정상 동작한다.
 */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-login-mobile-chrome>
      {/* P1: 브라우저 안전영역 2색 도색 — 상단=크림 / 하단=파랑.
          viewport-fit=cover + env(safe-area-inset-*)로 노치·다이내믹 아일랜드/홈 인디케이터
          영역을 직접 칠한다. 미지원 기기는 globals.css의 단일 크림 캔버스로 폴백된다.
          헤더 띠배너와 동일한 fixed inset-x-0 z-[51] 베이스 클래스 패턴. */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[51] lg:hidden"
        style={{
          height: "calc(env(safe-area-inset-top) + 30px)",
          backgroundColor: "var(--color-login-top)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[51] lg:hidden"
        style={{
          height: "env(safe-area-inset-bottom)",
          backgroundColor: "var(--color-login-mobile-chrome)",
        }}
      />
      <div className="max-lg:hidden">
        <Header />
      </div>
      {children}
      <div className="max-lg:hidden">
        <FooterSection />
      </div>
    </div>
  );
}
