"use client";

/* eslint-disable @next/next/no-img-element -- 상품 이미지는 백엔드의 동적 URL이다. */

import { useEffect, useRef, useState } from "react";
import { loadPaymentWidget, type PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { checkoutCart, getCart, quoteCart, updateCartItem, type CartDto, type CartItemDto, type CartPriceDto } from "@/features/cart";
import { type DeliveryAddress } from "@/features/delivery-address/api";
import { useAddressState, useExternalMessages } from "@/features/delivery-address/lib";
import { CheckoutAddressSection } from "@/features/delivery-address/ui";
import { getErrorMessage } from "@/shared/lib/api";
import { digitsOnly, formatKrwPrice, isValidKoreanPhone } from "@/shared/lib/format";
import { TOSS_WIDGET_CLIENT_KEY } from "@/shared/lib/payments/tossWidgetClient";
import { STANDARD_SHIPPING_FEE } from "@/shared/config/shipping";
import { useOrderPolicy } from "@/shared/lib/orderPolicy";
import { CheckoutPromotionBanner, FORM_ACTION_CHIP_CLASS, FORM_INPUT_CLASS, LoadingOverlay, QuantityMinusIcon, QuantityPlusIcon, SectionCard } from "@/shared/ui";
import { OrderDeliveryMethodSection } from "@/widgets/order/ui/order-section/OrderDeliveryMethodSection";
import { OrderPriceSummaryBar } from "@/widgets/order/ui/order-section/OrderPriceSummaryBar";
import { PurchaseOrderSummaryCard } from "./purchase-order-section/components/PurchaseOrderSummaryCard";

type PaymentMethodsWidget = ReturnType<PaymentWidgetInstance["renderPaymentMethods"]>;

interface CartOrderSectionProps {
  cartItemIds: number[];
  initialAddresses: DeliveryAddress[];
}

export default function CartOrderSection({ cartItemIds, initialAddresses }: CartOrderSectionProps) {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [couponCode, setCouponCode] = useState("");
  /** 견적에 반영된(쿠폰사용 버튼으로 확정된) 쿠폰 코드 — 결제 시 이 값만 보낸다 */
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | undefined>(undefined);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [quote, setQuote] = useState<CartPriceDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [openSections, setOpenSections] = useState({ product: true, customer: true, payment: true, delivery: true, summary: true });
  const address = useAddressState({ initialAddresses });
  const widgetRef = useRef<PaymentWidgetInstance | null>(null);
  const methodsRef = useRef<PaymentMethodsWidget | null>(null);
  const selectedItems = cart?.items.filter((item) => cartItemIds.includes(item.id)) ?? [];
  const policy = useOrderPolicy();
  const originalShippingFee = policy?.shippingFee ?? STANDARD_SHIPPING_FEE;

  useExternalMessages({ onAddressSelected: address.handleAddressSelected });

  useEffect(() => {
    void Promise.all([getCart(), quoteCart({ cartItemIds })])
      .then(([cartData, quoteData]) => {
        setCart({ ...cartData, items: cartData.items.filter((item) => cartItemIds.includes(item.id)) });
        setQuote(quoteData);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setBusy(false));
  }, [cartItemIds]);

  useEffect(() => {
    if (!quote || widgetRef.current) return;
    const customerKey = crypto.randomUUID?.() ?? `cart-${Date.now()}`;
    void loadPaymentWidget(TOSS_WIDGET_CLIENT_KEY, customerKey)
      .then((widget) => {
        widgetRef.current = widget;
        const methods = widget.renderPaymentMethods("#cart-order-payment", { value: quote.amount }, { variantKey: "widgetK" });
        methods.on("ready", () => setPaymentReady(true));
        methodsRef.current = methods;
        widget.renderAgreement("#cart-order-agreement", { variantKey: "AGREEMENT" });
      })
      .catch(() => setError("결제 UI를 불러오지 못했습니다."));
  }, [quote]);

  useEffect(() => {
    void methodsRef.current?.updateAmount(quote?.amount ?? 0);
  }, [quote?.amount]);

  function toggleSection(key: keyof typeof openSections) {
    setOpenSections((sections) => ({ ...sections, [key]: !sections[key] }));
  }

  async function applyCoupon() {
    const code = couponCode.trim() || undefined;
    try {
      const next = await quoteCart({ cartItemIds, couponCode: code });
      setQuote(next);
      setAppliedCouponCode(code);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "쿠폰을 적용하지 못했습니다."));
    }
  }

  async function changeQuantity(item: CartItemDto, quantity: number) {
    if (quantity < 1 || (item.stockQuantity !== null && quantity > item.stockQuantity) || updatingItemId !== null) return;
    setUpdatingItemId(item.id);
    try {
      const nextCart = await updateCartItem(item.id, { quantity });
      setCart({ ...nextCart, items: nextCart.items.filter((cartItem) => cartItemIds.includes(cartItem.id)) });
      setQuote(await quoteCart({ cartItemIds, couponCode: appliedCouponCode }));
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "수량을 변경하지 못했습니다."));
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function handlePay() {
    setError(null);
    if (!address.selectedAddress) {
      const phone = digitsOnly(address.newAddr.phoneNumber);
      if (!address.newAddr.receiverName.trim() || !phone || !address.newAddr.zipCode.trim() || !address.newAddr.address.trim()) return setError("배송지 정보(받는분, 연락처, 우편번호, 주소)를 입력해 주세요.");
      if (!isValidKoreanPhone(phone)) return address.setPhoneError("올바른 전화번호 형식이 아닙니다.");
    }
    if (!quote || !widgetRef.current) return setError("결제 정보를 불러오는 중입니다.");

    setPaying(true);
    try {
      const deliveryAddressId = address.selectedAddressId ?? await address.createAddress();
      const order = await checkoutCart({ cartItemIds, deliveryAddressId, couponCode: appliedCouponCode });
      await methodsRef.current?.updateAmount(order.amount);
      await widgetRef.current.requestPayment({
        orderId: order.orderId,
        orderName: order.orderName,
        customerName: (address.selectedAddress?.receiverName ?? address.newAddr.receiverName).trim() || undefined,
        successUrl: `${window.location.origin}/purchase/order/success`,
        failUrl: `${window.location.origin}/purchase/order/fail`,
      });
    } catch (err) {
      setError(getErrorMessage(err, "결제 요청 중 오류가 발생했습니다."));
      setPaying(false);
    }
  }

  if (busy) return <LoadingOverlay visible />;

  return (
    <div className="pt-[var(--header-offset)]">
      <OrderPriceSummaryBar basePrice={quote?.itemsAmount ?? 0} totalDiscount={quote?.couponDiscountAmount ?? 0} shippingFee={quote?.shippingFee ?? 0} originalShippingFee={originalShippingFee} total={quote?.amount ?? 0} />
      <div className="bg-white">
        <div className="mx-auto max-md:w-full max-md:px-6 max-md:py-6 md:pt-[52px] md:pb-[90px] md:max-lg:w-full md:max-lg:px-5 lg:w-[calc(100%_-_80px)] lg:max-w-[1240px]">
          <div className="grid items-start max-md:gap-y-9 md:grid-cols-[minmax(0,1fr)_auto_280px] lg:grid-cols-[minmax(0,835fr)_auto_minmax(0,301fr)]">
            {/* 좌측 — 제품 · 배송지 · 결제수단 · 배송방법 */}
            <div className="flex flex-col max-md:gap-9 md:gap-10">
              <SectionCard variant="order" title="제품정보" open={openSections.product} onToggle={() => toggleSection("product")}>
                <div className="flex flex-col gap-5">
                  {selectedItems.map((item, index) => (
                    <article key={item.id} className={`${index ? "border-t border-[var(--color-border-light)] pt-5" : ""} flex w-full items-center max-sm:gap-4 sm:gap-6 md:px-6`}>
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} className="shrink-0 rounded-[12px] object-cover max-sm:h-[104px] max-sm:w-[112px] sm:max-md:h-[122px] sm:max-md:w-[132px] md:h-[148px] md:w-[160px]" /> : <div className="shrink-0 rounded-[12px] bg-[var(--color-surface-light)] max-sm:h-[104px] max-sm:w-[112px] sm:max-md:h-[122px] sm:max-md:w-[132px] md:h-[148px] md:w-[160px]" />}
                      <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="tracking-[-0.04em] text-[var(--color-text)] max-md:text-subtitle-16-sb md:text-subtitle-18-sb">{item.productName}</span>
                          <span className="rounded-[5px] bg-[var(--color-border-light)] px-1 py-0.5 text-body-12-m text-[var(--color-status-done)] opacity-80">단품</span>
                        </div>
                        <span className="tracking-[-0.05em] text-[var(--color-text-secondary)] max-md:text-body-14-m md:text-body-16-m">단품구매</span>
                        <div className="flex items-center gap-3">
                          <button type="button" aria-label="수량 감소" onClick={() => void changeQuantity(item, item.quantity - 1)} disabled={item.quantity <= 1 || updatingItemId !== null} className="flex h-6 w-6 items-center justify-center disabled:opacity-30">
                            <QuantityMinusIcon />
                          </button>
                          <span className="min-w-[12px] text-center text-body-12-m text-[var(--color-text)]">{item.quantity}</span>
                          <button type="button" aria-label="수량 증가" onClick={() => void changeQuantity(item, item.quantity + 1)} disabled={(item.stockQuantity !== null && item.quantity >= item.stockQuantity) || updatingItemId !== null} className="flex h-6 w-6 items-center justify-center disabled:opacity-30">
                            <QuantityPlusIcon />
                          </button>
                        </div>
                        <span className="text-price-16-eb text-[var(--color-surface-dark)]">{formatKrwPrice(item.unitPrice)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </SectionCard>

              <CheckoutAddressSection variant="order" open={openSections.customer} onToggle={() => toggleSection("customer")} selectedAddress={address.selectedAddress} onChangeAddress={address.handleChangeAddress} newAddr={address.newAddr} setNewAddr={address.setNewAddr} phoneError={address.phoneError} setPhoneError={address.setPhoneError} onSearchAddress={address.handleSearchAddress} />

              <SectionCard variant="order" title="결제수단 선택" open={openSections.payment} onToggle={() => toggleSection("payment")}>
                <div className="flex flex-col gap-6 pb-1">
                  <div className="flex flex-col gap-4">
                    <div id="cart-order-payment" />
                    <div id="cart-order-agreement" />
                    {!paymentReady ? <p className="text-center text-body-13-m text-[var(--color-text-secondary)]">결제 UI를 불러오는 중…</p> : null}
                  </div>
                  <div className="flex items-center">
                    <span className="shrink-0 text-body-13-m text-[var(--color-text)] max-md:w-[70px] md:w-[61px]">쿠폰사용</span>
                    <div className="flex min-w-0 flex-1 items-center gap-3 md:max-w-[327px]">
                      <input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} maxLength={30} className={`${FORM_INPUT_CLASS} min-w-0 flex-1`} placeholder="쿠폰번호를 입력하세요" aria-label="쿠폰 코드" />
                      <button type="button" onClick={() => void applyCoupon()} className={FORM_ACTION_CHIP_CLASS}>쿠폰사용</button>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <OrderDeliveryMethodSection open={openSections.delivery} onToggle={() => toggleSection("delivery")} />
            </div>

            <div className="max-md:hidden self-stretch w-px bg-[var(--color-text-muted)] md:max-lg:mx-6 lg:ml-14 lg:mr-12" />

            {/* 우측 — 결제 정보 · 결제 버튼 · 프로모션 */}
            <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-[calc(var(--header-offset)_+_24px)]">
              <PurchaseOrderSummaryCard
                open={openSections.summary}
                onToggle={() => toggleSection("summary")}
                basePrice={quote?.itemsAmount ?? 0}
                totalDiscount={quote?.couponDiscountAmount ?? 0}
                originalShippingFee={originalShippingFee}
                shippingFee={quote?.shippingFee ?? 0}
                total={quote?.amount ?? 0}
                quantity={quote?.totalQuantity ?? 0}
                submitError={error}
                isPaying={paying}
                paymentReady={paymentReady && updatingItemId === null}
                onPay={() => void handlePay()}
              />

              <CheckoutPromotionBanner />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
