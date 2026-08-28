import { describe, it, expect } from "vitest";
import {
  computePurchaseTotals,
  validatePurchaseCheckout,
} from "@/widgets/purchase/ui/purchase-order-section/purchaseOrderHelpers";
import type { DeliveryAddress } from "@/features/delivery-address/api/types";
import { EMPTY_ADDR_STATE, type NewAddrState } from "@/features/delivery-address/lib/addressFormState";
import type { QuoteProductPriceResponse } from "@/features/product/api/types";

const UNIT = 39000; // 프리미엄 단품 단가 예시

function quote(overrides: Partial<QuoteProductPriceResponse>): QuoteProductPriceResponse {
  return {
    unitPrice: UNIT,
    quantity: 1,
    originalAmount: UNIT,
    couponDiscountAmount: 0,
    amount: UNIT,
    ...overrides,
  };
}

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
  it("quote 응답 도착 전(null) → 단가 × 수량으로 낙관적 표시, 할인 0", () => {
    const p = computePurchaseTotals({ unitPrice: UNIT, quantity: 1, quote: null });
    expect(p.basePrice).toBe(39000);
    expect(p.totalDiscount).toBe(0);
    expect(p.originalShippingFee).toBe(0);
    expect(p.shippingFee).toBe(0);
    expect(p.total).toBe(p.productTotal);
    expect(p.total).toBe(39000);
  });

  it("수량 2, quote 없음 → 주문상품금액만 배수", () => {
    const p = computePurchaseTotals({ unitPrice: UNIT, quantity: 2, quote: null });
    expect(p.basePrice).toBe(78000);
    expect(p.total).toBe(78000);
  });

  it("단가×수량이 임계값(30,000) 미만 → 원배송비는 3,000 취소선, 실배송비는 여전히 0", () => {
    const p = computePurchaseTotals({ unitPrice: 10000, quantity: 1, quote: null });
    expect(p.basePrice).toBe(10000);
    expect(p.originalShippingFee).toBe(3000);
    expect(p.shippingFee).toBe(0);
    expect(p.total).toBe(10000);
  });

  it("quote 응답의 쿠폰 할인·최종액을 그대로 반영한다(상한 적용 케이스)", () => {
    // 39,000 × 20% = 7,800 이지만 서버가 상한 5,000을 적용해 내려준 응답
    const p = computePurchaseTotals({
      unitPrice: UNIT,
      quantity: 1,
      quote: quote({ couponDiscountAmount: 5000, amount: 34000 }),
    });
    expect(p.couponDiscount).toBe(5000);
    expect(p.total).toBe(34000);
  });

  it("수량 2개 → quote의 originalAmount·couponDiscountAmount를 그대로 쓴다(주문 총액 기준)", () => {
    // 39,000 × 2 = 78,000의 20% = 15,600 (단가 1개 기준이면 7,800이 되어 청구액과 어긋난다)
    const p = computePurchaseTotals({
      unitPrice: UNIT,
      quantity: 2,
      quote: quote({ quantity: 2, originalAmount: 78000, couponDiscountAmount: 15600, amount: 62400 }),
    });
    expect(p.basePrice).toBe(78000);
    expect(p.couponDiscount).toBe(15600);
    expect(p.total).toBe(62400);
  });

  it("최종 결제액(amount)은 서버가 100원 단위로 내린 값을 재계산 없이 그대로 쓴다", () => {
    // 39,000 - 3,950 = 35,050이지만 서버는 100원 단위 내림한 35,000을 amount로 내려준다
    const p = computePurchaseTotals({
      unitPrice: UNIT,
      quantity: 1,
      quote: quote({ couponDiscountAmount: 3950, amount: 35000 }),
    });
    expect(p.couponDiscount).toBe(3950);
    expect(p.total).toBe(35000); // 35,050이 아니라 서버 값 그대로
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
