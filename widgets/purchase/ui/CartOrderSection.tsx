"use client";
/* eslint-disable @next/next/no-img-element -- 상품 이미지는 백엔드의 동적 URL이다. */

import { useEffect, useRef, useState } from "react";
import { loadPaymentWidget, type PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { checkoutCart, getCart, quoteCart, type CartDto, type CartPriceDto } from "@/features/cart";
import { getDeliveryAddresses, type DeliveryAddress } from "@/features/delivery-address/api";
import { getErrorMessage } from "@/shared/lib/api";
import { formatKrwPrice } from "@/shared/lib/format";
import { TOSS_WIDGET_CLIENT_KEY } from "@/shared/lib/payments/tossWidgetClient";
import { LoadingOverlay } from "@/shared/ui";

type PaymentMethodsWidget = ReturnType<PaymentWidgetInstance["renderPaymentMethods"]>;

export default function CartOrderSection({ cartItemIds }: { cartItemIds: number[] }) {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [quote, setQuote] = useState<CartPriceDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [paying, setPaying] = useState(false);
  const widgetRef = useRef<PaymentWidgetInstance | null>(null);
  const methodsRef = useRef<PaymentMethodsWidget | null>(null);

  useEffect(() => {
    void Promise.all([getCart(), getDeliveryAddresses(), quoteCart({ cartItemIds })]).then(([cartData, addressData, quoteData]) => {
      setCart({ ...cartData, items: cartData.items.filter((item) => cartItemIds.includes(item.id)) });
      setAddresses(addressData.addresses);
      setAddressId(addressData.addresses[0]?.id ?? null);
      setQuote(quoteData);
    }).catch((err) => setError(getErrorMessage(err))).finally(() => setBusy(false));
  }, [cartItemIds]);

  useEffect(() => {
    if (!quote || widgetRef.current) return;
    const customerKey = crypto.randomUUID?.() ?? `cart-${Date.now()}`;
    void loadPaymentWidget(TOSS_WIDGET_CLIENT_KEY, customerKey).then((widget) => {
      widgetRef.current = widget;
      methodsRef.current = widget.renderPaymentMethods("#cart-order-payment", { value: quote.amount }, { variantKey: "widgetK" });
      widget.renderAgreement("#cart-order-agreement", { variantKey: "AGREEMENT" });
    }).catch(() => setError("결제 UI를 불러오지 못했습니다."));
  }, [quote]);

  async function applyCoupon() {
    try {
      const next = await quoteCart({ cartItemIds, couponCode: couponCode.trim() || undefined });
      setQuote(next); await methodsRef.current?.updateAmount(next.amount); setError(null);
    } catch (err) { setError(getErrorMessage(err, "쿠폰을 적용하지 못했습니다.")); }
  }

  async function handlePay() {
    if (!addressId) { setError("배송지를 선택해주세요."); return; }
    if (!quote || !widgetRef.current) { setError("결제 정보를 불러오는 중입니다."); return; }
    setPaying(true);
    try {
      const order = await checkoutCart({ cartItemIds, deliveryAddressId: addressId, couponCode: couponCode.trim() || undefined });
      await methodsRef.current?.updateAmount(order.amount);
      await widgetRef.current.requestPayment({ orderId: order.orderId, orderName: order.orderName, customerName: addresses.find((address) => address.id === addressId)?.receiverName, successUrl: `${window.location.origin}/purchase/order/success`, failUrl: `${window.location.origin}/purchase/order/fail` });
    } catch (err) { setError(getErrorMessage(err, "결제 요청 중 오류가 발생했습니다.")); setPaying(false); }
  }

  if (busy) return <LoadingOverlay visible />;
  return <div className="pt-[var(--header-offset)]"><div className="mx-auto w-full max-w-[var(--max-width-content)] px-6 py-10 lg:px-0"><h1 className="mb-8 text-[28px] font-bold text-[var(--color-text)]">주문/결제</h1><div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_327px]">
    <section className="space-y-5"><div className="rounded-[14px] border border-[var(--color-text-muted)] p-5"><h2 className="mb-5 text-subtitle-18-b">주문 상품</h2>{cart?.items.map((item) => <article key={item.id} className="flex gap-4 border-t border-[var(--color-text-muted)] py-4 first:border-t-0"><img src={item.imageUrl ?? ""} alt="" className="h-24 w-24 rounded-[10px] bg-[var(--color-surface-warm)] object-cover" /><div><p className="text-subtitle-16-sb">{item.productName}</p><p className="mt-2 text-body-14-m text-[var(--color-text-secondary)]">수량 {item.quantity}개</p><strong className="mt-2 block">{formatKrwPrice(item.itemAmount)}</strong></div></article>)}</div>
      <div className="rounded-[14px] border border-[var(--color-text-muted)] p-5"><label htmlFor="cart-order-address" className="mb-3 block text-subtitle-18-b">배송지</label>{addresses.length ? <select id="cart-order-address" value={addressId ?? ""} onChange={(event) => setAddressId(Number(event.target.value))} className="h-11 w-full rounded-[8px] border border-[var(--color-text-muted)] bg-white px-3">{addresses.map((address) => <option key={address.id} value={address.id}>{address.nickname ?? address.receiverName} · {address.address}</option>)}</select> : <p className="text-body-14-m text-[var(--color-primary)]">등록된 배송지가 없습니다.</p>}</div>
      <div className="rounded-[14px] border border-[var(--color-text-muted)] p-5"><h2 className="text-subtitle-18-b">결제 수단</h2><div id="cart-order-payment" /><div id="cart-order-agreement" /></div>
    </section>
    <aside className="rounded-[14px] border border-[var(--color-text-muted)] p-5 md:sticky md:top-24 md:self-start"><h2 className="border-b border-[var(--color-text-muted)] pb-4 text-subtitle-18-b">결제 정보</h2><div className="my-5 flex gap-2"><input aria-label="쿠폰 코드" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="쿠폰 코드" className="h-10 min-w-0 flex-1 rounded-[6px] border border-[var(--color-text-muted)] px-3" /><button type="button" onClick={() => void applyCoupon()} className="rounded-[6px] border border-[var(--color-text-muted)] px-3 text-body-13-m">적용</button></div><dl className="space-y-3 border-y border-[var(--color-text-muted)] py-5 text-body-14-m"><div className="flex justify-between"><dt>상품 금액</dt><dd>{formatKrwPrice(quote?.itemsAmount ?? 0)}</dd></div><div className="flex justify-between"><dt>쿠폰 할인</dt><dd>-{formatKrwPrice(quote?.couponDiscountAmount ?? 0)}</dd></div><div className="flex justify-between"><dt>배송비</dt><dd>{formatKrwPrice(quote?.shippingFee ?? 0)}</dd></div></dl><div className="flex justify-between py-5 text-subtitle-18-b"><span>총 결제금액</span><strong>{formatKrwPrice(quote?.amount ?? 0)}</strong></div>{error && <p role="alert" className="mb-3 text-body-13-r text-[var(--color-primary)]">{error}</p>}<button type="button" onClick={() => void handlePay()} disabled={paying || !quote || !addressId} className="h-12 w-full rounded-[8px] bg-[var(--color-cta-button)] text-subtitle-16-b text-white disabled:opacity-40">{paying ? "결제 준비 중…" : "결제하기"}</button></aside>
  </div></div></div>;
}
