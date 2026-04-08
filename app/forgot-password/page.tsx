"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  resetPassword,
  sendPasswordResetCode,
  verifyPasswordResetCode,
} from "@/features/auth/api";
import { ApiError } from "@/shared/lib/api/types";

type Step = "email" | "code" | "password";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError("이메일을 입력해 주세요.");
      return;
    }
    startTransition(async () => {
      try {
        await sendPasswordResetCode({ email: trimmed });
        setEmail(trimmed);
        setStep("code");
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "인증코드 발송에 실패했습니다.");
      }
    });
  }

  function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const code = otp.trim();
    if (!code) {
      setError("인증코드를 입력해 주세요.");
      return;
    }
    startTransition(async () => {
      try {
        const res = await verifyPasswordResetCode({ email: email.trim(), otp: code });
        setResetToken(res.resetToken);
        setStep("password");
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "인증코드 확인에 실패했습니다.");
      }
    });
  }

  function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!resetToken) {
      setError("인증을 다시 진행해 주세요.");
      setStep("email");
      return;
    }
    if (newPassword.length < 8) {
      setError("비밀번호는 8자 이상으로 설정해 주세요.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    startTransition(async () => {
      try {
        await resetPassword({ resetToken, newPassword });
        window.location.href = "/login";
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "비밀번호 재설정에 실패했습니다.");
      }
    });
  }

  const inputCls =
    "w-full rounded-full bg-[var(--color-surface-light)] outline-none text-[var(--color-text)] h-[52px] px-6 text-body-16-m md:h-[54px] placeholder:text-[var(--color-text-secondary)]";

  return (
    <div className="min-h-screen bg-white flex flex-col md:pt-[54px]">
      <div className="flex flex-1 flex-col md:mx-auto md:w-full md:max-w-[var(--max-width-content)] md:items-center md:justify-center md:min-h-[calc(100vh-54px)]">
        <div className="w-full max-w-[400px] px-6 py-10 md:py-0">
          <h1 className="text-center text-title-24-sb text-[var(--color-text)]">비밀번호 찾기</h1>
          <p className="mt-2 text-center text-body-14-m text-[var(--color-text-secondary)]">
            가입하신 이메일로 인증코드를 보내 드립니다.
          </p>

          {error && (
            <p className="mt-4 text-center text-body-13-m" style={{ color: "var(--color-accent-rust)" }}>
              {error}
            </p>
          )}

          {step === "email" && (
            <form onSubmit={handleSendCode} className="mt-8 flex flex-col gap-4">
              <input
                type="email"
                autoComplete="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
              <button
                type="submit"
                disabled={isPending}
                className="mt-2 h-[54px] w-full rounded-full bg-[var(--color-accent)] text-subtitle-16-sb text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isPending ? "발송 중…" : "인증코드 받기"}
              </button>
            </form>
          )}

          {step === "code" && (
            <form onSubmit={handleVerifyCode} className="mt-8 flex flex-col gap-4">
              <p className="text-body-13-m text-[var(--color-text-secondary)]">
                <span className="text-[var(--color-text)]">{email}</span> 로 발송된 코드를 입력해 주세요.
              </p>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="인증코드 6자리"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={inputCls}
              />
              <button
                type="submit"
                disabled={isPending}
                className="mt-2 h-[54px] w-full rounded-full bg-[var(--color-accent)] text-subtitle-16-sb text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isPending ? "확인 중…" : "확인"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError(null);
                }}
                className="text-body-14-m text-[var(--color-text-secondary)] underline underline-offset-2"
              >
                이메일 다시 입력
              </button>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handleResetPassword} className="mt-8 flex flex-col gap-4">
              <input
                type="password"
                autoComplete="new-password"
                placeholder="새 비밀번호 (8자 이상)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputCls}
              />
              <input
                type="password"
                autoComplete="new-password"
                placeholder="새 비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputCls}
              />
              <button
                type="submit"
                disabled={isPending}
                className="mt-2 h-[54px] w-full rounded-full bg-[var(--color-accent)] text-subtitle-16-sb text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isPending ? "변경 중…" : "비밀번호 변경"}
              </button>
            </form>
          )}

          <p className="mt-8 text-center">
            <Link
              href="/login"
              className="text-body-14-m text-[var(--color-accent)] underline underline-offset-2"
            >
              로그인으로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
