"use client";

import { useCallback, useState } from "react";
import type { BillingInfo } from "@/features/billing/api/types";
import { getCouponInfo } from "@/features/subscription/api/subscriptionApi";
import type { CouponInfo } from "@/features/subscription/api/types";
import { getErrorMessage } from "@/shared/lib/api";

export interface PaymentStateResult {
  paymentMethod: string;
  billing: BillingInfo | null;
  couponEnabled: boolean;
  couponCodeInput: string;
  setCouponCodeInput: (value: string) => void;
  couponInfo: CouponInfo | null;
  couponError: string | null;
  handleChangeCard: () => void;
  handleSelectPaymentMethod: (method: string) => void;
  handleToggleCoupon: () => void;
  handleApplyCoupon: () => Promise<void>;
  handlePaymentSelected: (method: string, billing: BillingInfo | undefined) => void;
}

export function usePaymentState({
  initialBilling,
}: {
  initialBilling: BillingInfo | null;
}): PaymentStateResult {
  const [paymentMethod, setPaymentMethod] = useState<string>("신용카드");
  const [billing, setBilling] = useState<BillingInfo | null>(initialBilling);
  const [couponEnabled, setCouponEnabled] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponInfo, setCouponInfo] = useState<CouponInfo | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handlePaymentSelected = useCallback(
    (method: string, selectedBilling: BillingInfo | undefined) => {
      setPaymentMethod(method);
      if (selectedBilling) setBilling(selectedBilling);
    },
    [],
  );

  function openPaymentPopup(method: string) {
    const url = `/payment?method=${encodeURIComponent(method)}`;
    window.open(url, "paymentPopup", "width=480,height=700,scrollbars=yes");
  }

  function handleChangeCard() {
    openPaymentPopup(paymentMethod);
  }

  function handleSelectPaymentMethod(method: string) {
    setPaymentMethod(method);
    openPaymentPopup(method);
  }

  function handleToggleCoupon() {
    const next = !couponEnabled;
    setCouponEnabled(next);
    if (!next) {
      setCouponCodeInput("");
      setCouponInfo(null);
      setCouponError(null);
    }
  }

  async function handleApplyCoupon() {
    setCouponError(null);
    const code = couponCodeInput.trim();
    if (!code) {
      setCouponError("쿠폰 코드를 입력해 주세요.");
      setCouponInfo(null);
      return;
    }
    try {
      const info = await getCouponInfo({ code });
      setCouponInfo(info);
      if (!info.canUse) {
        setCouponError(info.unavailableReason ?? "사용할 수 없는 쿠폰입니다.");
      }
    } catch (err) {
      setCouponInfo(null);
      setCouponError(getErrorMessage(err, "쿠폰 확인에 실패했습니다."));
    }
  }

  return {
    paymentMethod,
    billing,
    couponEnabled,
    couponCodeInput,
    setCouponCodeInput,
    couponInfo,
    couponError,
    handleChangeCard,
    handleSelectPaymentMethod,
    handleToggleCoupon,
    handleApplyCoupon,
    handlePaymentSelected,
  };
}
