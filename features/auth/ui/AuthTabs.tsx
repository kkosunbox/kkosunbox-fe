"use client";

import Link from "next/link";

export type AuthTabKey = "login" | "register";

const TABS: { key: AuthTabKey; label: string; href: string }[] = [
  { key: "login", label: "로그인", href: "/login" },
  { key: "register", label: "회원가입", href: "/register" },
];

/** 로그인·회원가입 전환 탭 — 각 라우트로 이동한다 */
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
                      ? "my-[2px] bg-white font-bold text-black"
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
