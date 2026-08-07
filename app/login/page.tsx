"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, getOAuthUrl, setOAuthReturnPath } from "@/features/auth";
import type { OAuthProvider } from "@/features/auth";
import {
  AuthDesktopShell,
  AuthMobileShell,
  SocialLoginButtons,
  authLabelCls,
  authUnderlineInputCls,
  authCtaButtonCls,
  authMobileCtaButtonCls,
} from "@/features/auth";
import PasswordToggleIcon from "@/shared/ui/PasswordToggleIcon";
import { useLoadingOverlay } from "@/shared/ui";

const LAST_LOGIN_KEY = "ggosoonbox_last_login";
type LastLoginMethod = "email" | OAuthProvider;

/** 이메일 형식 검증 (local@domain.tld). 형식이 충족되면 최소 길이(5자)는 자연히 보장된다. */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LastLoginBadge() {
  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2.5 -translate-x-1/2">
      <div
        className="animate-last-login-badge relative whitespace-nowrap rounded-full bg-black/75 px-3 py-[5px] text-white"
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

function LoginFormFields({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  emailId,
  passwordId,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean | ((prev: boolean) => boolean)) => void;
  emailId: string;
  passwordId: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor={emailId} className={authLabelCls}>이메일</label>
        <input
          id={emailId}
          type="text"
          placeholder="이메일을 입력하세요"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={authUnderlineInputCls}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={passwordId} className={authLabelCls}>비밀번호</label>
        <div className="relative">
          <input
            id={passwordId}
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
  const isFormValid = EMAIL_REGEX.test(email.trim()) && password.length >= 3;
  const formLoginInProgressRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(LAST_LOGIN_KEY) as LastLoginMethod | null;
    setLastLoginMethod(saved);
  }, []);

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
      className="relative flex flex-col max-lg:min-h-svh max-lg:overflow-hidden max-lg:bg-[var(--color-login-top)] lg:min-h-screen lg:bg-white"
    >
      {/* ══════════════════ 모바일·태블릿(<lg) ══════════════════ */}
      <AuthMobileShell active="login">
        <LoginFormFields
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          emailId="login-email-mobile"
          passwordId="login-password-mobile"
        />

        {error && (
          <p className="mt-3 text-center text-body-13-m" style={{ color: "var(--color-accent-rust)" }}>
            {error}
          </p>
        )}

        <div className="mt-[15px] text-right">
          <Link
            href="/forgot-password"
            className="text-[var(--color-accent)] underline text-body-14-m"
            style={{ fontWeight: 500, lineHeight: "140%", letterSpacing: "-0.02em" }}
          >
            비밀번호를 잃어버리셨나요?
          </Link>
        </div>

        <div className="relative mt-[52px]">
          {lastLoginMethod === "email" && <LastLoginBadge />}
          <button
            type="submit"
            disabled={!isFormValid || isPending}
            className={authMobileCtaButtonCls}
          >
            {isPending ? "로그인 중..." : "로그인"}
          </button>
        </div>

        <p
          className="mt-[18px] text-center text-body-14-m text-[var(--color-text-secondary)]"
          style={{ fontWeight: 500, letterSpacing: "0.2px", lineHeight: "140%" }}
        >
          - 간편로그인 -
        </p>

        <div className="mt-7">
          <SocialLoginButtons
            onSelect={handleSocialLogin}
            lastLoginMethod={lastLoginMethod}
            renderBadge={() => <LastLoginBadge />}
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <span
            className="text-body-14-m text-[var(--color-auth-hint)] opacity-40"
            style={{ fontWeight: 500, lineHeight: "140%", letterSpacing: "-0.02em" }}
          >
            계정이 없으신가요?
          </span>
          <Link
            href="/register"
            className="text-body-14-sb text-[var(--color-link-warm)]"
            style={{ fontWeight: 600, lineHeight: "140%", letterSpacing: "-0.02em" }}
          >
            회원가입하기
          </Link>
        </div>
      </AuthMobileShell>

      {/* ══════════════════ 데스크톱(lg+) ══════════════════ */}
      <AuthDesktopShell
        active="login"
        headingTop="우리 아이를 위한 건강한 간식,"
        headingBottom="꼬순박스에 오신 걸 환영해요"
        contentGapPx={52}
      >
        <LoginFormFields
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          emailId="login-email"
          passwordId="login-password"
        />

        {error && (
          <p className="mt-3 text-center text-body-13-m" style={{ color: "var(--color-accent-rust)" }}>
            {error}
          </p>
        )}

        <div className="mt-[15px] text-right">
          <Link
            href="/forgot-password"
            className="text-[var(--color-accent)] underline text-body-14-m"
            style={{ fontWeight: 500, lineHeight: "140%", letterSpacing: "-0.02em" }}
          >
            비밀번호를 잃어버리셨나요?
          </Link>
        </div>

        <div className="relative mt-[52px]">
          {lastLoginMethod === "email" && <LastLoginBadge />}
          <button type="submit" disabled={!isFormValid || isPending} className={authCtaButtonCls}>
            {isPending ? "로그인 중..." : "로그인"}
          </button>
        </div>

        <p
          className="mt-6 text-center text-body-14-m text-[var(--color-text-secondary)]"
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

        <div className="mt-6 flex items-center justify-center gap-2">
          <span
            className="text-body-14-m text-[var(--color-auth-hint)] opacity-40"
            style={{ fontWeight: 500, lineHeight: "140%", letterSpacing: "-0.02em" }}
          >
            계정이 없으신가요?
          </span>
          <Link
            href="/register"
            className="text-body-14-sb text-[var(--color-link-warm)]"
            style={{ fontWeight: 600, lineHeight: "140%", letterSpacing: "-0.02em" }}
          >
            회원가입하기
          </Link>
        </div>
      </AuthDesktopShell>
    </form>
  );
}
