"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import logoMain2x from "@/shared/assets/logo-main@2x.webp";
import loginMobileDeco from "@/shared/assets/login-mobile-upper-deco.webp";
import { HIGH_IMAGE_QUALITY } from "@/shared/config/imageQuality";
import { useAuth, getOAuthUrl, setOAuthReturnPath } from "@/features/auth";
import type { OAuthProvider } from "@/features/auth";
import {
  AuthDesktopShell,
  SocialLoginButtons,
  authLabelCls,
  authUnderlineInputCls,
  authCtaButtonCls,
} from "@/features/auth";
import PasswordToggleIcon from "@/shared/ui/PasswordToggleIcon";
import { useLoadingOverlay } from "@/shared/ui";

const LAST_LOGIN_KEY = "ggosoonbox_last_login";
type LastLoginMethod = "email" | OAuthProvider;

/** 이메일 형식 검증 (local@domain.tld). 형식이 충족되면 최소 길이(5자)는 자연히 보장된다. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LOGO_WIDTH = 156;
const LOGO_HEIGHT = Math.round((136 * LOGO_WIDTH) / 414);

function LastLoginBadge() {
  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2.5 -translate-x-1/2">
      <div
        className="relative whitespace-nowrap rounded-full bg-black/75 px-3 py-[5px] text-white"
        style={{ fontSize: 11, fontWeight: 500, lineHeight: "16px", letterSpacing: "-0.01em" }}
      >
        최근에 로그인했어요
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "calc(100% - 1px)",
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "6px solid rgba(0,0,0,0.75)",
          }}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [lastLoginMethod, setLastLoginMethod] = useState<LastLoginMethod | null>(null);

  const { isLoggedIn, login } = useAuth();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const router = useRouter();
  const searchParams = useSearchParams();
  // 로그인 버튼 활성화 조건: 이메일 형식 유효 + 비밀번호 3글자 이상
  const isFormValid = EMAIL_REGEX.test(email.trim()) && password.length >= 3;
  // 폼 제출로 로그인이 진행 중이면 true. login() 콜백이 직접 navigate하므로
  // isLoggedIn useEffect의 redirect가 그것을 덮어쓰지 않도록 막는다.
  const formLoginInProgressRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(LAST_LOGIN_KEY) as LastLoginMethod | null;
    setLastLoginMethod(saved);
  }, []);

  // 이미 로그인된 상태(SSR 초기값 또는 클라이언트 세션 복구 완료)면 원래 가려던 곳으로 이동.
  // next가 없을 때만 홈으로 보낸다 — 보호 라우트에서 튕겨온 경우(`/login?next=/mypage`)까지
  // 홈으로 보내면 사용자가 목적지에 영영 도달하지 못한다.
  useEffect(() => {
    if (!isLoggedIn || formLoginInProgressRef.current) return;
    const next = searchParams.get("next");
    router.replace(next?.startsWith("/") ? next : "/");
  }, [isLoggedIn, router, searchParams]);

  function handleSocialLogin(provider: OAuthProvider) {
    const next = searchParams.get("next");
    if (next?.startsWith("/")) {
      setOAuthReturnPath(next);
    }
    localStorage.setItem(LAST_LOGIN_KEY, provider);
    const url = getOAuthUrl(provider);
    if (url) window.location.href = url;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid || isPending) return;
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
        } else {
          localStorage.setItem(LAST_LOGIN_KEY, "email");
        }
      } finally {
        hideLoading();
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex flex-col max-lg:h-svh max-lg:overflow-hidden max-lg:bg-[var(--color-login-top)] max-lg:pt-[30px] lg:min-h-screen lg:bg-white"
    >

      {/* ══════════════════ 모바일·태블릿(<lg) ══════════════════ */}
      <div className="max-lg:flex flex-1 flex-col lg:hidden">
        {/* 그라데이션 배경 + 장식 레이어 */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              top: 0,
              width: "max(423px, calc(100% + 48px))",
              bottom: 0,
              background: "var(--gradient-login-bg)",
              borderRadius: "0 0 24px 24px",
            }}
          />
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top: "2%", width: 423, height: 250 }}>
            <Image
              src={loginMobileDeco}
              alt=""
              fill
              quality={HIGH_IMAGE_QUALITY}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="relative flex flex-1 flex-col items-center min-h-0 overflow-y-auto px-8">
          <div className="w-full max-w-[400px] mx-auto my-auto py-[40px]">

            {/* 로고 */}
            <div className="flex items-center justify-center pb-[40px]">
              <Image src={logoMain2x} alt="꼬순박스" width={LOGO_WIDTH} height={LOGO_HEIGHT} quality={HIGH_IMAGE_QUALITY} className="h-auto relative" priority />
            </div>

            {/* 아이디 입력 */}
            <input
              type="text"
              placeholder="이메일을 입력하세요"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[12px] bg-white px-6 h-[48px] text-[14px] font-medium text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]"
            />

            {/* 비밀번호 입력 */}
            <div className="relative mt-[24px]">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[12px] bg-white px-6 pr-12 h-[48px] text-[14px] font-medium text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-secondary)]"
              />
              <button
                type="button"
                className="absolute right-5 top-1/2 -translate-y-1/2 opacity-80"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                <PasswordToggleIcon visible={showPassword} className="w-4 h-4" />
              </button>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p className="mt-3 text-center text-body-13-m" style={{ color: "var(--color-accent-rust)" }}>
                {error}
              </p>
            )}

            {/* 비밀번호 찾기 */}
            <div className="mt-[24px] text-right">
              <Link
                href="/forgot-password"
                className="text-[var(--color-accent)] underline text-[13px]"
                style={{ fontWeight: 500, lineHeight: "140%", letterSpacing: "-0.02em" }}
              >
                비밀번호를 잃어버리셨나요?
              </Link>
            </div>

            {/* 로그인 버튼 */}
            <div className="relative mt-[40px]">
              {lastLoginMethod === "email" && <LastLoginBadge />}
              <button
                type="submit"
                disabled={!isFormValid || isPending}
                className="w-full h-[48px] rounded-[12px] bg-[var(--color-btn-dark-warm)] text-white text-[14px] font-semibold tracking-[-0.04em] transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "로그인 중..." : "로그인"}
              </button>
            </div>

            {/* 간편로그인 */}
            <p
              className="text-center text-[var(--color-text-secondary)] text-body-14-m mt-[18px]"
              style={{ fontWeight: 500, letterSpacing: "0.2px", lineHeight: "140%" }}
            >
              - 간편로그인 -
            </p>

            {/* 소셜 버튼 */}
            <div className="mt-7">
              <SocialLoginButtons
                onSelect={handleSocialLogin}
                lastLoginMethod={lastLoginMethod}
                renderBadge={() => <LastLoginBadge />}
              />
            </div>

            {/* 회원가입 */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <span
                className="text-[var(--color-brown-dark)] opacity-40 text-body-14-m"
                style={{ fontWeight: 500, lineHeight: "140%", letterSpacing: "-0.02em" }}
              >
                계정이 없으신가요?
              </span>
              <Link
                href="/register"
                className="text-[var(--color-link-warm)] text-body-14-sb"
                style={{ fontWeight: 600, lineHeight: "140%", letterSpacing: "-0.02em" }}
              >
                회원가입하기
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ══════════════════ 데스크톱(lg+) ══════════════════ */}
      <AuthDesktopShell
        active="login"
        headingTop="우리 아이를 위한 건강한 간식,"
        headingBottom="꼬순박스에 오신 걸 환영해요"
        contentGapPx={52}
      >
        <div className="flex flex-col gap-6">
          {/* 이메일 */}
          <div className="flex flex-col gap-2">
            <label htmlFor="login-email" className={authLabelCls}>이메일</label>
            <input
              id="login-email"
              type="text"
              placeholder="이메일을 입력하세요"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authUnderlineInputCls}
            />
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-2">
            <label htmlFor="login-password" className={authLabelCls}>비밀번호</label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={[authUnderlineInputCls, "pr-8"].join(" ")}
              />
              <button
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2 opacity-80"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                <PasswordToggleIcon visible={showPassword} className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <p className="mt-3 text-center text-body-13-m" style={{ color: "var(--color-accent-rust)" }}>
            {error}
          </p>
        )}

        {/* 비밀번호 찾기 */}
        <div className="mt-[15px] text-right">
          <Link
            href="/forgot-password"
            className="text-[var(--color-accent)] underline text-body-14-m"
            style={{ fontWeight: 500, lineHeight: "140%", letterSpacing: "-0.02em" }}
          >
            비밀번호를 잃어버리셨나요?
          </Link>
        </div>

        {/* 로그인 버튼 */}
        <div className="relative mt-[52px]">
          {lastLoginMethod === "email" && <LastLoginBadge />}
          <button type="submit" disabled={!isFormValid || isPending} className={authCtaButtonCls}>
            {isPending ? "로그인 중..." : "로그인"}
          </button>
        </div>

        {/* 간편로그인 */}
        <p
          className="text-center text-[var(--color-text-secondary)] text-body-14-m mt-6"
          style={{ fontWeight: 500, letterSpacing: "0.2px", lineHeight: "140%" }}
        >
          - 간편로그인 -
        </p>

        <div className="mt-6">
          <SocialLoginButtons
            onSelect={handleSocialLogin}
            lastLoginMethod={lastLoginMethod}
            renderBadge={() => <LastLoginBadge />}
          />
        </div>

        {/* 회원가입 */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <span
            className="text-[var(--color-auth-hint)] opacity-40 text-body-14-m"
            style={{ fontWeight: 500, lineHeight: "140%", letterSpacing: "-0.02em" }}
          >
            계정이 없으신가요?
          </span>
          <Link
            href="/register"
            className="text-[var(--color-link-warm)] text-body-14-sb"
            style={{ fontWeight: 600, lineHeight: "140%", letterSpacing: "-0.02em" }}
          >
            회원가입하기
          </Link>
        </div>
      </AuthDesktopShell>
    </form>
  );
}
