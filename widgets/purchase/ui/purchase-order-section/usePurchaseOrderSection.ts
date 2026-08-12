"use client";

import { useState } from "react";
import type { PackagePurchaseProduct } from "@/entities/package";
import { useAddressState, useExternalMessages } from "@/features/delivery-address/lib";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
import { isTossUserCancel } from "@/features/billing/lib/requestTossBillingAuth";
import { createProductOrder } from "@/features/product/api/productApi";
import { getErrorMessage } from "@/shared/lib/api";
import { computePurchaseTotals, validatePurchaseCheckout } from "./purchaseOrderHelpers";
import { useOrderAgreements } from "./hooks/useOrderAgreements";
import { usePurchaseCoupon } from "./hooks/usePurchaseCoupon";
import { usePurchasePaymentWidget } from "./hooks/usePurchasePaymentWidget";

interface UsePurchaseOrderSectionParams {
  purchaseProduct: PackagePurchaseProduct;
  initialAddresses: DeliveryAddress[];
  /** 백엔드 상품 카탈로그에서 매칭된 실제 상품 ID. 카탈로그가 비어있으면 null — 결제 시 안내 후 차단 */
  productId: number | null;
  /** 상세 페이지에서 이어받은 초기 수량 (1~99, 기본 1) */
  initialQuantity?: number;
}

/**
 * `/purchase/order` 페이지(Section)의 조정자(Coordinator).
 * 단위 훅(agreements·paymentWidget·address) 조립 + openSections·quantity·submitError·isPaying
 * 소유 + 결제 오케스트레이션(검증→주문 생성→금액 재동기화→결제 요청)만 담당한다.
 */
export function usePurchaseOrderSection({
  purchaseProduct,
  initialAddresses,
  productId,
  initialQuantity = 1,
}: UsePurchaseOrderSectionParams) {
  const [openSections, setOpenSections] = useState({
    product: true,
    customer: true,
    payment: true,
    delivery: true,
    summary: true,
  });
  const [quantity, setQuantity] = useState(initialQuantity);
  const address = useAddressState({ initialAddresses });
  const {
    agreeOpen,
    agreeTerms,
    agreePrivacy,
    agreeAll,
    handleAgreeAll,
    toggleAgreePanel,
    toggleTerms,
    togglePrivacy,
  } = useOrderAgreements();
  const coupon = usePurchaseCoupon();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  useExternalMessages({ onAddressSelected: address.handleAddressSelected });

  const { basePrice, couponDiscount, totalDiscount, originalShippingFee, shippingFee, total } = computePurchaseTotals({
    unitPrice: purchaseProduct.price,
    quantity,
    couponInfo: coupon.couponInfo,
  });

  const { paymentWidget, paymentReady, widgetLoadError, reloadWidget, updateAmount } =
    usePurchasePaymentWidget({ total });

  function toggleSection(key: keyof typeof openSections) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handlePay() {
    setSubmitError(null);

    const guard = validatePurchaseCheckout({
      agreeAll,
      selectedAddress: address.selectedAddress,
      newAddr: address.newAddr,
      hasPaymentWidget: !!paymentWidget,
      productId,
    });
    if (guard) {
      if (guard.sink === "phoneError") {
        address.setPhoneError(guard.message);
      } else {
        setSubmitError(guard.message);
      }
      return;
    }

    const receiverName = address.selectedAddress?.receiverName ?? address.newAddr.receiverName;

    setIsPaying(true);
    try {
      const deliveryAddressId = address.selectedAddressId ?? (await address.createAddress());
      if (deliveryAddressId === null) {
        setSubmitError("배송지를 선택하거나 입력해 주세요.");
        return;
      }

      // productId·paymentWidget은 위 validatePurchaseCheckout 가드를 통과했으므로 non-null이 보장된다.
      const order = await createProductOrder(productId!, {
        deliveryAddressId,
        quantity,
        couponCode:
          coupon.couponInfo?.canUse && coupon.couponCodeInput.trim()
            ? coupon.couponCodeInput.trim()
            : undefined,
      });

      // 결제위젯에 바인딩된 금액을 백엔드가 계산한 실제 금액으로 맞춘다 — confirm 시 금액 불일치(PRODUCT_ORDER_AMOUNT_MISMATCH) 방지.
      // requestPayment() 전에 위젯 상태가 완전히 갱신되도록 await한다.
      await updateAmount(order.amount);

      await paymentWidget!.requestPayment({
        orderId: order.orderId,
        orderName: order.orderName,
        customerName: receiverName.trim() || undefined,
        successUrl: `${window.location.origin}/purchase/order/success`,
        failUrl: `${window.location.origin}/purchase/order/fail`,
      });
    } catch (err) {
      if (isTossUserCancel(err)) return;
      setSubmitError(getErrorMessage(err, "결제 요청 중 오류가 발생했습니다. 다시 시도해주세요."));
    } finally {
      setIsPaying(false);
    }
  }

  return {
    openSections,
    toggleSection,
    quantity,
    setQuantity,
    address,
    agreeOpen,
    agreeTerms,
    agreePrivacy,
    agreeAll,
    handleAgreeAll,
    toggleAgreePanel,
    toggleTerms,
    togglePrivacy,
    submitError,
    isPaying,
    basePrice,
    couponDiscount,
    totalDiscount,
    originalShippingFee,
    shippingFee,
    total,
    couponCodeInput: coupon.couponCodeInput,
    setCouponCodeInput: coupon.setCouponCodeInput,
    couponInfo: coupon.couponInfo,
    couponError: coupon.couponError,
    handleApplyCoupon: coupon.handleApplyCoupon,
    paymentWidget,
    paymentReady,
    widgetLoadError,
    reloadWidget,
    handlePay,
  };
}
