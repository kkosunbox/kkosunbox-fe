"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signupAction } from "@/features/auth/lib/actions";
import { tokenStore } from "@/shared/lib/api/token";
import { trackSignUp } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth";
import { useModal, useLoadingOverlay } from "@/shared/ui";
import { meetsMinPasswordLength, meetsPasswordComplexity } from "./validators";
import { useEmailVerification } from "./hooks/useEmailVerification";
import { usePasswordFields } from "./hooks/usePasswordFields";
import { useAgreements } from "./hooks/useAgreements";

/**
 * 회원가입 페이지(Section)의 조정자(Coordinator).
 * 단위 훅(emailVerification·passwordFields·agreements) 조립 + 단일 isPending 소유 +
 * 회원가입 오케스트레이션(검증→signupAction→토큰 저장→라우팅)만 담당한다.
 */
export function useRegisterSection() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { login: authLogin } = useAuth();
  const { openAlert } = useModal();
  const { showLoading, hideLoading } = useLoadingOverlay();

  /* 단일 isPending — 인증코드 발송·OTP 확인·회원가입 버튼 라벨을 모두 제어 */
  const [isPending, start] = useTransition();

  /** 에러를 알림 모달로 표시 */
  function showError(msg: string) {
    openAlert({ title: msg });
  }

  const email = useEmailVerification({ start, showError });
  const pw = usePasswordFields({ emailVerified: email.emailVerified });
  const agree = useAgreements();

  const canSubmit =
    email.emailVerified &&
    pw.passwordValid &&
    pw.passwordsMatch &&
    agree.agreements.terms &&
    agree.agreements.privacy &&
    !isPending;

  /* ── 회원가입 ── */
  function handleSignup() {
    if (!agree.agreements.terms) { showError("서비스 이용약관에 동의해주세요."); return; }
    if (!agree.agreements.privacy) { showError("개인정보처리방침에 동의해주세요."); return; }
    if (!meetsMinPasswordLength(pw.password)) { showError("비밀번호는 최소 8자 이상이어야 합니다."); return; }
    if (!meetsPasswordComplexity(pw.password)) {
      showError("영문자, 숫자, 특수문자를 포함하여 입력해 주세요.");
      return;
    }
    if (pw.password !== pw.passwordConfirm) { showError("비밀번호가 일치하지 않습니다."); return; }
    showLoading("회원가입을 처리하고 있습니다...");
    start(async () => {
      try {
        const result = await signupAction(
          email.emailVerifiedToken,
          pw.password,
          agree.agreements.terms,
          agree.agreements.privacy,
          agree.agreements.marketing,
        );
        if (result.error) { showError(result.error); return; }

        trackSignUp();
        if (result.accessToken && result.refreshToken)
          tokenStore.setTokens(result.accessToken, result.refreshToken);

        router.refresh();
        router.push("/");
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
    agree,
    handleSignup,
  };
}
