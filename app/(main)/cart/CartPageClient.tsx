"use client";
/* eslint-disable @next/next/no-img-element -- 상품 이미지는 백엔드의 동적 URL이다. */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCartItem, getCart, quoteCart, updateCartItem, type CartDto, type CartPriceDto } from "@/features/cart";
import { notifyCartUpdated } from "@/features/cart/lib/events";
import { getErrorMessage } from "@/shared/lib/api";
import { formatKrwPrice } from "@/shared/lib/format";
import { LoadingOverlay, QuantityMinusIcon, QuantityPlusIcon } from "@/shared/ui";
import { CartEmptyState } from "@/widgets/cart";

const Chevron = ({ back = false }: { back?: boolean }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={back ? "m15 5-7 7 7 7" : "m5 9 7 7 7-7"} stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;

const PACKAGE_BADGES = {
  basic: { label: "베이직", className: "bg-[var(--color-basic)]" },
  standard: { label: "스탠다드", className: "bg-[var(--color-plus)]" },
  premium: { label: "프리미엄", className: "bg-[var(--color-accent-orange)]" },
} as const;

function getPackageBadge(productName: string, relatedPlanSlug?: string | null) {
  if (!relatedPlanSlug || !/(패키지|box)/i.test(productName)) return null;
  const normalizedSlug = relatedPlanSlug.toLowerCase();
  return PACKAGE_BADGES[normalizedSlug as keyof typeof PACKAGE_BADGES] ?? null;
}

function CartCheckbox({ checked, disabled = false, label, onChange }: { checked: boolean; disabled?: boolean; label: string; onChange: () => void }) {
  return <label className={`relative inline-flex h-5 w-5 shrink-0 cursor-pointer ${disabled ? "cursor-not-allowed opacity-40" : ""}`}>
    <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={onChange} aria-label={label} />
    {checked ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect width="20" height="20" rx="5" fill="var(--color-accent)" /><path d="M4.1665 10.8335L7.49984 14.1668L15.8332 5.8335" stroke="var(--color-surface-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> : <span className="h-5 w-5 rounded-[5px] border border-[var(--color-text-muted)] bg-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-accent)]" />}
  </label>;
}

