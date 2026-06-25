import type { Viewport } from "next";
import { Header } from "@/widgets/header";
import { FooterSection } from "@/widgets/footer";

export const viewport: Viewport = {
  themeColor: "#FFF4EA",
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
      {/* 모바일·태블릿: form 뒤 최상단 고정 배경 — theme-color 미지원 브라우저 보완 */}
      <div
        aria-hidden="true"
        className="max-lg:fixed max-lg:inset-x-0 max-lg:top-0 max-lg:h-svh max-lg:-z-10 lg:hidden"
        style={{ backgroundColor: "var(--color-login-top)" }}
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
