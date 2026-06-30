"use client";

import { useEffect, useRef, useState, type TransitionStartFunction } from "react";
import {
  sendPasswordResetCode,
  verifyPasswordResetCode,
} from "@/features/auth/api/authApi";
import { getErrorMessage } from "@/shared/lib/api";
import { RESEND_COOLDOWN } from "@/widgets/register/ui/register-section/constants";

/**
 * 비밀번호 재설정 이메일 인증 흐름(발송·재전송·OTP 확인·카운트다운)을 소유하는 단위 훅.
 * isPending(useTransition)은 Coordinator가 단일 소유하므로 `start`를 주입받는다.
 */
export function usePasswordResetEmailVerification({
  start,
  showError,
}: {
  start: TransitionStartFunction;
  showError: (msg: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [resetToken, setResetToken] = useState("");
  const emailVerified = !!resetToken;

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

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

  return {
    email,
    setEmail,
    codeSent,
    otp,
    setOtp,
    countdown,
    resetToken,
    emailVerified,
    handleSendCode,
    handleVerifyOtp,
  };
}
