import type { Metadata, Viewport } from "next";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const viewport: Viewport = {
  themeColor: "#FEFDF4",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  ...NOINDEX_METADATA,
  appleWebApp: {
    statusBarStyle: "default",
  },
};

/** 회원가입 페이지 레이아웃 — Header·Footer 미노출, 모바일 안전영역은 로그인과 동일 톤 */
export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-login-mobile-chrome>
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
      <main>{children}</main>
    </div>
  );
}
