import { useState } from "react";

export interface AgreementState {
  agreeOpen: boolean;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeAge: boolean;
  agreeAll: boolean;
  onToggleAgreePanel: () => void;
  onToggleTerms: () => void;
  onTogglePrivacy: () => void;
  onToggleAge: () => void;
  handleAgreeAll: () => void;
}

export function useAgreementState(): AgreementState {
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

  return {
    agreeOpen,
    agreeTerms,
    agreePrivacy,
    agreeAge,
    agreeAll,
    onToggleAgreePanel: () => setAgreeOpen((p) => !p),
    onToggleTerms: () => setAgreeTerms((p) => !p),
    onTogglePrivacy: () => setAgreePrivacy((p) => !p),
    onToggleAge: () => setAgreeAge((p) => !p),
    handleAgreeAll,
  };
}
