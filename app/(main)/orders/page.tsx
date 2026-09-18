import Link from "next/link";
/* eslint-disable @next/next/no-img-element -- 결제 이미지 스냅샷은 서버의 동적 원격 URL이다. */
import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchCombinedPaymentHistory, fetchCombinedPaymentTypeSummary } from "@/features/payment/api/queries";
import type { OrderType } from "@/features/payment/api/types";
import { formatKrwPrice } from "@/shared/lib/format";

const STATUS_LABEL = { pending: "결제 대기", failed: "결제 실패", preparing: "배송 준비중", shipping: "배송중", delivered: "배송완료", refunded: "전액 환불", partially_refunded: "부분 환불" } as const;

export const metadata = { title: "주문내역 | 꼬순박스" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ orderType?: string; page?: string }> }) {
  const token = await getServerToken();
  if (!token) redirect("/login?next=/orders");
  const params = await searchParams;
  const orderType: OrderType | undefined = params.orderType === "subscription" || params.orderType === "product" ? params.orderType : undefined;
  const page = Math.max(1, Number(params.page) || 1);
  const [history, summary] = await Promise.all([fetchCombinedPaymentHistory(token, { orderType, page, limit: 20 }), fetchCombinedPaymentTypeSummary(token)]);
  const tabs = [{ label: "전체", value: undefined, count: summary.subscriptionCount + summary.productCount }, { label: "구독", value: "subscription" as const, count: summary.subscriptionCount }, { label: "단품", value: "product" as const, count: summary.productCount }];
  const totalPages = Math.max(1, Math.ceil(history.total / history.limit));
  return <div className="mx-auto w-full max-w-content px-6 pb-20 pt-[calc(var(--header-offset)+40px)]">
    <h1 className="text-[28px] font-bold text-[var(--color-text)]">주문내역</h1>
    <nav className="mt-6 flex gap-2 border-b border-[var(--color-divider-neutral)]">{tabs.map((tab) => { const active = tab.value === orderType; return <Link key={tab.label} href={tab.value ? `/orders?orderType=${tab.value}` : "/orders"} className={`px-4 py-3 text-body-14-sb ${active ? "border-b-2 border-[var(--color-primary)] text-primary" : "text-[var(--color-text-secondary)]"}`}>{tab.label} {tab.count}</Link>; })}</nav>
    <div className="mt-6 space-y-4">{history.payments.length === 0 ? <p className="rounded-2xl bg-[var(--color-surface-warm)] p-12 text-center text-[var(--color-text-secondary)]">주문 내역이 없습니다.</p> : history.payments.map((payment) => <Link key={`${payment.orderType}-${payment.id}`} href={`/orders/${payment.orderType}/${payment.id}`} className="block rounded-2xl border border-[var(--color-divider-neutral)] p-5 transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex gap-4">{(payment.orderType === "subscription" ? payment.imageUrl : payment.items[0]?.imageUrl) ? <img src={(payment.orderType === "subscription" ? payment.imageUrl : payment.items[0]?.imageUrl)!} alt="" className="h-20 w-20 rounded-xl object-cover" /> : null}<div><span className="rounded-full bg-[var(--color-secondary)] px-2 py-1 text-[11px]">{payment.orderType === "subscription" ? "구독" : "단품"}</span><h2 className="mt-3 font-semibold text-[var(--color-text)]">{payment.name}</h2><p className="mt-1 text-body-13-r text-[var(--color-text-secondary)]">주문번호 {payment.orderId}</p></div></div><div className="text-right"><p className="font-bold">{formatKrwPrice(payment.amount)}</p><p className="mt-1 text-body-13-r text-[var(--color-primary)]">{STATUS_LABEL[payment.displayStatus]}</p></div></div>
      {payment.orderType === "product" && <div className="mt-4 space-y-2 border-t pt-4">{payment.items.map((item) => <div key={item.id} className="flex items-center justify-between text-body-13-r"><span>{item.productName} × {item.quantity}</span><span>{formatKrwPrice(item.allocatedAmount)}</span></div>)}</div>}
    </Link>)}</div>
    {totalPages > 1 && <nav className="mt-8 flex justify-center gap-2" aria-label="주문내역 페이지">{Array.from({ length: totalPages }, (_, index) => index + 1).map((value) => <Link key={value} href={`/orders?${orderType ? `orderType=${orderType}&` : ""}page=${value}`} className={`flex h-8 w-8 items-center justify-center rounded-full ${value === page ? "bg-[var(--color-text)] text-white" : "text-[var(--color-text-secondary)]"}`}>{value}</Link>)}</nav>}
  </div>;
}