export default function CartPageClient() {
  const router = useRouter();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [quote, setQuote] = useState<CartPriceDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const selectedIds = useMemo(() => [...selected], [selected]);
  const orderableIds = useMemo(() => cart?.items.filter((item) => item.isOrderable).map((item) => item.id) ?? [], [cart]);
  const allSelected = orderableIds.length > 0 && orderableIds.every((id) => selected.has(id));

  const refresh = useCallback(async () => {
    const data = await getCart();
    setCart(data);
    setSelected((current) => new Set(data.items.filter((item) => item.isOrderable && current.has(item.id)).map((item) => item.id)));
    notifyCartUpdated();
  }, []);

  useEffect(() => {
    void getCart().then((data) => {
      setCart(data);
      setSelected(new Set(data.items.filter((item) => item.isOrderable).map((item) => item.id)));
    }).catch((err) => setError(getErrorMessage(err))).finally(() => setBusy(false));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (selectedIds.length === 0) { setQuote(null); return; }
      void quoteCart({ cartItemIds: selectedIds }).then((data) => { setQuote(data); setError(null); }).catch((err) => { setQuote(null); setError(getErrorMessage(err, "주문 금액을 계산하지 못했습니다.")); });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [selectedIds, cart]);

  async function changeQuantity(id: number, quantity: number) {
    if (quantity < 1 || quantity > 99) return;
    try { setCart(await updateCartItem(id, { quantity })); notifyCartUpdated(); } catch (err) { setError(getErrorMessage(err)); }
  }
  async function remove(id: number) {
    try { await deleteCartItem(id); setSelected((current) => { const next = new Set(current); next.delete(id); return next; }); await refresh(); } catch (err) { setError(getErrorMessage(err)); }
  }
  async function removeSelected() {
    if (!selectedIds.length) return;
    try { await Promise.all(selectedIds.map(deleteCartItem)); setSelected(new Set()); await refresh(); } catch (err) { setError(getErrorMessage(err)); }
  }
  function proceedToOrder() {
    if (!selectedIds.length) { setError("주문할 상품을 선택해주세요."); return; }
    router.push(`/purchase/order?cartItemIds=${selectedIds.join(",")}`);
  }

  if (busy) return <LoadingOverlay visible />;
  return <div className="flex flex-1 flex-col bg-white pt-[var(--header-offset)]">
    <section className="bg-[var(--color-banner-bg)]/10"><div className="mx-auto flex h-[148px] w-full max-w-[var(--max-width-content)] flex-col justify-center px-6 lg:px-0"><div className="flex items-center gap-1"><button type="button" onClick={() => router.back()} aria-label="이전 페이지"><Chevron back /></button><h1 className="text-[24px] font-bold tracking-[-0.04em] text-[var(--color-text)]">장바구니</h1></div><p className="ml-7 mt-2 text-body-16-m text-[var(--color-text-price)]">상품과 수량을 확인하신 후 주문을 진행해 주세요.</p></div></section>
    {!cart?.items.length ? <div className="mx-auto flex w-full max-w-[var(--max-width-content)] flex-1 justify-center px-6 pb-[106px] pt-[120px]"><CartEmptyState /></div> : <div className="mx-auto grid w-full max-w-[var(--max-width-content)] flex-1 gap-8 px-6 pb-[106px] pt-8 md:grid-cols-[minmax(0,1fr)_1px_315px] md:gap-x-12 lg:px-0">
      <section className="min-w-0" aria-labelledby="cart-products-title">
        <div className="flex items-center justify-between border-b border-[var(--color-text-muted)] pb-4"><div className="flex items-center gap-3 text-subtitle-16-sb"><CartCheckbox checked={allSelected} label="전체 상품 선택" onChange={() => setSelected(allSelected ? new Set() : new Set(orderableIds))} /><span id="cart-products-title">전체 상품</span></div><Chevron /></div>
        {cart.items.map((item) => { const badge = getPackageBadge(item.productName, item.relatedPlanSlug); return <article key={item.id} className="grid grid-cols-[20px_160px_minmax(0,1fr)] gap-5 border-b border-[var(--color-text-muted)] py-6 pl-[26px] max-sm:grid-cols-[20px_112px_minmax(0,1fr)] max-sm:gap-3 max-sm:pl-0">
          <CartCheckbox checked={selected.has(item.id)} disabled={!item.isOrderable} label={`${item.productName} 선택`} onChange={() => setSelected((current) => { const next = new Set(current); if (next.has(item.id)) next.delete(item.id); else next.add(item.id); return next; })} />
          {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-[148px] w-40 rounded-[14px] object-cover max-sm:h-28 max-sm:w-28" /> : <div className="h-[148px] w-40 rounded-[14px] bg-[var(--color-surface-warm)] max-sm:h-28 max-sm:w-28" />}
          <div className="relative flex min-w-0 flex-col pt-4"><button type="button" onClick={() => void remove(item.id)} aria-label={`${item.productName} 삭제`} className="absolute right-0 top-0 text-[22px] leading-none text-[var(--color-text-secondary)]">×</button><div>{badge ? <span className={`inline-flex rounded-full px-3 py-1 text-body-13-sb text-white ${badge.className}`}>{badge.label}</span> : null}<h2 className="mt-3 text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text-emphasis)]">{item.productName}</h2><p className="mt-3 text-price-16-eb text-[var(--color-text-price)]">단품 구매 {formatKrwPrice(item.unitPrice)}</p></div>
            {!item.isOrderable && <p className="mt-2 text-body-13-r text-[var(--color-primary)]">{item.unavailableReason ?? "현재 주문할 수 없는 상품입니다."}</p>}
            <div className="mt-3 flex items-center justify-between"><div className="flex items-center gap-3"><button type="button" onClick={() => void changeQuantity(item.id, item.quantity - 1)} aria-label="수량 감소"><QuantityMinusIcon /></button><span className="min-w-3 text-center text-body-12-m">{item.quantity}</span><button type="button" onClick={() => void changeQuantity(item.id, item.quantity + 1)} aria-label="수량 증가"><QuantityPlusIcon /></button></div><strong className="text-price-20-eb text-[var(--color-text-price)] max-sm:hidden">{formatKrwPrice(item.itemAmount)}</strong></div>
          </div>
        </article>; })}
        <button type="button" onClick={() => void removeSelected()} disabled={!selectedIds.length} className="mt-3 inline-flex h-9 items-center gap-2 rounded-[6px] border border-[var(--color-text-muted)] px-4 text-body-13-m text-[var(--color-text-secondary)] disabled:opacity-40"><span aria-hidden="true">×</span> 삭제</button>
      </section>
      <div className="max-md:hidden bg-[var(--color-text-muted)]" />
      <aside aria-labelledby="cart-summary-title"><div className="flex items-center justify-between border-b border-[var(--color-text-muted)] pb-4"><h2 id="cart-summary-title" className="text-subtitle-18-b">주문예상금액</h2><Chevron /></div><dl className="space-y-4 border-b border-[var(--color-text-muted)] py-6 text-body-14-m"><div className="flex justify-between"><dt>총 선택상품금액</dt><dd>{formatKrwPrice(quote?.itemsAmount ?? 0)}</dd></div><div className="flex justify-between"><dt>총 쿠폰 할인금액</dt><dd>-{formatKrwPrice(quote?.couponDiscountAmount ?? 0)}</dd></div><div className="flex justify-between"><dt>총 배송비</dt><dd>{formatKrwPrice(quote?.shippingFee ?? 0)}</dd></div></dl><div className="flex items-center justify-between py-5"><span className="text-subtitle-16-b">총 주문금액</span><strong className="text-price-20-eb-lh24">{formatKrwPrice(quote?.amount ?? 0)}</strong></div>{error && <p role="alert" className="mb-3 whitespace-pre-line text-body-13-r text-[var(--color-primary)]">{error}</p>}<button type="button" disabled={!quote || !selectedIds.length} onClick={proceedToOrder} className="h-12 w-full rounded-[8px] bg-[var(--color-cta-button)] text-subtitle-16-b text-white disabled:opacity-40">{selectedIds.length}건 주문하기</button><img src="/images/sidebar-banner-001.png" alt="꼬순박스 안내 배너" className="mt-6 h-auto w-full rounded-[8px]" /></aside>
    </div>}
  </div>;
}
