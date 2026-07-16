"use client";

import { useEffect } from "react";
import type { DeliveryAddress } from "../api/types";
import type { BillingInfo } from "@/features/billing/api/types";

interface ExternalMessagesOptions {
  onAddressSelected: (addr: DeliveryAddress) => void;
  onPaymentSelected?: (method: string, billing: BillingInfo | undefined) => void;
}

export function useExternalMessages({
  onAddressSelected,
  onPaymentSelected,
}: ExternalMessagesOptions): void {
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "ADDRESS_SELECTED" && e.data.address) {
        onAddressSelected(e.data.address as DeliveryAddress);
      }
      if (e.data?.type === "PAYMENT_SELECTED") {
        const { method, billing } = e.data as { method: string; billing?: BillingInfo };
        onPaymentSelected?.(method, billing);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onAddressSelected, onPaymentSelected]);
}
