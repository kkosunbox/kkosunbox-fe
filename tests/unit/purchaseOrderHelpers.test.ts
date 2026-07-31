import { describe, it, expect } from "vitest";
import {
  computePurchaseTotals,
  validatePurchaseCheckout,
} from "@/widgets/purchase/ui/purchase-order-section/purchaseOrderHelpers";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
import { EMPTY_ADDR_STATE, type NewAddrState } from "@/features/delivery-address/lib/addressFormState";

const UNIT = 39000; // 프리미엄 단품 단가 예시

const SELECTED_ADDRESS: DeliveryAddress = {
  id: 1,
  nickname: null,
  receiverName: "홍길동",
  phoneNumber: "01012345678",
  zipCode: "12345",
  address: "서울시 어딘가",
  addressDetail: null,
  memo: null,
  createdAt: "2026-07-31T00:00:00Z",
  updatedAt: "2026-07-31T00:00:00Z",
};

function filledAddr(overrides: Partial<NewAddrState> = {}): NewAddrState {
  return {
    ...EMPTY_ADDR_STATE,
    receiverName: "홍길동",
    phoneNumber: "010-1234-5678",
    zipCode: "12345",
    address: "서울시 어딘가",
    ...overrides,
  };
}

describe("computePurchaseTotals", () => {
  it("수량 1, 임계값(30,000) 이상 → 원배송비 취소선 0, 실배송비는 항상 0", () => {
    const p = computePurchaseTotals({ unitPrice: UNIT, quantity: 1 });
    expect(p.basePrice).toBe(39000);
    expect(p.totalDiscount).toBe(0);
    expect(p.originalShippingFee).toBe(0);
    expect(p.shippingFee).toBe(0);
    expect(p.total).toBe(p.productTotal);
  });

  it("수량 2 → 주문상품금액만 배수", () => {
    const p = computePurchaseTotals({ unitPrice: UNIT, quantity: 2 });
    expect(p.basePrice).toBe(78000);
    expect(p.total).toBe(78000);
  });

  it("수량 99 → 상한까지 정상 계산", () => {
    const p = computePurchaseTotals({ unitPrice: UNIT, quantity: 99 });
    expect(p.basePrice).toBe(UNIT * 99);
    expect(p.total).toBe(UNIT * 99);
  });

  it("단가×수량이 임계값(30,000) 미만 → 원배송비는 3,000 취소선, 실배송비는 여전히 0", () => {
    const p = computePurchaseTotals({ unitPrice: 10000, quantity: 1 });
    expect(p.basePrice).toBe(10000);
    expect(p.originalShippingFee).toBe(3000);
    expect(p.shippingFee).toBe(0);
    expect(p.total).toBe(10000);
  });
});

describe("validatePurchaseCheckout", () => {
  const base = {
    agreeAll: true,
    selectedAddress: SELECTED_ADDRESS,
    newAddr: EMPTY_ADDR_STATE,
    hasPaymentWidget: true,
    productId: 1,
  };

  it("모든 조건 충족 → null(통과)", () => {
    expect(validatePurchaseCheckout(base)).toBeNull();
  });

  it("약관 미동의 → submitError", () => {
    const result = validatePurchaseCheckout({ ...base, agreeAll: false });
    expect(result).toEqual({ sink: "submitError", message: "필수 약관에 동의해 주세요." });
  });

  it("배송지 미선택 + 신규 입력도 빈칸 → submitError", () => {
    const result = validatePurchaseCheckout({
      ...base,
      selectedAddress: null,
      newAddr: EMPTY_ADDR_STATE,
    });
    expect(result).toEqual({
      sink: "submitError",
      message: "배송지 정보(받는분, 연락처, 우편번호, 주소)를 입력해 주세요.",
    });
  });

  it("배송지 미선택 + 신규 입력했지만 전화번호 형식 오류 → phoneError", () => {
    const result = validatePurchaseCheckout({
      ...base,
      selectedAddress: null,
      newAddr: filledAddr({ phoneNumber: "010-1" }),
    });
    expect(result).toEqual({ sink: "phoneError", message: "올바른 전화번호 형식이 아닙니다." });
  });

  it("배송지 미선택 + 신규 입력 유효 → 통과(null)", () => {
    const result = validatePurchaseCheckout({
      ...base,
      selectedAddress: null,
      newAddr: filledAddr(),
    });
    expect(result).toBeNull();
  });

  it("결제위젯 미로드 → submitError", () => {
    const result = validatePurchaseCheckout({ ...base, hasPaymentWidget: false });
    expect(result).toEqual({
      sink: "submitError",
      message: "결제 UI를 불러오는 중입니다. 잠시 후 다시 시도해주세요.",
    });
  });

  it("productId null(카탈로그 미매칭) → submitError", () => {
    const result = validatePurchaseCheckout({ ...base, productId: null });
    expect(result).toEqual({
      sink: "submitError",
      message: "현재 이 상품은 준비 중입니다. 잠시 후 다시 시도해주세요.",
    });
  });
});
