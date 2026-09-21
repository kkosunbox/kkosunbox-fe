"use client";

import { useState } from "react";

/**
 * 약관 동의(이용약관·개인정보·연령 확인) + 접기 패널 상태를 소유하는 단위 훅.
 */
export function useOrderAgreements() {
  const [agreeOpen, setAgreeOpen] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);

  const agreeAll = agreeTerms && agreePrivacy && agreeAge;

  function handleAgreeAll() {
    const next = !agreeAll;
    setAgreeTerms(next);
    setAgreePrivacy(next);
    setAgreeAge(next);
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
  function toggleAge() {
    setAgreeAge((v) => !v);
  }

  return {
    agreeOpen,
    agreeTerms,
    agreePrivacy,
    agreeAge,
    agreeAll,
    handleAgreeAll,
    toggleAgreePanel,
    toggleTerms,
    togglePrivacy,
    toggleAge,
  };
}
