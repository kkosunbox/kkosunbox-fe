"use client";
/* eslint-disable @next/next/no-img-element -- 상품 이미지는 백엔드 원격 URL이라 호스트가 동적이다. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { loadPaymentWidget, type PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { clearCart, checkoutCart, deleteCartItem, getCart, quoteCart, updateCartItem, type CartDto, type CartPriceDto } from "@/features/cart";
import { notifyCartUpdated } from "@/features/cart/lib/events";
import { getDeliveryAddresses, type DeliveryAddress } from "@/features/delivery-address/api";
import { getErrorMessage } from "@/shared/lib/api";
import { TOSS_WIDGET_CLIENT_KEY } from "@/shared/lib/payments/tossWidgetClient";
import { formatKrwPrice } from "@/shared/lib/format";
import { Button, LoadingOverlay } from "@/shared/ui";
import { CartEmptyState } from "@/widgets/cart";

type PaymentMethodsWidget = ReturnType<PaymentWidgetInstance["renderPaymentMethods"]>;

export default function CartPageClient() {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [quote, setQuote] = useState<CartPriceDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [paying, setPaying] = useState(false);
  const widgetRef = useRef<PaymentWidgetInstance | null>(null);
  const methodsRef = useRef<PaymentMethodsWidget | null>(null);
  const selectedIds = useMemo(() => [...selected], [selected]);

  const refresh = useCallback(async () => {
    const data = await getCart();
    setCart(data);
    setSelected((current) => new Set(data.items.filter((item) => item.isOrderable && (current.size === 0 || current.has(item.id))).map((item) => item.id)));
    notifyCartUpdated();
  }, []);

  useEffect(() => {
    void Promise.all([getCart(), getDeliveryAddresses()])
      .then(([cartData, addressData]) => {
        setCart(cartData);
        setSelected(new Set(cartData.items.filter((item) => item.isOrderable).map((item) => item.id)));
        setAddresses(addressData.addresses);
        setAddressId(addressData.addresses[0]?.id ?? null);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setBusy(false));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (selectedIds.length === 0) { setQuote(null); return; }
      void quoteCart({ cartItemIds: selectedIds, couponCode: couponCode.trim() || undefined })
        .then((data) => { setQuote(data); setError(null); methodsRef.current?.updateAmount(data.amount); })
        .catch((err) => { setQuote(null); setError(getErrorMessage(err, "결제 금액을 계산하지 못했습니다.")); });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [selectedIds, couponCode]);

  useEffect(() => {
    if (!quote || widgetRef.current) return;
    const customerKey = crypto.randomUUID?.() ?? `cart-${Date.now()}`;
    void loadPaymentWidget(TOSS_WIDGET_CLIENT_KEY, customerKey).then((widget) => {
      widgetRef.current = widget;
      methodsRef.current = widget.renderPaymentMethods("#cart-payment-widget", { value: quote.amount }, { variantKey: "widgetK" });
      widget.renderAgreement("#cart-payment-agreement", { variantKey: "AGREEMENT" });
    }).catch(() => setError("결제 UI를 불러오지 못했습니다."));
  }, [quote]);

  async function changeQuantity(id: number, quantity: number) {
    if (quantity < 1 || quantity > 99) return;
    try { setCart(await updateCartItem(id, { quantity })); notifyCartUpdated(); }
    catch (err) { setError(getErrorMessage(err)); }
  }

  async function remove(id: number) {
    try { await deleteCartItem(id); setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; }); await refresh(); }
    catch (err) { setError(getErrorMessage(err)); }
  }

  async function handlePay() {
    if (!addressId) { setError("배송지를 선택해주세요."); return; }
    if (!quote || !widgetRef.current || selectedIds.length === 0) { setError("결제할 상품을 선택해주세요."); return; }
    setPaying(true);
    try {
      const order = await checkoutCart({ cartItemIds: selectedIds, deliveryAddressId: addressId, couponCode: couponCode.trim() || undefined });
      await methodsRef.current?.updateAmount(order.amount);
      await widgetRef.current.requestPayment({
        orderId: order.orderId,
        orderName: order.orderName,
        customerName: addresses.find((address) => address.id === addressId)?.receiverName,
        successUrl: `${window.location.origin}/purchase/order/success`,
        failUrl: `${window.location.origin}/purchase/order/fail`,
      });
    } catch (err) { setError(getErrorMessage(err, "결제 요청 중 오류가 발생했습니다.")); setPaying(false); }
  }

  if (busy) return <LoadingOverlay visible />;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 pb-20 pt-[calc(var(--header-offset)+40px)]">
      <div className="mb-8 flex items-center justify-between"><h1 className="text-[28px] font-bold text-[var(--color-text)]">장바구니</h1>{cart?.items.length ? <button onClick={() => void clearCart().then(refresh)} className="text-body-13-r text-[var(--color-text-secondary)] underline">전체 비우기</button> : null}</div>
      {!cart?.items.length ? <CartEmptyState /> : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">
            {cart.items.map((item) => <article key={item.id} className={`flex gap-4 rounded-2xl border p-4 ${item.isOrderable ? "border-[var(--color-divider-neutral)]" : "border-[var(--color-primary)] opacity-70"}`}>
              <input type="checkbox" checked={selected.has(item.id)} disabled={!item.isOrderable} onChange={() => setSelected((prev) => { const next = new Set(prev); if (next.has(item.id)) next.delete(item.id); else next.add(item.id); return next; })} aria-label={`${item.productName} 선택`} />
              {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-24 w-24 rounded-xl object-cover" /> : <div className="h-24 w-24 rounded-xl bg-[var(--color-surface-warm)]" />}
              <div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><div><p className="font-semibold text-[var(--color-text)]">{item.productName}</p>{item.relatedPlanId && item.relatedPlanSlug ? <span className="mt-1 inline-block rounded-full bg-[var(--color-secondary)] px-2 py-0.5 text-[11px]">{item.relatedPlanSlug}</span> : null}</div><button onClick={() => void remove(item.id)} aria-label={`${item.productName} 삭제`} className="text-[var(--color-text-secondary)]">×</button></div>
                {!item.isOrderable && <p className="mt-2 text-body-13-r text-[var(--color-primary)]">{item.unavailableReason ?? "현재 주문할 수 없는 상품입니다."}</p>}
                <div className="mt-4 flex items-center justify-between"><div className="flex items-center rounded border border-[var(--color-divider-neutral)]"><button className="h-8 w-8" onClick={() => void changeQuantity(item.id, item.quantity - 1)}>−</button><span className="w-8 text-center">{item.quantity}</span><button className="h-8 w-8" onClick={() => void changeQuantity(item.id, item.quantity + 1)}>+</button></div><strong>{formatKrwPrice(item.itemAmount)}</strong></div>
              </div>
            </article>)}
          </div>
          <aside className="space-y-5 rounded-2xl bg-[var(--color-surface-warm)] p-6 lg:sticky lg:top-24 lg:self-start">
            <div><label htmlFor="cart-address" className="mb-2 block font-semibold">배송지</label>{addresses.length ? <select id="cart-address" value={addressId ?? ""} onChange={(event) => setAddressId(Number(event.target.value))} className="h-11 w-full rounded-lg border bg-white px-3">{addresses.map((address) => <option key={address.id} value={address.id}>{address.nickname ?? address.receiverName} · {address.address}</option>)}</select> : <Link href="/address" className="text-primary underline">배송지를 먼저 등록해주세요.</Link>}</div>
            <div><label htmlFor="cart-coupon" className="mb-2 block font-semibold">쿠폰 코드</label><input id="cart-coupon" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} className="h-11 w-full rounded-lg border bg-white px-3" placeholder="쿠폰 코드 입력" /></div>
            <dl className="space-y-2 border-t pt-4 text-body-14-r"><div className="flex justify-between"><dt>상품 금액</dt><dd>{formatKrwPrice(quote?.itemsAmount ?? 0)}</dd></div><div className="flex justify-between"><dt>쿠폰 할인</dt><dd>-{formatKrwPrice(quote?.couponDiscountAmount ?? 0)}</dd></div><div className="flex justify-between"><dt>배송비</dt><dd>{formatKrwPrice(quote?.shippingFee ?? 0)}</dd></div><div className="flex justify-between pt-2 text-[18px] font-bold"><dt>결제 금액</dt><dd>{formatKrwPrice(quote?.amount ?? 0)}</dd></div></dl>
            {error && <p role="alert" className="whitespace-pre-line text-body-13-r text-[var(--color-primary)]">{error}</p>}
            <div id="cart-payment-widget" className="-mx-6" /><div id="cart-payment-agreement" className="-mx-6" />
            <Button className="w-full" disabled={paying || !quote || !addressId} onClick={() => void handlePay()}>{paying ? "결제 준비 중…" : "결제하기"}</Button>
          </aside>
        </div>
      )}
    </div>
  );
}
