"use client";

import { useState } from "react";

/**
 * 비밀번호 재설정 폼의 새 비밀번호·확인 필드 상태를 소유하는 단위 훅.
 */
export function useResetPasswordFields({ emailVerified }: { emailVerified: boolean }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  const passwordsValid =
    emailVerified &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword;

  return {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPw,
    setShowPw,
    showPwConfirm,
    setShowPwConfirm,
    passwordsValid,
  };
}
