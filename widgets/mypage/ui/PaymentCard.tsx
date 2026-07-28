"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Text } from "@/shared/ui";
import { DashboardCard, PAYMENT_REGISTER_CHIP_BUTTON_ACCENT_CLASS, SectionHeader } from "../lib/dashboard-shared";
import type { BillingInfo } from "@/features/billing/api/types";
import { useBillingUpdated } from "@/features/billing/lib/billingSync";
import { formatCardLabel } from "@/features/billing/lib/formatBillingLabel";
import type { UserSubscriptionDto } from "@/features/subscription/api/types";

interface PaymentCardProps {
  billingInfo: BillingInfo | null;
  subscription: UserSubscriptionDto | null;
}

function PaymentRow({
  label,
  children,
  align = "center",
}: {
  label: string;
  children: ReactNode;
  align?: "center" | "start";
}) {
  return (
    <div className={`flex ${align === "start" ? "items-start" : "items-center"} gap-4`}>
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
  const router = useRouter();
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(initialBillingInfo);

  // 서버 재조회(router.refresh) 결과가 로컬 state를 덮어쓰도록 동기화한다.
  useEffect(() => {
    setBillingInfo(initialBillingInfo);
  }, [initialBillingInfo]);

  // 다른 창에서 카드 등록/변경이 끝나면 서버에서 최신 결제수단을 다시 조회한다.
  useBillingUpdated(() => router.refresh());

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

  // 결제수단 변경 팝업. 등록된 카드가 있으면 확인 1단계, 없으면 곧바로 Toss 카드 등록창이 뜬다.
  function handleOpenPayment() {
    window.open(
      "/payment?mode=change",
      "paymentPopup",
      "width=650,height=700,scrollbars=yes",
    );
  }

  const hasMethod = billingInfo !== null;
  const cardLabel = hasMethod ? formatCardLabel(billingInfo) : "미등록";
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

        <PaymentRow label="카드 정보" align="start">
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
              className={PAYMENT_REGISTER_CHIP_BUTTON_ACCENT_CLASS}
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
