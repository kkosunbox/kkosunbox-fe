"use client";

import type { ReactNode } from "react";
import type { OAuthProvider } from "../lib/oauth";
import { GoogleIcon, KakaoIcon, NaverIcon } from "./SocialLoginIcons";

const PROVIDERS: { key: OAuthProvider; label: string; bg?: string }[] = [
  { key: "kakao", label: "카카오로 로그인", bg: "var(--color-kakao)" },
  { key: "naver", label: "네이버로 로그인", bg: "var(--color-naver)" },
  { key: "google", label: "구글로 로그인" },
];

const ICONS: Record<OAuthProvider, () => ReactNode> = {
  kakao: () => <KakaoIcon />,
  naver: () => <NaverIcon />,
  google: () => <GoogleIcon />,
};

export function SocialLoginButtons({
  onSelect,
  lastLoginMethod,
  renderBadge,
}: {
  onSelect: (provider: OAuthProvider) => void;
  /** 최근 사용한 로그인 수단 — 소셜 provider 키와 일치할 때만 해당 버튼 위에 renderBadge를 띄운다.
   *  로그인 페이지는 "email"도 저장하므로 OAuthProvider보다 넓은 string으로 받는다 (회원가입 페이지는 미전달). */
  lastLoginMethod?: string | null;
  renderBadge?: () => ReactNode;
}) {
  return (
    <div className="flex items-center justify-center gap-[40px]">
      {PROVIDERS.map(({ key, label, bg }) => (
        <div key={key} className="relative">
          {lastLoginMethod === key && renderBadge?.()}
          <button
            type="button"
            aria-label={label}
            onClick={() => onSelect(key)}
            className={[
              "flex h-[46px] w-[46px] items-center justify-center rounded-full transition-opacity hover:opacity-85",
              key === "google" ? "bg-[var(--color-surface-light)]" : "",
            ].join(" ")}
            style={bg ? { backgroundColor: bg } : undefined}
          >
            {ICONS[key]()}
          </button>
        </div>
      ))}
    </div>
  );
}
