"use client";

import Link from "next/link";

/** 회원가입은 로그인 탭에 속한다 (로그인 탭 안의 링크로 진입) */
export type AuthTabKey = "login" | "guest-order";

const TABS: { key: AuthTabKey; label: string; href: string }[] = [
  { key: "login", label: "로그인", href: "/login" },
  { key: "guest-order", label: "비회원 주문조회", href: "/login/guest" },
];

/** 로그인·비회원 주문조회 전환 탭 — 각 라우트로 이동한다 */
export function AuthTabs({
  active,
  variant = "desktop",
}: {
  active: AuthTabKey;
  /** mobile: Figma 278×40 토글 / desktop: 데스크톱 카드용 큰 탭 */
  variant?: "mobile" | "desktop";
}) {
  const isMobile = variant === "mobile";

  return (
    <div
      className={[
        "flex w-full items-center rounded-[30px]",
        isMobile
          ? "h-10 bg-[var(--color-auth-mobile-tab-track)] p-0.5"
          : "bg-[var(--color-border-light)] p-[2px]",
      ].join(" ")}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "flex flex-1 items-center justify-center rounded-[30px] text-center tracking-[-0.02em] transition-colors",
              isMobile
                ? [
                    "h-9 text-[13px] leading-[150%]",
                    isActive
                      ? "bg-white font-bold text-black"
                      : "font-semibold text-[var(--color-text-tertiary)]",
                  ].join(" ")
                : [
                    "py-[13px] text-[18px] leading-[150%]",
                    isActive
                      ? "m-[2px] bg-white font-bold text-black"
                      : "font-semibold text-[var(--color-text-tertiary)]",
                  ].join(" "),
            ].join(" ")}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
