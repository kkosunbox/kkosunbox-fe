import { SHOP_FREE_SHIPPING_THRESHOLD, SHOP_SHIPPING_FEE } from "@/entities/product";
import { computeOrderPricing } from "@/features/order/lib/orderPricing";
import { digitsOnly, isValidKoreanPhone } from "@/shared/lib/format";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
import type { NewAddrState } from "@/features/delivery-address/lib/addressFormState";

export const QUANTITY_MIN = 1;
export const QUANTITY_MAX = 99;
export const PURCHASE_WIDGET_ELEMENT_ID = "purchase-payment-widget";
export const PURCHASE_AGREEMENT_ELEMENT_ID = "purchase-payment-agreement";
export const PURCHASE_AGREEMENTS_PANEL_ID = "purchase-agreements-panel";

export interface PurchaseTotals {
  basePrice: number;
  couponDiscount: number;
  totalDiscount: number;
  productTotal: number;
  originalShippingFee: number;
  shippingFee: number;
  total: number;
}

export function computePurchaseTotals({
  unitPrice,
  quantity,
  couponRatePercent,
}: {
  unitPrice: number;
  quantity: number;
  /** 쿠폰 할인율(%) — 적용 가능할 때만 전달. 미적용 시 null/undefined */
  couponRatePercent?: number | null;
}): PurchaseTotals {
  const { basePrice, couponDiscount, totalDiscount, total: productTotal } = computeOrderPricing({
    unitPrice,
    quantity,
    couponRatePercent,
  });
  // 단건 구매 무료배송 이벤트 — 원래 배송비는 취소선으로만 표시하고 실제로는 0원 청구
  const originalShippingFee = basePrice >= SHOP_FREE_SHIPPING_THRESHOLD ? 0 : SHOP_SHIPPING_FEE;
  const shippingFee = 0;
  const total = productTotal + shippingFee;

  return { basePrice, couponDiscount, totalDiscount, productTotal, originalShippingFee, shippingFee, total };
}

export type CheckoutGuardResult =
  | null
  | { sink: "submitError"; message: string }
  | { sink: "phoneError"; message: string };

export function validatePurchaseCheckout({
  agreeAll,
  selectedAddress,
  newAddr,
  hasPaymentWidget,
  productId,
}: {
  agreeAll: boolean;
  selectedAddress: DeliveryAddress | null;
  newAddr: NewAddrState;
  hasPaymentWidget: boolean;
  productId: number | null;
}): CheckoutGuardResult {
  if (!agreeAll) {
    return { sink: "submitError", message: "필수 약관에 동의해 주세요." };
  }

  if (!selectedAddress) {
    const rawPhone = digitsOnly(newAddr.phoneNumber);
    if (
      !newAddr.receiverName.trim() ||
      !rawPhone ||
      !newAddr.zipCode.trim() ||
      !newAddr.address.trim()
    ) {
      return {
        sink: "submitError",
        message: "배송지 정보(받는분, 연락처, 우편번호, 주소)를 입력해 주세요.",
      };
    }
    if (!isValidKoreanPhone(rawPhone)) {
      return { sink: "phoneError", message: "올바른 전화번호 형식이 아닙니다." };
    }
  }

  if (!hasPaymentWidget) {
    return { sink: "submitError", message: "결제 UI를 불러오는 중입니다. 잠시 후 다시 시도해주세요." };
  }

  if (productId === null) {
    return { sink: "submitError", message: "현재 이 상품은 준비 중입니다. 잠시 후 다시 시도해주세요." };
  }

  return null;
}
