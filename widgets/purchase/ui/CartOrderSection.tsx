"use client";

/* eslint-disable @next/next/no-img-element -- 상품 이미지는 백엔드의 동적 URL이다. */

import { useEffect, useRef, useState } from "react";
import { loadPaymentWidget, type PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { checkoutCart, getCart, quoteCart, type CartDto, type CartPriceDto } from "@/features/cart";
import { type DeliveryAddress } from "@/features/delivery-address/api";
import { useAddressState, useExternalMessages } from "@/features/delivery-address/lib";
import { CheckoutAddressSection } from "@/features/delivery-address/ui";
import { getErrorMessage } from "@/shared/lib/api";
import { digitsOnly, formatKrwPrice, isValidKoreanPhone } from "@/shared/lib/format";
import { TOSS_WIDGET_CLIENT_KEY } from "@/shared/lib/payments/tossWidgetClient";
import { Checkbox, FORM_ACTION_CHIP_CLASS, FORM_INPUT_CLASS, LoadingOverlay, SectionCard } from "@/shared/ui";
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
  const [couponEnabled, setCouponEnabled] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [quote, setQuote] = useState<CartPriceDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentReady, setPaymentReady] = useState(false);
  const [agreeOpen, setAgreeOpen] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [openSections, setOpenSections] = useState({ product: true, customer: true, payment: true, delivery: true, summary: true });
  const address = useAddressState({ initialAddresses });
  const widgetRef = useRef<PaymentWidgetInstance | null>(null);
  const methodsRef = useRef<PaymentMethodsWidget | null>(null);
  const selectedItems = cart?.items.filter((item) => cartItemIds.includes(item.id)) ?? [];
  const agreeAll = agreeTerms && agreePrivacy && agreeAge;

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
    try {
      const next = await quoteCart({ cartItemIds, couponCode: couponCode.trim() || undefined });
      setQuote(next);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err, "쿠폰을 적용하지 못했습니다."));
    }
  }

  function toggleCoupon() {
    if (!couponEnabled) {
      setCouponEnabled(true);
      return;
    }
    setCouponEnabled(false);
    void quoteCart({ cartItemIds })
      .then((next) => {
        setQuote(next);
        setError(null);
      })
      .catch((err) => setError(getErrorMessage(err, "주문 금액을 계산하지 못했습니다.")));
  }

  async function handlePay() {
    setError(null);
    if (!agreeAll) return setError("필수 약관에 동의해 주세요.");
    if (!address.selectedAddress) {
      const phone = digitsOnly(address.newAddr.phoneNumber);
      if (!address.newAddr.receiverName.trim() || !phone || !address.newAddr.zipCode.trim() || !address.newAddr.address.trim()) return setError("배송지 정보(받는분, 연락처, 우편번호, 주소)를 입력해 주세요.");
      if (!isValidKoreanPhone(phone)) return address.setPhoneError("올바른 전화번호 형식이 아닙니다.");
    }
    if (!quote || !widgetRef.current) return setError("결제 정보를 불러오는 중입니다.");

    setPaying(true);
    try {
      const deliveryAddressId = address.selectedAddressId ?? await address.createAddress();
      const order = await checkoutCart({ cartItemIds, deliveryAddressId, couponCode: couponEnabled && couponCode.trim() ? couponCode.trim() : undefined });
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
      <OrderPriceSummaryBar basePrice={quote?.itemsAmount ?? 0} totalDiscount={quote?.couponDiscountAmount ?? 0} shippingFee={quote?.shippingFee ?? 0} total={quote?.amount ?? 0} />
      <div className="bg-white lg:overflow-x-auto">
        <div className="mx-auto max-lg:px-6 max-md:pt-6 md:py-8 lg:min-w-[900px] lg:px-0" style={{ maxWidth: "var(--max-width-content)" }}>
          <div className="grid items-start max-md:gap-y-9 md:grid-cols-[55%_1px_1fr] md:gap-x-6 lg:grid-cols-[1fr_1px_327px] lg:gap-x-8">
            <div className="flex flex-col max-md:gap-9 md:gap-4">
              <SectionCard title="제품 정보" open={openSections.product} onToggle={() => toggleSection("product")}>
                <div className="flex flex-col gap-5">
                  {selectedItems.map((item, index) => (
                    <article key={item.id} className={`${index ? "border-t border-[var(--color-border-light)] pt-5" : ""} flex w-full items-center max-sm:gap-4 sm:gap-6`}>
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} className="h-[104px] w-[112px] shrink-0 rounded-[12px] object-cover sm:h-[122px] sm:w-[132px] md:h-[117px] md:w-[117px] md:rounded-[16px]" /> : <div className="h-[104px] w-[112px] shrink-0 rounded-[12px] bg-[var(--color-surface-light)] sm:h-[122px] sm:w-[132px] md:h-[117px] md:w-[117px] md:rounded-[16px]" />}
                      <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <span className="text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text)]">{item.productName}</span>
                        <span className="text-price-16-eb text-[var(--color-surface-dark)]">단품 구매 {formatKrwPrice(item.unitPrice)}</span>
                        <span className="text-body-14-sb text-[var(--color-text)]">수량 {item.quantity}개</span>
                      </div>
                    </article>
                  ))}
                </div>
              </SectionCard>

              <CheckoutAddressSection open={openSections.customer} onToggle={() => toggleSection("customer")} selectedAddress={address.selectedAddress} onChangeAddress={address.handleChangeAddress} newAddr={address.newAddr} setNewAddr={address.setNewAddr} phoneError={address.phoneError} setPhoneError={address.setPhoneError} onSearchAddress={address.handleSearchAddress} />

              <SectionCard title="결제수단 선택" open={openSections.payment} onToggle={() => toggleSection("payment")}>
                <div className="flex flex-col pb-1">
                  <div className="flex flex-col gap-3 pt-4">
                    <Checkbox checked={couponEnabled} onChange={toggleCoupon} label="쿠폰사용" />
                    {couponEnabled ? <div className="flex items-start gap-0 md:items-center md:gap-4"><span className="shrink-0 pt-3 text-body-13-m leading-[16px] text-[var(--color-text)] max-md:w-[82px] md:w-[70px] md:pt-0">쿠폰입력</span><div className="flex min-w-0 flex-1 items-center gap-3"><input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} maxLength={30} className={`${FORM_INPUT_CLASS} min-w-0 flex-1`} placeholder="코드 입력" aria-label="쿠폰 코드" /><button type="button" onClick={() => void applyCoupon()} className={FORM_ACTION_CHIP_CLASS}>쿠폰적용</button></div></div> : null}
                  </div>
                  <div className="mt-8 flex flex-col gap-4"><p className="pl-[30px] text-subtitle-16-b-tight text-[var(--color-text)]">결제 방법</p><div id="cart-order-payment" /><div id="cart-order-agreement" />{!paymentReady ? <p className="text-center text-body-13-m text-[var(--color-text-secondary)]">결제 UI를 불러오는 중…</p> : null}</div>
                </div>
              </SectionCard>

              <OrderDeliveryMethodSection open={openSections.delivery} onToggle={() => toggleSection("delivery")} />
            </div>

            <div className="max-md:hidden self-stretch bg-[var(--color-text-muted)]" />

            <div className="flex flex-col max-md:gap-9 md:gap-4">
              <PurchaseOrderSummaryCard
                open={openSections.summary}
                onToggle={() => toggleSection("summary")}
                basePrice={quote?.itemsAmount ?? 0}
                totalDiscount={quote?.couponDiscountAmount ?? 0}
                originalShippingFee={quote?.shippingFee ?? 0}
                shippingFee={quote?.shippingFee ?? 0}
                total={quote?.amount ?? 0}
                quantity={quote?.totalQuantity ?? 0}
                agreeOpen={agreeOpen}
                agreeTerms={agreeTerms}
                agreePrivacy={agreePrivacy}
                agreeAge={agreeAge}
                agreeAll={agreeAll}
                onToggleAgreePanel={() => setAgreeOpen((open) => !open)}
                onToggleTerms={() => setAgreeTerms((checked) => !checked)}
                onTogglePrivacy={() => setAgreePrivacy((checked) => !checked)}
                onToggleAge={() => setAgreeAge((checked) => !checked)}
                onAgreeAll={() => { const next = !agreeAll; setAgreeTerms(next); setAgreePrivacy(next); setAgreeAge(next); }}
                submitError={error}
                isPaying={paying}
                paymentReady={paymentReady}
                onPay={() => void handlePay()}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
