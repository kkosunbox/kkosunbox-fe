"use client";

import { useCallback, useState } from "react";
import type { BillingInfo } from "../api/types";
import PaymentMethodView from "./PaymentMethodView";
import CardInputView from "./CardInputView";
import ExistingBillingView from "./ExistingBillingView";

type View = "method" | "card-input" | "existing-billing";

export type PaymentMethod = "신용카드" | "무통장입금" | "카카오페이" | "계좌이체";

// 현재 신용카드만 지원 — 추후 다른 결제수단 추가 시 복원
const PAYMENT_METHODS: PaymentMethod[] = [
  "신용카드",
  // "무통장입금",
  // "카카오페이",
  // "계좌이체",
];

interface Props {
  initialMethod: string;
  initialBilling: BillingInfo | null;
}

export default function PaymentManager({ initialMethod, initialBilling }: Props) {
  const initial = PAYMENT_METHODS.includes(initialMethod as PaymentMethod)
    ? (initialMethod as PaymentMethod)
    : "신용카드";

  const [view, setView] = useState<View>("method");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(initial);
  const [billing, setBilling] = useState<BillingInfo | null>(initialBilling);

  const closeWindow = useCallback(() => {
    window.close();
  }, []);

  function handleMethodNext() {
    if (selectedMethod === "신용카드") {
      if (billing) {
        setView("existing-billing");
      } else {
        setView("card-input");
      }
    } else {
      // 신용카드 외 결제수단은 바로 선택 결과 전달
      sendResult({ method: selectedMethod });
    }
  }

  function handleCardConfirm(registeredBilling: BillingInfo) {
    setBilling(registeredBilling);
    sendResult({ method: "신용카드", billing: registeredBilling });
  }

  function handleExistingConfirm(selectedBilling: BillingInfo) {
    sendResult({ method: "신용카드", billing: selectedBilling });
  }

  function handleNewCard() {
    setView("card-input");
  }

  function sendResult(data: { method: string; billing?: BillingInfo }) {
    if (window.opener) {
      window.opener.postMessage(
        { type: "PAYMENT_SELECTED", ...data },
        window.location.origin,
      );
      window.close();
    }
  }

  switch (view) {
    case "method":
      return (
        <PaymentMethodView
          methods={PAYMENT_METHODS}
          selected={selectedMethod}
          onSelect={setSelectedMethod}
          onNext={handleMethodNext}
          onClose={closeWindow}
        />
      );
    case "existing-billing":
      return (
        <ExistingBillingView
          billing={billing!}
          onConfirm={handleExistingConfirm}
          onNewCard={handleNewCard}
          onBack={() => setView("method")}
          onClose={closeWindow}
        />
      );
    case "card-input":
      return (
        <CardInputView
          existingBilling={billing}
          onConfirm={handleCardConfirm}
          onBack={() => (billing ? setView("existing-billing") : setView("method"))}
          onClose={closeWindow}
        />
      );
  }
}
