"use client";

import { useTransition } from "react";
import { resetPassword } from "@/features/auth/api/authApi";
import { getErrorMessage } from "@/shared/lib/api";
import { useModal, useLoadingOverlay } from "@/shared/ui";
import { usePasswordResetEmailVerification } from "./hooks/usePasswordResetEmailVerification";
import { useResetPasswordFields } from "./hooks/useResetPasswordFields";

/**
 * 비밀번호 재설정 페이지(Section)의 조정자(Coordinator).
 * 단위 훅(emailVerification·passwordFields) 조립 + 단일 isPending 소유 +
 * 비밀번호 재설정 오케스트레이션(검증→resetPassword→로그인 이동)만 담당한다.
 */
export function useForgotPasswordSection() {
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const [isPending, start] = useTransition();

  function showError(msg: string) {
    openAlert({ title: msg });
  }

  const email = usePasswordResetEmailVerification({ start, showError });
  const pw = useResetPasswordFields({ emailVerified: email.emailVerified });

  const canSubmit = pw.passwordsValid && !isPending;

  function handleResetPassword() {
    if (pw.newPassword.length < 8) { showError("비밀번호는 최소 8자 이상이어야 합니다."); return; }
    if (pw.newPassword !== pw.confirmPassword) { showError("비밀번호가 일치하지 않습니다."); return; }
    showLoading("비밀번호를 변경하고 있습니다...");
    start(async () => {
      try {
        await resetPassword({ resetToken: email.resetToken, newPassword: pw.newPassword });
        window.location.href = "/login";
      } catch (err) {
        showError(getErrorMessage(err, "비밀번호 재설정에 실패했습니다."));
      } finally {
        hideLoading();
      }
    });
  }

  return {
    isPending,
    canSubmit,
    email,
    pw,
    handleResetPassword,
  };
}
