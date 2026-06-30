"use client";

import { useEffect, useRef, useState, type TransitionStartFunction } from "react";
import {
  sendSignupEmailVerification,
  resendEmailVerification,
  verifyEmail,
} from "@/features/auth/api/authApi";
import { getErrorMessage, isErrorCode } from "@/shared/lib/api";
import { RESEND_COOLDOWN } from "../constants";

/**
 * 이메일 인증 흐름(발송·재전송·OTP 확인·재전송 카운트다운)을 소유하는 단위 훅.
 * isPending(useTransition)은 Coordinator가 단일 소유하므로 `start`를 주입받는다.
 */
export function useEmailVerification({
  start,
  showError,
}: {
  start: TransitionStartFunction;
  showError: (msg: string) => void;
}) {
  /* ── 이메일 ── */
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  /* ── OTP ── */
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── 인증 토큰 ── */
  const [emailVerifiedToken, setEmailVerifiedToken] = useState("");
  const emailVerified = !!emailVerifiedToken;

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

  /* ── 인증코드 발송 ── */
  function handleSendCode() {
    if (!email.trim()) { showError("이메일을 입력해주세요."); return; }
    start(async () => {
      try {
        if (codeSent) {
          await resendEmailVerification({ email: email.trim() });
        } else {
          await sendSignupEmailVerification({ email: email.trim() });
        }
        startCountdown();
        setCodeSent(true);
      } catch (err) {
        if (isErrorCode(err, "COOLDOWN_PERIOD_NOT_EXPIRED")) {
          startCountdown();
        }
        if (isErrorCode(err, "DAILY_LIMIT_REACHED")) {
          setDailyLimitReached(true);
        }
        showError(getErrorMessage(err, "인증코드 발송 중 오류가 발생했습니다."));
      }
    });
  }

  /* ── OTP 확인 ── */
  function handleVerifyOtp() {
    if (!otp.trim()) { showError("인증코드를 입력해주세요."); return; }
    start(async () => {
      try {
        const res = await verifyEmail({ email: email.trim(), otp: otp.trim() });
        setEmailVerifiedToken(res.emailVerifiedToken);
      } catch (err) {
        showError(getErrorMessage(err, "인증 확인 중 오류가 발생했습니다."));
      }
    });
  }

  return {
    email,
    setEmail,
    codeSent,
    otp,
    setOtp,
    countdown,
    dailyLimitReached,
    emailVerifiedToken,
    emailVerified,
    handleSendCode,
    handleVerifyOtp,
  };
}
