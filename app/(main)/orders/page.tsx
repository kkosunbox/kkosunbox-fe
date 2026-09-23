import Link from "next/link";
/* eslint-disable @next/next/no-img-element -- 결제 이미지 스냅샷은 서버의 동적 원격 URL이다. */
import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchCombinedPaymentHistory, fetchCombinedPaymentTypeSummary } from "@/features/payment/api/queries";
import type { CombinedPaymentDto, OrderType } from "@/features/payment/api/types";
import { getPackageTierBySlug, TIER_BOX_IMAGES, TIER_LABEL, type PackageTier } from "@/entities/package";
import { formatKrwPrice } from "@/shared/lib/format";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

const STATUS_LABEL = { pending: "결제 대기", failed: "결제 실패", preparing: "배송준비중", shipping: "배송중", delivered: "배송완료", refunded: "전액 환불", partially_refunded: "부분 환불" } as const;
const TIER_STYLE: Record<PackageTier, string> = {
  Premium: "bg-[var(--color-premium)]",
  Standard: "bg-[var(--color-plus)]",
  Basic: "bg-[var(--color-basic)]",
};
const OUTLINE_BUTTON = "flex min-h-10 items-center justify-center rounded-[8px] border border-[var(--color-cta-button)] px-3 text-btn-14-m text-[var(--color-cta-button)] transition-colors hover:bg-[var(--color-surface-warm)]";

export const metadata = { title: "주문내역 | 꼬순박스", ...NOINDEX_METADATA };

