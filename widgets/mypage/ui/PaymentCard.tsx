"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { Text } from "@/shared/ui";
import { DashboardCard, PAYMENT_REGISTER_CHIP_BUTTON_CLASS, SectionHeader } from "./dashboard-shared";
import type { BillingInfo } from "@/features/billing/api/types";
import type { UserSubscriptionDto } from "@/features/subscription/api/types";

interface PaymentCardProps {
  billingInfo: BillingInfo | null;
  subscription: UserSubscriptionDto | null;
}

function PaymentRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <Text
        variant="body-13-r"
        className="w-[64px] shrink-0 font-medium text-[var(--color-text-secondary)] lg:w-[88px]"
      >
        {label}
      </Text>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function PaymentCard({ billingInfo: initialBillingInfo, subscription }: PaymentCardProps) {
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(initialBillingInfo);

  const handlePaymentMessage = useCallback((e: MessageEvent) => {
    if (e.origin !== window.location.origin) return;
    if (e.data?.type === "PAYMENT_SELECTED" && e.data.billing) {
      setBillingInfo(e.data.billing as BillingInfo);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("message", handlePaymentMessage);
    return () => window.removeEventListener("message", handlePaymentMessage);
  }, [handlePaymentMessage]);

  function handleOpenPayment() {
    window.open(
      `/payment?method=${encodeURIComponent("신용카드")}`,
      "paymentPopup",
      "width=480,height=700,scrollbars=yes",
    );
  }

  const hasMethod = billingInfo !== null;
  const cardLabel = hasMethod
    ? `${billingInfo.cardCompany} (****-****-****-${billingInfo.lastFourDigits})`
    : "미등록";
  const nextDate = subscription?.nextBillingDate
    ? `${subscription.nextBillingDate.replace(/-/g, ".")} (카드결제)`
    : "-";

  return (
    <DashboardCard className="lg:h-[186px]">
      <SectionHeader title="결제관리" linkLabel="결제관리" spacing="wide" />

      <div className="flex min-h-0 flex-1 flex-col max-lg:gap-4 lg:gap-2">
        <PaymentRow label="결제수단">
          <Text
            variant="body-13-r"
            className={`font-semibold ${hasMethod ? "text-[var(--color-text)]" : "text-[var(--color-text-secondary)]"}`}
          >
            {hasMethod ? "신용카드 결제" : "미등록"}
          </Text>
        </PaymentRow>

        <PaymentRow label="카드 정보">
          <div className="flex min-w-0 items-center gap-2 max-lg:flex-wrap lg:flex-nowrap">
            <Text
              variant="body-13-r"
              className={`min-w-0 truncate font-semibold ${hasMethod ? "text-[var(--color-text)]" : "text-[var(--color-text-secondary)]"}`}
            >
              {cardLabel}
            </Text>
            <button
              type="button"
              onClick={handleOpenPayment}
              className={PAYMENT_REGISTER_CHIP_BUTTON_CLASS}
            >
              결제등록/변경
            </button>
          </div>
        </PaymentRow>

        <PaymentRow label="다음 결제일">
          <Text
            variant="body-13-r"
            className={`font-semibold ${hasMethod ? "text-[var(--color-text)]" : "text-[var(--color-text-secondary)]"}`}
          >
            {hasMethod ? nextDate : "-"}
          </Text>
        </PaymentRow>
      </div>
    </DashboardCard>
  );
}
