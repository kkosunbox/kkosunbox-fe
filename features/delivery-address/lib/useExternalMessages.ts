"use client";

import { useEffect } from "react";
import type { DeliveryAddress } from "../api/types";
import type { BillingInfo } from "@/features/billing/api/types";

interface ExternalMessagesOptions {
  onAddressSelected: (addr: DeliveryAddress) => void;
  /** 배송지 팝업에서 추가·수정된 배송지 */
  onAddressSaved?: (addr: DeliveryAddress) => void;
  /** 배송지 팝업에서 삭제된 배송지 ID */
  onAddressDeleted?: (id: number) => void;
  onPaymentSelected?: (method: string, billing: BillingInfo | undefined) => void;
}

export function useExternalMessages({
  onAddressSelected,
  onAddressSaved,
  onAddressDeleted,
  onPaymentSelected,
}: ExternalMessagesOptions): void {
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "ADDRESS_SELECTED" && e.data.address) {
        onAddressSelected(e.data.address as DeliveryAddress);
      }
      if (e.data?.type === "ADDRESS_SAVED" && e.data.address) {
        onAddressSaved?.(e.data.address as DeliveryAddress);
      }
      if (e.data?.type === "ADDRESS_DELETED" && typeof e.data.id === "number") {
        onAddressDeleted?.(e.data.id);
      }
      if (e.data?.type === "PAYMENT_SELECTED") {
        const { method, billing } = e.data as { method: string; billing?: BillingInfo };
        onPaymentSelected?.(method, billing);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onAddressSelected, onAddressSaved, onAddressDeleted, onPaymentSelected]);
}
