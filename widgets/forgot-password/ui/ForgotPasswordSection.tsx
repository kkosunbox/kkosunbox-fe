"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  sendPasswordResetCode,
  verifyPasswordResetCode,
  resetPassword,
} from "@/features/auth/api/authApi";
import { getErrorMessage } from "@/shared/lib/api";
import { useModal, useLoadingOverlay } from "@/shared/ui";
import registerPaw from "@/widgets/register/assets/register-pow.png";
import forgotPasswordTitle from "../assets/forgot-password-title.png";

/* ─── 상수 ─── */
const RESEND_COOLDOWN = 60;

/* ─── 공통 스타일 ─── */
const inputBase =
  "h-[32px] w-full md:w-[220px] rounded-[4px] bg-white px-3 text-[13px] font-medium leading-[140%] text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none focus:ring-1 focus:ring-[var(--color-accent)] transition-opacity";

const inputDisabled = "opacity-50 pointer-events-none bg-[var(--color-surface-light)]";

const actionBtnCls =
  "h-[32px] shrink-0 rounded-[4px] px-2 text-[13px] font-medium text-white whitespace-nowrap transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50";

/* ─── 눈 아이콘 ─── */
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

/* ─── 필드 행 래퍼 (라벨 + 입력) ─── */
function FieldRow({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex max-md:flex-col md:flex-row md:items-start gap-2 md:gap-0">
      <label
        htmlFor={htmlFor}
        className="shrink-0 md:w-[94px] md:h-[32px] md:flex md:items-center text-[13px] font-medium leading-[16px] text-[var(--color-text)]"
      >
        {label}
      </label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function ForgotPasswordSection() {
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();

  /* ── 상태 ── */
  const [isPending, start] = useTransition();

  /* ── 이메일 ── */
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  /* ── OTP ── */
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── 비밀번호 ── */
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  /* ── 파생 상태 ── */
  const emailVerified = !!resetToken;
  const canSubmit =
    emailVerified &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    !isPending;

  /* ── 타이머 정리 ── */
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  /* ── 카운트다운 시작 ── */
  function startCountdown() {
    setCountdown(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  /** 에러를 알림 모달로 표시 */
  function showError(msg: string) {
    openAlert({ title: msg });
  }

  /* ── 인증코드 발송 ── */
  function handleSendCode() {
    if (!email.trim()) { showError("이메일을 입력해주세요."); return; }
    start(async () => {
      try {
        await sendPasswordResetCode({ email: email.trim() });
        startCountdown();
        setCodeSent(true);
      } catch (err) {
        showError(getErrorMessage(err, "인증코드 발송 중 오류가 발생했습니다."));
      }
    });
  }

  /* ── OTP 확인 ── */
  function handleVerifyOtp() {
    if (!otp.trim()) { showError("인증코드를 입력해주세요."); return; }
    start(async () => {
      try {
        const res = await verifyPasswordResetCode({ email: email.trim(), otp: otp.trim() });
        setResetToken(res.resetToken);
      } catch (err) {
        showError(getErrorMessage(err, "인증 확인 중 오류가 발생했습니다."));
      }
    });
  }

  /* ── 비밀번호 변경 ── */
  function handleResetPassword() {
    if (newPassword.length < 8) { showError("비밀번호는 최소 8자 이상이어야 합니다."); return; }
    if (newPassword !== confirmPassword) { showError("비밀번호가 일치하지 않습니다."); return; }
    showLoading("비밀번호를 변경하고 있습니다...");
    start(async () => {
      try {
        await resetPassword({ resetToken, newPassword });
        window.location.href = "/login";
      } catch (err) {
        showError(getErrorMessage(err, "비밀번호 재설정에 실패했습니다."));
      } finally {
        hideLoading();
      }
    });
  }

  /* ── 렌더 ── */
  return (
    <div className="min-h-screen bg-white pt-[54px]">
      <div className="mx-auto max-w-[874px] px-5 py-10 md:px-6 md:py-12">

        {/* 타이틀 */}
        <div className="mb-7 text-center md:mb-11">
          <h1>
            <Image
              src={forgotPasswordTitle}
              alt="비밀번호 변경하기"
              className="mx-auto w-auto max-w-[194px] md:max-w-[222px]"
              priority
            />
          </h1>
          <p
            className="mt-3 md:mt-4 max-md:text-body-13-r md:text-body-16-r text-[var(--color-text)]"
            style={{ fontFamily: "Griun PolFairness", letterSpacing: "-0.02em" }}
          >
            비밀번호 변경을 위해 이메일 인증을 완료해주세요.
          </p>
        </div>

        {/* ─── 폼 카드 ─── */}
        <div
          className="relative overflow-hidden rounded-[20px] px-5 py-6 md:mx-auto md:w-full md:max-w-[874px] md:min-h-[524px] md:py-11"
          style={{ background: "var(--color-surface-warm)" }}
        >
          <div className="flex flex-col gap-4 md:mx-auto md:w-[414px]">

            {/* ── 이메일 ── */}
            <FieldRow label="이메일" htmlFor="fp-email">
              <div className="flex gap-2">
                <input
                  id="fp-email"
                  type="email"
                  placeholder="이메일을 입력해주세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !emailVerified && handleSendCode()}
                  readOnly={emailVerified}
                  className={[inputBase, emailVerified ? inputDisabled : ""].join(" ")}
                  autoComplete="email"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={!email.trim() || isPending || emailVerified || (codeSent && countdown > 0)}
                  className={[actionBtnCls, "bg-[var(--color-accent)]"].join(" ")}
                >
                  {isPending && !codeSent
                    ? "발송 중..."
                    : codeSent
                      ? countdown > 0 ? `재전송 (${countdown}s)` : "재전송"
                      : "인증번호 전송"}
                </button>
              </div>
              {codeSent && !emailVerified && (
                <p className="mt-1.5 text-caption-12-r text-[var(--color-text-secondary)]">
                  <span className="font-semibold text-[var(--color-text)]">{email}</span>으로 인증코드를 발송했습니다.
                </p>
              )}
            </FieldRow>

            {/* ── 인증번호 ── */}
            <FieldRow label="인증번호" htmlFor="fp-otp">
              <div className="flex gap-2">
                <input
                  id="fp-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  placeholder="인증번호를 입력해주세요"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && codeSent && !emailVerified && handleVerifyOtp()}
                  disabled={!codeSent || emailVerified}
                  className={[inputBase, (!codeSent || emailVerified) ? inputDisabled : ""].join(" ")}
                  autoComplete="one-time-code"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={!otp.trim() || isPending || !codeSent || emailVerified}
                  className={[actionBtnCls, "bg-[var(--color-accent)]"].join(" ")}
                >
                  {isPending && codeSent && !emailVerified ? "확인 중..." : "확인"}
                </button>
              </div>
              {emailVerified && (
                <p className="mt-1.5 text-caption-12-r text-[var(--color-accent)]">
                  이메일 인증이 완료되었습니다.
                </p>
              )}
            </FieldRow>

            {/* ── 새비밀번호 ── */}
            <FieldRow label="새비밀번호" htmlFor="fp-pw">
              <div className="relative">
                <input
                  id="fp-pw"
                  type={showPw ? "text" : "password"}
                  placeholder="비밀번호를 입력해주세요"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={!emailVerified}
                  className={[inputBase, "pr-10", !emailVerified ? inputDisabled : ""].join(" ")}
                  autoComplete="new-password"
                />
                {emailVerified && (
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80"
                  >
                    {showPw ? <EyeIcon className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
                  </button>
                )}
              </div>
            </FieldRow>

            {/* ── 비밀번호 확인 ── */}
            <FieldRow label="비밀번호 확인" htmlFor="fp-pw-confirm">
              <div className="relative">
                <input
                  id="fp-pw-confirm"
                  type={showPwConfirm ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력해주세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!emailVerified}
                  className={[inputBase, "pr-10", !emailVerified ? inputDisabled : ""].join(" ")}
                  autoComplete="new-password"
                />
                {emailVerified && (
                  <button
                    type="button"
                    onClick={() => setShowPwConfirm((v) => !v)}
                    aria-label={showPwConfirm ? "비밀번호 숨기기" : "비밀번호 보기"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-80"
                  >
                    {showPwConfirm ? <EyeIcon className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
                  </button>
                )}
              </div>
            </FieldRow>

            {/* 비밀번호 힌트 */}
            <div className="md:pl-[94px] text-[12px] font-medium leading-[16px] text-[var(--color-text-secondary)]">
              <p>* 비밀번호는 최소 8자 이상이어야 합니다.</p>
              <p>* 대문자, 소문자, 숫자, 특수문자를 모두 포함하여 입력해 주세요.</p>
            </div>
          </div>

          {/* 발바닥 장식 — 카드 기준 배치 */}
          <Image
            src={registerPaw}
            alt=""
            aria-hidden="true"
            className="absolute right-4 bottom-4 md:right-10 md:bottom-6 w-[60px] h-[50px] md:w-[84px] md:h-[70px] opacity-60"
            style={{ transform: "rotate(-24.12deg)" }}
          />
        </div>

        {/* ─── CTA 버튼 ─── */}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleResetPassword}
          className="mt-10 mx-auto flex h-[48px] w-full md:max-w-[412px] items-center justify-center rounded-full max-md:text-subtitle-16-sb md:text-subtitle-18-sb text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-40 md:mt-14 md:h-[54px]"
          style={{ background: "var(--color-accent)" }}
        >
          {isPending ? "처리 중..." : "확인"}
        </button>

      </div>
    </div>
  );
}
