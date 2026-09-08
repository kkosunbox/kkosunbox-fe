import type { ReactNode } from "react";
import Image from "next/image";
import logoMain2x from "@/shared/assets/logo-main@2x.webp";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { AuthMobileBackground, AuthMobileDecoration } from "./AuthMobileBackground";
import { AuthTabs, type AuthTabKey } from "./AuthTabs";

const LOGO_WIDTH = 156;
const LOGO_HEIGHT = Math.round((136 * LOGO_WIDTH) / 414);

/**
 * 로그인·회원가입 모바일(<lg) 셸.
 * 그라데이션+데코 배경, 로고, 로그인/회원가입 탭을 공통으로 두고 children에 폼을 받는다.
 */
export function AuthMobileShell({
  active,
  children,
}: {
  /** 로그인/회원가입 전환 탭 — 생략하면 탭 없이 로고 바로 아래에 children이 온다 (비밀번호 찾기 등) */
  active?: AuthTabKey;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-1 flex-col overflow-hidden lg:hidden">
      <AuthMobileBackground />

      <div className="relative flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-6 pb-8 pt-[30px]">
        <div
          className={[
            "relative isolate mx-auto w-full max-w-[328px]",
            active
              ? "max-md:my-0 max-md:pb-10 max-md:pt-[69px] md:my-auto md:py-10"
              : "my-auto py-10",
          ].join(" ")}
        >
          <div className="absolute inset-0 -z-10">
            <AuthMobileDecoration hasTabs={Boolean(active)} />
          </div>
          <div
            className={[
              "flex items-center justify-center",
              active ? "max-md:pb-[69px] md:pb-10" : "pb-10",
            ].join(" ")}
          >
            <Image
              src={logoMain2x}
              alt="꼬순박스"
              width={LOGO_WIDTH}
              height={LOGO_HEIGHT}
              quality={HIGH_IMAGE_QUALITY}
              className="relative h-auto"
              priority
            />
          </div>

          {active && (
            <div className="mx-auto w-[278px]">
              <AuthTabs active={active} variant="mobile" />
            </div>
          )}

          <div className={active ? "mt-14" : undefined}>{children}</div>
        </div>
      </div>
    </div>
  );
}