function Chevron({ back = false }: { back?: boolean }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={back ? "rotate-180" : undefined}><path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function StatusBadge({ status }: { status: CombinedPaymentDto["displayStatus"] }) {
  const shipping = status === "shipping" || status === "preparing";
  return <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-btn-12-m ${shipping ? "border-[var(--color-status-success)]/15 bg-[var(--color-status-success-bg)]/40 text-[var(--color-status-success)]" : "border-[var(--color-text-muted)] bg-[var(--color-surface-light)] text-[var(--color-text-secondary)]"}`}>
    {shipping && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 5h11v12H3V5Zm11 5h4l3 4v3h-7M7 5v6H3" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="7" cy="18" r="2.5" fill="var(--color-surface-light)" stroke="currentColor" strokeWidth="1.8" /><circle cx="17" cy="18" r="2.5" fill="var(--color-surface-light)" stroke="currentColor" strokeWidth="1.8" /></svg>}
    {status === "delivered" && <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.5" stroke="currentColor" /><path d="m5 8 2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    {STATUS_LABEL[status]}
  </span>;
}

function OrderProduct({ name, imageUrl, slug, subscription, quantity = 1 }: { name: string; imageUrl?: string | null; slug?: string | null; subscription: boolean; quantity?: number }) {
  const tier = getPackageTierBySlug(slug ?? "") ?? (/프리미엄|premium/i.test(name) ? "Premium" : /스탠다드|standard/i.test(name) ? "Standard" : /베이직|basic/i.test(name) ? "Basic" : null);
  const src = imageUrl || (tier ? TIER_BOX_IMAGES[tier].src : null);
  return <div className="flex min-w-0 items-center max-md:gap-4 md:gap-8">
    <div className="shrink-0 overflow-hidden rounded-[12px] bg-[var(--color-surface-light)] max-md:h-[88px] max-md:w-[88px] md:h-[110px] md:w-[120px]">
      {src ? <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-body-13-r text-[var(--color-text-secondary)]">상품 이미지</span>}
    </div>
    <div className="min-w-0">
      {subscription && tier && <span className={`mb-2 inline-flex rounded-full px-3 py-0.5 text-btn-14-m text-white ${TIER_STYLE[tier]}`}>{TIER_LABEL[tier]}</span>}
      <div className="flex flex-wrap items-center gap-2"><h2 className="break-words text-subtitle-18-b text-[var(--color-text)] max-md:text-body-14-sb">{name}</h2>{!subscription && <span className="shrink-0 rounded bg-[var(--color-surface-light)] px-1 text-btn-12-m text-[var(--color-text-secondary)]">단품</span>}</div>
      <p className="mt-2 text-body-16-r text-[var(--color-text-secondary)] max-md:text-body-13-r">{subscription ? "구독상품" : "단품상품"}{quantity > 1 ? ` · ${quantity}개` : ""}</p>
    </div>
  </div>;
}

function OrderCard({ payment }: { payment: CombinedPaymentDto }) {
  const subscription = payment.orderType === "subscription";
  const multiple = !subscription && payment.items.length > 1;
  const detailHref = `/orders/${payment.orderType}/${payment.id}`;
  return <article className={`border border-[var(--color-text-muted)] bg-white max-md:rounded-[14px] max-md:p-4 md:px-[35px] md:py-5 ${multiple ? "md:rounded-[12px]" : "md:rounded-[20px]"}`}>
    <div className="flex justify-between gap-3 max-md:items-start md:items-center">
      <div className="flex min-w-0 max-md:flex-col max-md:gap-1 md:flex-wrap md:items-center md:gap-4"><h2 className="break-all text-body-16-sb text-[var(--color-text)] max-md:text-body-13-r">주문번호 {payment.orderId}</h2><time dateTime={payment.createdAt} className="shrink-0 text-body-14-r text-[var(--color-text-secondary)] max-md:text-body-13-r">{payment.createdAt.slice(0, 10).replace(/-/g, ".")}</time></div>
      <div className="flex shrink-0 items-center gap-3"><StatusBadge status={payment.displayStatus} /><Link href={detailHref} aria-label={`주문 ${payment.orderId} 상세보기`} className="text-[var(--color-text-secondary)]"><Chevron /></Link></div>
    </div>
    <div className={`mt-4 flex max-md:flex-col max-md:gap-5 md:items-stretch md:gap-8 ${subscription ? "md:min-h-[148px]" : "md:min-h-[110px]"}`}>
      <div className={`min-w-0 flex-1 ${multiple ? "grid items-center gap-y-6 max-lg:grid-cols-1 lg:grid-cols-2 lg:gap-x-8 lg:[&>div:nth-child(even)]:border-l lg:[&>div:nth-child(even)]:border-[var(--color-text-muted)] lg:[&>div:nth-child(even)]:pl-8" : "flex items-center"}`}>
        {subscription || payment.items.length === 0 ? <OrderProduct name={payment.name} imageUrl={payment.imageUrl} slug={payment.planSlug} subscription={subscription} /> : payment.items.map((item) => <OrderProduct key={item.id} name={item.productName} imageUrl={item.imageUrl} slug={item.relatedPlanSlug} quantity={item.quantity} subscription={false} />)}
      </div>
      <div className="flex shrink-0 flex-col justify-center border-[var(--color-text-muted)] max-md:border-t max-md:pt-4 md:w-[172px] md:border-l md:pl-[29px]">
        <div className="max-md:flex max-md:items-center max-md:justify-between"><p className="text-body-13-r text-[var(--color-text-secondary)]">총 결제금액</p><p className="text-price-20-eb text-[var(--color-text)]">{formatKrwPrice(payment.amount)}</p></div>
        <div className="mt-4 grid gap-2 max-md:grid-cols-2"><Link href={detailHref} className={`${OUTLINE_BUTTON} ${!subscription ? "max-md:col-span-2" : ""}`}>주문 상세보기</Link>{subscription && <Link href={payment.subscriptionId ? `/mypage/subscription/detail?subscriptionId=${payment.subscriptionId}` : "/mypage/subscription"} className={OUTLINE_BUTTON}>구독관리</Link>}</div>
      </div>
    </div>
  </article>;
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ orderType?: string; page?: string }> }) {
  const token = await getServerToken();
  if (!token) redirect("/login?next=/orders");
  const params = await searchParams;
  const orderType: OrderType | undefined = params.orderType === "subscription" || params.orderType === "product" ? params.orderType : undefined;
  const requestedPage = Number(params.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [history, summary] = await Promise.all([fetchCombinedPaymentHistory(token, { orderType, page, limit: 4 }), fetchCombinedPaymentTypeSummary(token)]);
  const tabs = [{ label: "전체", value: undefined, count: summary.subscriptionCount + summary.productCount }, { label: "구독제품", value: "subscription" as const, count: summary.subscriptionCount }, { label: "단품제품", value: "product" as const, count: summary.productCount }];
  const totalPages = Math.max(1, Math.ceil(history.total / history.limit));
  const pageHref = (value: number) => `/orders?${orderType ? `orderType=${orderType}&` : ""}page=${value}`;
  if (page > totalPages) redirect(pageHref(totalPages));
  const firstPage = Math.max(1, Math.min(page - 2, totalPages - 4));

  return <div className="bg-white pt-[var(--header-offset)]">
    <header className="bg-[var(--color-subscription-header-bg)]">
      <div className="mx-auto w-full max-w-[1060px] px-6 max-md:py-8 md:py-[38px]">
        <div className="flex items-center gap-1"><Link href="/mypage" aria-label="마이페이지로 돌아가기" className="text-[var(--color-text-secondary)]"><Chevron back /></Link><h1 className="text-title-24-b text-[var(--color-text)] max-md:text-display-20-eb">주문내역</h1></div>
        <p className="mt-2 pl-7 text-body-16-m text-[var(--color-text-on-warm)] max-md:text-body-13-r">지금까지의 주문 내역을 한눈에 확인해보세요.</p>
      </div>
    </header>
    <section aria-label="주문 내역" className="mx-auto w-full max-w-[1060px] px-6 pt-8 max-md:pb-12 md:pb-[52px]">
      <nav className="flex flex-wrap gap-2" aria-label="주문 유형">{tabs.map((tab) => { const active = tab.value === orderType; return <Link key={tab.label} href={tab.value ? `/orders?orderType=${tab.value}` : "/orders"} aria-current={active ? "page" : undefined} className={`inline-flex min-h-9 items-center rounded-full border px-5 text-btn-14-m max-md:px-4 ${active ? "border-[var(--color-cta-button)] bg-[var(--color-cta-button)] text-white" : "border-[var(--color-text-muted)] text-[var(--color-text-label)] hover:bg-[var(--color-surface-light)]"}`}>{tab.label} {tab.count}</Link>; })}</nav>
      <div className="mt-8 max-md:space-y-4 md:space-y-8">{history.payments.length === 0 ? <p className="rounded-2xl bg-[var(--color-surface-warm)] px-6 py-20 text-center text-[var(--color-text-secondary)]">주문 내역이 없습니다.</p> : history.payments.map((payment) => <OrderCard key={`${payment.orderType}-${payment.id}`} payment={payment} />)}</div>
      {totalPages > 1 && <nav className="mt-6 flex items-center justify-center gap-1" aria-label="주문내역 페이지">
        {page > 1 ? <Link href={pageHref(page - 1)} aria-label="이전 페이지" className="p-1 text-[var(--color-text-secondary)]"><Chevron back /></Link> : <span aria-disabled="true" aria-label="이전 페이지" className="p-1 text-[var(--color-text-muted)]"><Chevron back /></span>}
        {Array.from({ length: Math.min(5, totalPages) }, (_, index) => firstPage + index).map((value) => <Link key={value} href={pageHref(value)} aria-label={`${value}페이지`} aria-current={value === page ? "page" : undefined} className={`flex h-8 w-6 items-center justify-center text-body-13-r ${value === page ? "font-bold text-[var(--color-text)]" : "text-[var(--color-text-secondary)]"}`}>{value}</Link>)}
        {page < totalPages ? <Link href={pageHref(page + 1)} aria-label="다음 페이지" className="p-1 text-[var(--color-text-secondary)]"><Chevron /></Link> : <span aria-disabled="true" aria-label="다음 페이지" className="p-1 text-[var(--color-text-muted)]"><Chevron /></span>}
      </nav>}
    </section>
  </div>;
}
