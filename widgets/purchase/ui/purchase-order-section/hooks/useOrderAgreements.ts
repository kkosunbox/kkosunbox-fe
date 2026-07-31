"use client";

import { useState } from "react";

/**
 * 약관 동의(이용약관·개인정보) + 접기 패널 상태를 소유하는 단위 훅.
 */
export function useOrderAgreements() {
  const [agreeOpen, setAgreeOpen] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const agreeAll = agreeTerms && agreePrivacy;

  function handleAgreeAll() {
    const next = !agreeAll;
    setAgreeTerms(next);
    setAgreePrivacy(next);
  }
  function toggleAgreePanel() {
    setAgreeOpen((v) => !v);
  }
  function toggleTerms() {
    setAgreeTerms((v) => !v);
  }
  function togglePrivacy() {
    setAgreePrivacy((v) => !v);
  }

  return {
    agreeOpen,
    agreeTerms,
    agreePrivacy,
    agreeAll,
    handleAgreeAll,
    toggleAgreePanel,
    toggleTerms,
    togglePrivacy,
  };
}
