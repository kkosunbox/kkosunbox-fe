"use client";

import Link from "next/link";

export type AuthTabKey = "login" | "register";

const TABS: { key: AuthTabKey; label: string; href: string }[] = [
  { key: "login", label: "로그인", href: "/login" },
  { key: "register", label: "회원가입", href: "/register" },
];

/** 로그인·회원가입 데스크톱 전환 탭 — 각 라우트로 이동한다 */
export function AuthTabs({ active }: { active: AuthTabKey }) {
  return (
    <div className="flex w-full items-center rounded-[30px] bg-[var(--color-border-light)] p-[2px]">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "flex-1 rounded-[30px] py-[13px] text-center text-[18px] leading-[150%] tracking-[-0.02em] transition-colors",
              isActive
                ? "my-[2px] bg-white font-bold text-black"
                : "font-semibold text-[var(--color-text-tertiary)]",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
