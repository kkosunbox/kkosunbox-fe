"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logoMain2x from "@/shared/assets/logo-main@2x.png";
import loginBannerHd from "@/shared/assets/login-banner-hd.png";

const LOGO_WIDTH = 156;
const LOGO_HEIGHT = Math.round((136 * LOGO_WIDTH) / 414);

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="#9E9E9E" strokeWidth="1.5" />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 1.5C4.858 1.5 1.5 4.086 1.5 7.275c0 1.957 1.296 3.676 3.281 4.696L3.952 15l3.623-2.393c.465.065.942.1 1.425.1 4.142 0 7.5-2.586 7.5-5.775S13.142 1.5 9 1.5z" fill="#000" />
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M11.4 10.22L8.48 5.5H5.5v9h3.1V9.78L11.52 14.5H14.5V5.5H11.4v4.72z" fill="white" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col md:pt-[54px]">

      {/* ── 모바일 전용: 웜 상단 섹션 ── */}
      <div
        className="md:hidden flex items-center justify-center shrink-0"
        style={{ background: "var(--color-secondary)", borderRadius: "0 0 60px 60px", height: "242px" }}
      >
        <Image src={logoMain2x} alt="꼬순박스" width={LOGO_WIDTH} height={LOGO_HEIGHT} className="h-auto" priority />
      </div>

      {/* ── 콘텐츠: 모바일 세로 / 데스크톱 2컬럼 ── */}
      <div className="flex flex-col md:flex-row flex-1">

        {/* 좌측 — 폼 */}
        <div className="flex-1 flex flex-col md:items-center md:justify-center md:min-h-[calc(100vh-54px)]">
          <div className="flex-1 flex flex-col md:flex-none w-full md:max-w-[540px] px-6 md:px-0 pt-[42px] md:pt-0 pb-12 md:pb-0">

            {/* 데스크톱 전용 헤딩 — Griun PolFairness 28px/400, center, --color-primary */}
            <p
              className="max-md:hidden text-center text-[var(--color-primary)] mb-7"
              style={{
                fontFamily: "Griun PolFairness",
                fontSize: "28px",
                fontWeight: 400,
                lineHeight: "140%",
                letterSpacing: "-0.02em",
                textShadow: "2px 4px 8px rgba(252, 226, 206, 0.2)",
              }}
            >
              우리 아이를 위한 건강한 간식,{"\n"}꼬순박스에 오신 걸 환영해요
            </p>

            {/* 이메일 입력 */}
            <input
              type="email"
              placeholder="email@gmail.com"
              autoComplete="email"
              className="w-full rounded-full bg-[var(--color-surface-light)] outline-none text-[var(--color-text)] font-semibold placeholder:font-semibold placeholder:text-[var(--color-text)]
                h-[52px] px-8 text-[16px]
                md:h-[72px] md:px-6 md:text-[24px] md:tracking-[0.2px]"
            />

            {/* 비밀번호 입력 */}
            <div className="relative mt-6">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                className="w-full rounded-full bg-[var(--color-surface-light)] outline-none text-[var(--color-text)] font-medium placeholder:text-[var(--color-text-secondary)]
                  h-[52px] px-8 pr-12 text-[16px]
                  md:h-[72px] md:px-6 md:pr-16 md:text-[24px]"
              />
              <button
                type="button"
                className="absolute right-5 top-1/2 -translate-y-1/2 opacity-80 md:right-6"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showPassword
                  ? <EyeIcon className="w-4 h-4 md:w-6 md:h-6" />
                  : <EyeOffIcon className="w-4 h-4 md:w-6 md:h-6" />}
              </button>
            </div>

            {/* 비밀번호 찾기 */}
            <div className="mt-5 text-right">
              <Link
                href="/forgot-password"
                className="text-[var(--color-accent)] underline text-[14px] md:text-[16px]"
                style={{ fontWeight: 500, lineHeight: "140%", letterSpacing: "-0.02em" }}
              >
                비밀번호를 잃어버리셨나요?
              </Link>
            </div>

            {/* 모바일 전용 스페이서 (버튼을 하단으로 밀기) */}
            <div className="flex-1 min-h-[40px] md:hidden" />

            {/* 로그인 버튼 — 모바일: h-58px/18px, 데스크톱: h-72px/24px */}
            <button
              type="submit"
              className="w-full rounded-full bg-[var(--color-accent)] text-white font-semibold transition-opacity hover:opacity-90 active:opacity-80
                h-[58px] text-[18px] tracking-[-0.04em]
                md:h-[72px] md:text-[24px] md:tracking-[0.2px] md:mt-20"
            >
              로그인
            </button>

            {/* 간편로그인 — 모바일: 14px, 데스크톱: 18px */}
            <p
              className="text-center text-[var(--color-text-secondary)] text-[14px] md:text-[18px] mt-[18px] md:mt-[34px]"
              style={{ fontWeight: 500, letterSpacing: "0.2px", lineHeight: "140%" }}
            >
              - 간편로그인 -
            </p>

            {/* 소셜 버튼 */}
            <div className="flex items-center justify-center gap-[40px] mt-4 md:mt-7">
              <button type="button" aria-label="카카오로 로그인"
                className="flex h-[46px] w-[46px] items-center justify-center rounded-full transition-opacity hover:opacity-85"
                style={{ backgroundColor: "#FEE500" }}>
                <KakaoIcon />
              </button>
              <button type="button" aria-label="네이버로 로그인"
                className="flex h-[46px] w-[46px] items-center justify-center rounded-full transition-opacity hover:opacity-85"
                style={{ backgroundColor: "#03C75A" }}>
                <NaverIcon />
              </button>
              <button type="button" aria-label="구글로 로그인"
                className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[var(--color-surface-light)] transition-opacity hover:opacity-85">
                <GoogleIcon />
              </button>
            </div>

            {/* 회원가입 — 모바일: 14px gap-2, 데스크톱: 16px gap-1 */}
            <div className="flex items-center justify-center gap-2 md:gap-1 mt-4 md:mt-8">
              <span
                className="text-[var(--color-brown-dark)] opacity-40 text-[14px] md:text-[16px]"
                style={{ fontWeight: 500, lineHeight: "140%", letterSpacing: "-0.02em" }}
              >
                계정이 없으신가요?
              </span>
              <Link
                href="/register"
                className="text-[var(--color-link-warm)] text-[14px] md:text-[16px]"
                style={{ fontWeight: 600, lineHeight: "140%", letterSpacing: "-0.02em" }}
              >
                회원가입하기
              </Link>
            </div>

          </div>
        </div>

        {/* 우측 — 데스크톱 전용 배너 */}
        <div className="max-md:hidden flex-1 relative min-h-[calc(100vh-54px)]">
          <Image
            src={loginBannerHd}
            alt="꼬순박스 배너"
            fill
            className="object-contain object-center p-8 pl-2"
            priority
          />
        </div>

      </div>
    </div>
  );
}
