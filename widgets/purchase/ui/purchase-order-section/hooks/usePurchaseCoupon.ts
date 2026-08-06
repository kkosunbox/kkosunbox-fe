"use client";

import { useState } from "react";
import { getProductCouponInfo } from "@/features/product/api/productApi";
import type { ProductCouponInfo } from "@/features/product/api/types";
import { getErrorMessage } from "@/shared/lib/api";

/**
 * 단건 구매 쿠폰 입력/조회 상태를 소유하는 단위 훅.
 * 구독 주문(`widgets/order/ui/order-section/hooks/usePaymentState.ts`)의 쿠폰 로직과 동일한 패턴 —
 * 엔드포인트만 `getProductCouponInfo`(단건)로 교체.
 */
export function usePurchaseCoupon() {
  const [couponEnabled, setCouponEnabled] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponInfo, setCouponInfo] = useState<ProductCouponInfo | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

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
      const info = await getProductCouponInfo({ code });
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
    couponEnabled,
    couponCodeInput,
    setCouponCodeInput,
    couponInfo,
    couponError,
    handleToggleCoupon,
    handleApplyCoupon,
  };
}
