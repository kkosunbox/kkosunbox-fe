"use client";

import { useState } from "react";
import { meetsMinPasswordLength, meetsPasswordComplexity } from "../validators";

/**
 * 비밀번호·비밀번호 확인 필드 상태와 규칙 검증을 소유하는 단위 훅.
 * 규칙/불일치 오류는 포커스를 벗어난 뒤에만 노출(입력 중에는 숨김)한다.
 */
export function usePasswordFields({ emailVerified }: { emailVerified: boolean }) {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  /** 포커스를 벗어난 뒤에만 규칙/불일치 오류 표시 (입력 중에는 숨김) */
  const [showPasswordRuleErrors, setShowPasswordRuleErrors] = useState(false);
  const [showPasswordMismatch, setShowPasswordMismatch] = useState(false);

  /* ── 파생 상태 ── */
  const passwordRulesActive = emailVerified && password.length > 0;
  const ruleMinLenInvalid =
    passwordRulesActive && !meetsMinPasswordLength(password) && showPasswordRuleErrors;
  const ruleComplexityInvalid =
    passwordRulesActive && !meetsPasswordComplexity(password) && showPasswordRuleErrors;
  const passwordMismatch =
    emailVerified &&
    passwordConfirm.length > 0 &&
    password !== passwordConfirm &&
    showPasswordMismatch;
  const passwordValid =
    meetsMinPasswordLength(password) && meetsPasswordComplexity(password);
  const passwordsMatch = password === passwordConfirm;
  /** 라벨 옆 한 줄 경고용 — 길이 미달이 복잡도 미달보다 우선(둘 다 위반이면 길이만 의미 있음) */
  const passwordRuleMessage = ruleMinLenInvalid
    ? "* 비밀번호는 최소 8자 이상이어야 합니다."
    : ruleComplexityInvalid
      ? "* 영문자, 숫자, 특수문자를 포함하여 입력해 주세요."
      : null;

  /* ── 포커스/블러 핸들러 ── */
  function onPasswordFocus() {
    setShowPasswordRuleErrors(false);
    setShowPasswordMismatch(false);
  }
  function onPasswordBlur() {
    setShowPasswordRuleErrors(true);
  }
  function onConfirmFocus() {
    setShowPasswordMismatch(false);
  }
  function onConfirmBlur() {
    setShowPasswordMismatch(true);
  }

  return {
    password,
    setPassword,
    passwordConfirm,
    setPasswordConfirm,
    showPw,
    setShowPw,
    showPwConfirm,
    setShowPwConfirm,
    ruleMinLenInvalid,
    ruleComplexityInvalid,
    passwordRuleMessage,
    passwordMismatch,
    passwordValid,
    passwordsMatch,
    onPasswordFocus,
    onPasswordBlur,
    onConfirmFocus,
    onConfirmBlur,
  };
}
