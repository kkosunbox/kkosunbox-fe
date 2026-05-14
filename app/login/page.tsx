"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import logoMain2x from "@/shared/assets/logo-main@2x.webp";
import loginBannerHd from "@/shared/assets/login-banner-hd.png";
import loginMobileDeco from "@/shared/assets/login-mobile-upper-deco.webp";
import { useAuth, getOAuthUrl } from "@/features/auth";
import type { OAuthProvider } from "@/features/auth";
import { useLoadingOverlay } from "@/shared/ui";

const LOGO_WIDTH = 156;
const LOGO_HEIGHT = Math.round((136 * LOGO_WIDTH) / 414);

/** @font-face 로드 전에도 폭이 비슷하게 나오도록, FOUT 시 줄바꿈 점프 완화 */
const LOGIN_HEADING_FONT =
  '"Griun PolFairness", "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="var(--color-text-secondary)" strokeWidth="1.5" />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg width="46" height="45" viewBox="0 0 46 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="45.9999" height="45" rx="22.5" fill="#FEE500" />
      <g clipPath="url(#clip0_469_10423)">
        <path fillRule="evenodd" clipRule="evenodd" d="M23 14.1C18.0292 14.1 14 17.213 14 21.0523C14 23.44 15.5584 25.545 17.9315 26.797L16.933 30.4445C16.8448 30.7668 17.2134 31.0237 17.4965 30.8369L21.8733 27.9482C22.2427 27.9838 22.6181 28.0046 23 28.0046C27.9705 28.0046 31.9999 24.8918 31.9999 21.0523C31.9999 17.213 27.9705 14.1 23 14.1Z" fill="black" />
      </g>
      <defs>
        <clipPath id="clip0_469_10423">
          <rect width="17.9999" height="18" fill="white" transform="translate(14 13.5)" />
        </clipPath>
      </defs>
    </svg>
  );
}

function NaverIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="46" height="46" rx="23" fill="#03C75A" />
      <g clipPath="url(#clip0_469_10424)">
        <path d="M26.5614 23.7033L19.1461 13H13V33H19.4386V22.295L26.8539 33H33V13H26.5614V23.7033Z" fill="white" />
      </g>
      <defs>
        <clipPath id="clip0_469_10424">
          <rect width="20" height="20" fill="white" transform="translate(13 13)" />
        </clipPath>
      </defs>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="46" height="45" viewBox="0 0 46 45" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="46" height="45" rx="22.5" fill="#F8F8F8" />
      <g clipPath="url(#clip0_469_10425)">
        <path d="M24 20.6818V24.5545H29.3818C29.1455 25.8 28.4363 26.8546 27.3727 27.5636L30.6181 30.0818C32.509 28.3364 33.5999 25.7728 33.5999 22.7273C33.5999 22.0183 33.5363 21.3364 33.4181 20.6819L24 20.6818Z" fill="#4285F4" />
        <path d="M18.3957 24.4034L17.6637 24.9637L15.0728 26.9818C16.7182 30.2454 20.0907 32.5 23.9997 32.5C26.6997 32.5 28.9633 31.6091 30.6179 30.0819L27.3724 27.5636C26.4815 28.1636 25.3451 28.5273 23.9997 28.5273C21.3998 28.5273 19.1907 26.7728 18.3998 24.4091L18.3957 24.4034Z" fill="#34A853" />
        <path d="M15.0726 18.0182C14.3909 19.3636 14 20.8818 14 22.4999C14 24.1181 14.3909 25.6363 15.0726 26.9817C15.0726 26.9907 18.4 24.3999 18.4 24.3999C18.2 23.7999 18.0818 23.1636 18.0818 22.4998C18.0818 21.8361 18.2 21.1998 18.4 20.5998L15.0726 18.0182Z" fill="#FBBC05" />
        <path d="M23.9999 16.4818C25.4727 16.4818 26.7818 16.9909 27.8272 17.9727L30.6908 15.1091C28.9545 13.491 26.7 12.5 23.9999 12.5C20.0909 12.5 16.7182 14.7455 15.0728 18.0182L18.4 20.6C19.1908 18.2363 21.4 16.4818 23.9999 16.4818Z" fill="#EA4335" />
      </g>
      <defs>
        <clipPath id="clip0_469_10425">
          <rect width="20" height="20" fill="white" transform="translate(14 12.5)" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { isLoggedIn, login } = useAuth();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const router = useRouter();
  const searchParams = useSearchParams();
  // 폼 제출로 로그인이 진행 중이면 true. login() 콜백이 직접 navigate하므로
  // isLoggedIn useEffect의 redirect가 그것을 덮어쓰지 않도록 막는다.
  const formLoginInProgressRef = useRef(false);

  // 이미 로그인된 상태(SSR 초기값 또는 클라이언트 세션 복구 완료)면 홈으로 이동
  useEffect(() => {
    if (!isLoggedIn || formLoginInProgressRef.current) return;
    router.replace("/");
  }, [isLoggedIn, router]);

  function handleSocialLogin(provider: OAuthProvider) {
    const url = getOAuthUrl(provider);
    if (url) window.location.href = url;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    showLoading("로그인 중입니다...");
    formLoginInProgressRef.current = true;
    startTransition(async () => {
      try {
        const next = searchParams.get("next") ?? undefined;
        const result = await login(email, password, next);
        if (result.error) {
          formLoginInProgressRef.current = false;
          setError(result.error);
        }
      } finally {
        hideLoading();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-white flex flex-col md:pt-[54px]">

      {/* ── 모바일 전용: 그라데이션 배경 + 장식 레이어 ── */}
      <div className="md:hidden absolute inset-0 overflow-hidden pointer-events-none">
        {/* 그라데이션 둥근 배경 — 뷰포트 전체를 감싸도록 배치 */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: 0,
            width: "max(423px, calc(100% + 48px))",
            bottom: -40,
            background: "var(--gradient-login-bg)",
            borderRadius: 24,
          }}
        />
        {/* 데코 이미지 (꼬랑지) — 상단 장식, 콘텐츠 위에 떠 있음 */}
        <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "2%", width: 423, height: 250 }}>
          <Image
            src={loginMobileDeco}
            alt=""
            fill
            className=""
            aria-hidden="true"
          />
        </div>
      </div>

      {/* ── 콘텐츠: 모바일 세로 중앙 / 데스크톱 2컬럼 ── */}
      <div className="flex flex-1 flex-col max-md:items-center max-md:justify-center md:mx-auto md:w-full md:max-w-content md:flex-row relative">

        {/* 좌측 — 폼 */}
        <div className="flex-1 flex flex-col w-full px-6 max-md:justify-center md:justify-center md:min-h-[calc(100vh-54px)]">
          {/* 모바일: 고정 간격 블록, 세로 중앙 정렬 / 데스크톱: 기존 레이아웃 유지 */}
          <div className="w-full max-w-[400px] px-0 max-md:mx-auto">

            {/* 모바일 전용: 로고 영역 */}
            <div className="max-md:flex md:hidden items-center justify-center pb-[100px]">
              <Image src={logoMain2x} alt="꼬순박스" width={LOGO_WIDTH} height={LOGO_HEIGHT} className="h-auto relative" priority />
            </div>

            {/* 데스크톱 전용 헤딩 */}
            <div className="max-md:hidden mb-8 text-center">
              <p
                className="text-primary min-h-[1.4em] text-[20px] leading-[140%] tracking-[-0.02em]"
                style={{
                  fontFamily: LOGIN_HEADING_FONT,
                  fontWeight: 400,
                  textShadow: "2px 4px 8px rgba(252, 226, 206, 0.2)",
                }}
              >
                우리 아이를 위한 건강한 간식,
              </p>
              <p
                className="text-[var(--color-text)] text-[32px] font-regular leading-[140%] tracking-[-0.02em]"
                style={{ fontFamily: LOGIN_HEADING_FONT }}
              >
                꼬순박스에 오신 걸 환영해요
              </p>
            </div>

            {/* 아이디 입력 */}
            <input
              type="text"
              placeholder="이메일을 입력하세요"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full outline-none text-[var(--color-text)] font-medium placeholder:text-[var(--color-text-secondary)]
                max-md:h-[48px] max-md:px-8 max-md:text-[14px] max-md:bg-white
                md:h-[54px] md:px-6 md:tracking-[0.2px] md:bg-[var(--color-surface-light)] md:text-body-16-m"
            />

            {/* 비밀번호 입력 */}
            <div className="relative max-md:mt-[24px] md:mt-6">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full outline-none text-[var(--color-text)] font-medium placeholder:text-[var(--color-text-secondary)]
                  max-md:h-[48px] max-md:px-8 max-md:pr-12 max-md:text-[14px] max-md:bg-white
                  md:h-[54px] md:px-6 md:pr-16 md:bg-[var(--color-surface-light)] md:text-body-16-m"
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

            {/* 에러 메시지 */}
            {error && (
              <p className="mt-3 text-center text-body-13-m" style={{ color: "var(--color-accent-rust)" }}>
                {error}
              </p>
            )}

            {/* 비밀번호 찾기 */}
            <div className="max-md:mt-[24px] md:mt-5 text-right">
              <Link
                href="/forgot-password"
                className="text-[var(--color-accent)] underline max-md:text-[13px] md:text-body-14-m"
                style={{ fontWeight: 500, lineHeight: "140%", letterSpacing: "-0.02em" }}
              >
                비밀번호를 잃어버리셨나요?
              </Link>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-full bg-[var(--color-accent)] text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60
                max-md:h-[48px] max-md:text-[14px] max-md:font-semibold max-md:tracking-[-0.04em] max-md:mt-[90px]
                md:h-[54px] md:text-subtitle-16-sb md:tracking-[0.2px] md:mt-[68px]"
            >
              {isPending ? "로그인 중..." : "로그인"}
            </button>

            {/* 간편로그인 */}
            <p
              className="text-center text-[var(--color-text-secondary)] text-body-14-m mt-[18px] md:mt-6"
              style={{ fontWeight: 500, letterSpacing: "0.2px", lineHeight: "140%" }}
            >
              - 간편로그인 -
            </p>

            {/* 소셜 버튼 */}
            <div className="flex items-center justify-center gap-[40px] mt-7 md:mt-8">
              <button type="button" aria-label="카카오로 로그인"
                onClick={() => handleSocialLogin("kakao")}
                className="flex h-[46px] w-[46px] items-center justify-center rounded-full transition-opacity hover:opacity-85"
                style={{ backgroundColor: "var(--color-kakao)" }}>
                <KakaoIcon />
              </button>
              <button type="button" aria-label="네이버로 로그인"
                onClick={() => handleSocialLogin("naver")}
                className="flex h-[46px] w-[46px] items-center justify-center rounded-full transition-opacity hover:opacity-85"
                style={{ backgroundColor: "var(--color-naver)" }}>
                <NaverIcon />
              </button>
              <button type="button" aria-label="구글로 로그인"
                onClick={() => handleSocialLogin("google")}
                className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[var(--color-surface-light)] transition-opacity hover:opacity-85">
                <GoogleIcon />
              </button>
            </div>

            {/* 회원가입 */}
            <div className="flex items-center justify-center gap-2 md:gap-1 mt-4 md:mt-8">
              <span
                className="text-[var(--color-brown-dark)] opacity-40 max-md:text-body-14-m md:text-body-16-m"
                style={{ fontWeight: 500, lineHeight: "140%", letterSpacing: "-0.02em" }}
              >
                계정이 없으신가요?
              </span>
              <Link
                href="/register"
                className="text-[var(--color-link-warm)] max-md:text-body-14-sb md:text-body-16-sb"
                style={{ fontWeight: 600, lineHeight: "140%", letterSpacing: "-0.02em" }}
              >
                회원가입하기
              </Link>
            </div>

          </div>
        </div>

        {/* 우측 — 데스크톱 전용 배너 */}
        <div className="max-md:hidden md:w-[548px] md:shrink-0 relative min-h-[calc(100vh-54px)]">
          <Image
            src={loginBannerHd}
            alt="꼬순박스 배너"
            fill
            className="object-contain object-center"
            priority
          />
        </div>

      </div>
    </form>
  );
}
