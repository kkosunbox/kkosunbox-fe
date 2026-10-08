"use client";
/* eslint-disable @next/next/no-img-element -- 상품 이미지는 백엔드의 동적 URL이다. */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { getCartGateway, type CartDto, type CartPriceDto } from "@/features/cart";
import { usePurchaseChoice } from "@/features/guest-order";
import { notifyCartUpdated } from "@/features/cart/lib/events";
import { getErrorMessage } from "@/shared/lib/api";
import { formatKrwPrice } from "@/shared/lib/format";
import { CheckoutPromotionBanner, LoadingOverlay, PageHeaderBand, QuantityMinusIcon, QuantityPlusIcon } from "@/shared/ui";
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
    {checked ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect width="20" height="20" rx="5" fill="var(--color-checkbox-checked)" /><path d="M4.1665 10.833L7.49984 14.1663L15.8332 5.83301" stroke="var(--color-surface-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> : <span className="h-5 w-5 rounded-[5px] border border-[var(--color-text-muted)] bg-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-checkbox-checked)]" />}
  </label>;
}

export default function CartPageClient() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const gateway = useMemo(() => getCartGateway(isLoggedIn), [isLoggedIn]);
  const { requestPurchase, purchaseChoiceModal } = usePurchaseChoice();
  const [cart, setCart] = useState<CartDto | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [quote, setQuote] = useState<CartPriceDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const selectedIds = useMemo(() => [...selected], [selected]);
  const orderableIds = useMemo(() => cart?.items.filter((item) => item.isOrderable).map((item) => item.id) ?? [], [cart]);
  const allSelected = orderableIds.length > 0 && orderableIds.every((id) => selected.has(id));

  const refresh = useCallback(async () => {
    const data = await gateway.getCart();
    setCart(data);
    setSelected((current) => new Set(data.items.filter((item) => item.isOrderable && current.has(item.id)).map((item) => item.id)));
    notifyCartUpdated();
  }, [gateway]);

  useEffect(() => {
    void gateway.getCart().then((data) => {
      setCart(data);
      setSelected(new Set(data.items.filter((item) => item.isOrderable).map((item) => item.id)));
    }).catch((err) => setError(getErrorMessage(err))).finally(() => setBusy(false));
  }, [gateway]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (selectedIds.length === 0) { setQuote(null); return; }
      void gateway.quote(selectedIds).then((data) => { setQuote(data); setError(null); }).catch((err) => { setQuote(null); setError(getErrorMessage(err, "주문 금액을 계산하지 못했습니다.")); });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [gateway, selectedIds, cart]);

  async function changeQuantity(id: number, quantity: number) {
    if (quantity < 1 || quantity > 99) return;
    try { setCart(await gateway.update(id, quantity)); notifyCartUpdated(); } catch (err) { setError(getErrorMessage(err)); }
  }
  async function remove(id: number) {
    try { await gateway.remove(id); setSelected((current) => { const next = new Set(current); next.delete(id); return next; }); await refresh(); } catch (err) { setError(getErrorMessage(err)); }
  }
  async function removeSelected() {
    if (!selectedIds.length) return;
    try { await Promise.all(selectedIds.map(gateway.remove)); setSelected(new Set()); await refresh(); } catch (err) { setError(getErrorMessage(err)); }
  }
  function proceedToOrder() {
    if (!selectedIds.length) { setError("주문할 상품을 선택해주세요."); return; }
    // 비회원은 구매 방법 선택 모달 → 회원 구매는 로그인 후 장바구니로 돌아온다(비회원 장바구니가 서버로 합쳐짐).
    requestPurchase({
      memberHref: isLoggedIn ? `/purchase/order?cartItemIds=${selectedIds.join(",")}` : "/cart",
      guestHref: `/purchase/guest-order?cartItemIds=${selectedIds.join(",")}`,
    });
  }

  if (busy) return <LoadingOverlay visible />;
  return <div className="flex flex-1 flex-col bg-white pt-[var(--header-offset)]">
    {purchaseChoiceModal}
    <PageHeaderBand title="장바구니" description="상품과 수량을 확인하신 후 주문을 진행해 주세요." backControl={<button type="button" onClick={() => router.back()} aria-label="이전 페이지"><Chevron back /></button>} />
    {!cart?.items.length ? <div className="mx-auto flex w-full max-w-[1240px] flex-1 justify-center max-xl:px-6 xl:px-0 pb-[106px] pt-[120px]"><CartEmptyState /></div> : <div className="mx-auto grid w-full max-w-[1240px] flex-1 gap-8 max-xl:px-6 xl:px-0 pb-[106px] pt-8 md:grid-cols-[minmax(0,1fr)_1px_301px] md:gap-x-12">
      <section className="min-w-0" aria-labelledby="cart-products-title">
        <div className="flex items-center justify-between border-b border-[var(--color-text-muted)] pb-4"><div className="flex items-center gap-3 text-subtitle-16-sb"><CartCheckbox checked={allSelected} label="전체 상품 선택" onChange={() => setSelected(allSelected ? new Set() : new Set(orderableIds))} /><span id="cart-products-title">전체 상품</span></div><Chevron /></div>
        {cart.items.map((item) => { const badge = getPackageBadge(item.productName, item.relatedPlanSlug); return <article key={item.id} className="grid border-b border-[var(--color-text-muted)] py-6 max-md:grid-cols-[20px_clamp(112px,34vw,136px)_minmax(0,1fr)] max-md:gap-3 max-md:pl-0 md:grid-cols-[20px_160px_minmax(0,1fr)] md:gap-5 md:pl-[26px]">
          <CartCheckbox checked={selected.has(item.id)} disabled={!item.isOrderable} label={`${item.productName} 선택`} onChange={() => setSelected((current) => { const next = new Set(current); if (next.has(item.id)) next.delete(item.id); else next.add(item.id); return next; })} />
          {item.imageUrl ? <img src={item.imageUrl} alt="" className="rounded-[14px] object-cover max-md:aspect-square max-md:h-auto max-md:w-full md:h-[148px] md:w-40" /> : <div className="rounded-[14px] bg-[var(--color-surface-warm)] max-md:aspect-square max-md:h-auto max-md:w-full md:h-[148px] md:w-40" />}
          <div className="relative flex min-w-0 flex-col max-md:pt-1 md:pt-4"><button type="button" onClick={() => void remove(item.id)} aria-label={`${item.productName} 삭제`} className="absolute right-0 top-0 text-[22px] leading-none text-[var(--color-text-secondary)]">×</button><div className="pr-6">{badge ? <span className={`inline-flex rounded-full px-3 py-1 text-body-13-sb text-white ${badge.className}`}>{badge.label}</span> : null}<h2 className="mt-3 line-clamp-2 break-words tracking-[-0.04em] text-[var(--color-text-emphasis)] max-md:text-body-14-sb md:text-subtitle-16-sb">{item.productName}</h2><p className="mt-3 flex flex-wrap gap-x-1 text-price-16-eb text-[var(--color-text-price)]"><span>단품 구매</span><span className="whitespace-nowrap">{formatKrwPrice(item.unitPrice)}</span></p></div>
            {!item.isOrderable && <p className="mt-2 text-body-13-r text-[var(--color-primary)]">{item.unavailableReason ?? "현재 주문할 수 없는 상품입니다."}</p>}
            <div className="mt-3 max-sm:flex max-sm:flex-col max-sm:items-stretch max-sm:gap-2 sm:flex sm:items-center sm:justify-between sm:gap-2"><div className="flex shrink-0 items-center gap-3"><button type="button" onClick={() => void changeQuantity(item.id, item.quantity - 1)} aria-label="수량 감소"><QuantityMinusIcon /></button><span className="min-w-3 text-center text-body-12-m">{item.quantity}</span><button type="button" onClick={() => void changeQuantity(item.id, item.quantity + 1)} aria-label="수량 증가"><QuantityPlusIcon /></button></div><strong className="whitespace-nowrap text-[var(--color-text-price)] max-sm:self-end max-sm:text-price-16-eb sm:text-price-16-eb md:text-price-20-eb">{formatKrwPrice(item.itemAmount)}</strong></div>
          </div>
        </article>; })}
        <button type="button" onClick={() => void removeSelected()} disabled={!selectedIds.length} className="mt-3 inline-flex h-9 items-center gap-2 rounded-[6px] border border-[var(--color-text-muted)] px-4 text-body-13-m text-[var(--color-text-secondary)] disabled:opacity-40"><span aria-hidden="true">×</span> 삭제</button>
      </section>
      <div className="max-md:hidden bg-[var(--color-text-muted)]" />
      <aside aria-labelledby="cart-summary-title"><div className="flex items-center justify-between border-b border-[var(--color-text-muted)] pb-4"><h2 id="cart-summary-title" className="text-subtitle-18-b">주문예상금액</h2><Chevron /></div><dl className="space-y-4 border-b border-[var(--color-text-muted)] py-6 text-body-14-m"><div className="flex justify-between"><dt>총 선택상품금액</dt><dd>{formatKrwPrice(quote?.itemsAmount ?? 0)}</dd></div><div className="flex justify-between"><dt>총 쿠폰 할인금액</dt><dd>-{formatKrwPrice(quote?.couponDiscountAmount ?? 0)}</dd></div><div className="flex justify-between"><dt>총 배송비</dt><dd>{formatKrwPrice(quote?.shippingFee ?? 0)}</dd></div></dl><div className="flex items-center justify-between py-5"><span className="text-subtitle-16-b">총 주문금액</span><strong className="text-price-20-eb-lh24">{formatKrwPrice(quote?.amount ?? 0)}</strong></div>{error && <p role="alert" className="mb-3 whitespace-pre-line text-body-13-r text-[var(--color-primary)]">{error}</p>}<button type="button" disabled={!quote || !selectedIds.length} onClick={proceedToOrder} className="h-12 w-full rounded-[8px] bg-[var(--color-cta-button)] text-subtitle-16-b text-white disabled:opacity-40">{selectedIds.length}건 주문하기</button><div className="mt-6"><CheckoutPromotionBanner /></div></aside>
    </div>}
  </div>;
}
