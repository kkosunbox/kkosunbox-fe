"use client";

import { useState } from "react";
import { AGREEMENTS, type Agreements, type AgreementKey } from "../constants";

/**
 * 약관 동의 상태(전체/개별·접기·약관 보기 모달)를 소유하는 단위 훅.
 */
export function useAgreements() {
  const [agreements, setAgreements] = useState<Agreements>({
    terms: false,
    privacy: false,
    marketing: false,
  });
  const [agreementsOpen, setAgreementsOpen] = useState(true);
  const [termsModal, setTermsModal] = useState<AgreementKey | null>(null);

  /* ── 전체 동의 ── */
  const allChecked = AGREEMENTS.every(({ key }) => agreements[key]);

  function toggleAll() {
    const next = !allChecked;
    setAgreements({ terms: next, privacy: next, marketing: next });
  }
  function toggleOne(key: AgreementKey) {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  }
  /** 약관 보기 모달에서 끝까지 확인 시 해당 약관 동의 처리 */
  function acceptTerm(key: AgreementKey) {
    setAgreements((prev) => ({ ...prev, [key]: true }));
  }

  return {
    agreements,
    agreementsOpen,
    setAgreementsOpen,
    termsModal,
    setTermsModal,
    allChecked,
    toggleAll,
    toggleOne,
    acceptTerm,
  };
}
