import { PURCHASE_FREE_SHIPPING_THRESHOLD, PURCHASE_SHIPPING_FEE } from "@/entities/package";
import { computeOrderPricing } from "@/features/order/lib/orderPricing";
import { resolveProductCouponDiscount } from "@/features/product/lib/couponDiscount";
import { digitsOnly, isValidKoreanPhone } from "@/shared/lib/format";
import type { ProductCouponInfo } from "@/features/product/api/types";
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
  couponInfo,
}: {
  unitPrice: number;
  quantity: number;
  /**
   * 단건 쿠폰 조회 응답. 할인율·상한 해석은 단건 전용 resolver가 담당한다 —
   * 정액 할인과 회차가 있는 구독 쿠폰(`CouponInfo`)을 여기에 넘기면 안 된다.
   */
  couponInfo?: ProductCouponInfo | null;
}): PurchaseTotals {
  const { basePrice, couponDiscount, totalDiscount, total: productTotal } = computeOrderPricing({
    unitPrice,
    quantity,
    // 단건 쿠폰은 주문상품금액(단가 × 수량) 전체에 할인율을 적용한다 — 구독(단가 1개)과 다르다.
    couponDiscount: resolveProductCouponDiscount(couponInfo ?? null, unitPrice * quantity),
  });
  // 단건 구매 무료배송 이벤트 — 원래 배송비는 취소선으로만 표시하고 실제로는 0원 청구
  const originalShippingFee =
    basePrice >= PURCHASE_FREE_SHIPPING_THRESHOLD ? 0 : PURCHASE_SHIPPING_FEE;
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
