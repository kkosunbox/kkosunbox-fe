import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchCombinedPayment } from "@/features/payment/api/queries";
import type { OrderType } from "@/features/payment/api/types";
import { formatKrwPrice } from "@/shared/lib/format";
/* eslint-disable @next/next/no-img-element -- 주문 시점의 원격 이미지 스냅샷을 표시한다. */

export const metadata = { title: "주문 상세 | 꼬순박스" };

export default async function OrderDetailPage({ params }: { params: Promise<{ orderType: string; id: string }> }) {
  const token = await getServerToken();
  if (!token) redirect("/login?next=/orders");
  const { orderType: rawType, id: rawId } = await params;
  if (rawType !== "subscription" && rawType !== "product") notFound();
  const orderType = rawType as OrderType;
  const payment = await fetchCombinedPayment(orderType, Number(rawId), token);
  if (!payment) notFound();
  return <div className="mx-auto w-full max-w-[806px] px-6 pb-20 pt-[calc(var(--header-offset)+40px)]">
    <Link href="/orders" className="text-body-14-r text-[var(--color-text-secondary)]">← 주문내역</Link><div className="mt-5 flex items-center gap-4">{payment.orderType === "subscription" && payment.imageUrl ? <img src={payment.imageUrl} alt="" className="h-24 w-24 rounded-xl object-cover" /> : null}<h1 className="text-[28px] font-bold">{payment.name}</h1></div>
    <dl className="mt-6 grid gap-3 rounded-2xl bg-[var(--color-surface-warm)] p-6 text-body-14-r"><div className="flex justify-between"><dt>주문번호</dt><dd>{payment.orderId}</dd></div><div className="flex justify-between"><dt>결제금액</dt><dd>{formatKrwPrice(payment.amount)}</dd></div>{payment.refundedAmount ? <div className="flex justify-between"><dt>환불금액</dt><dd>{formatKrwPrice(payment.refundedAmount)}</dd></div> : null}{payment.shippingFee !== undefined ? <div className="flex justify-between"><dt>배송비</dt><dd>{formatKrwPrice(payment.shippingFee)}</dd></div> : null}<div className="flex justify-between"><dt>결제수단</dt><dd>{payment.method ?? "-"}</dd></div><div className="flex justify-between"><dt>송장번호</dt><dd>{payment.trackingNumber ?? "-"}</dd></div></dl>
    {payment.items.length > 0 && <section className="mt-8"><h2 className="text-[20px] font-bold">주문 상품</h2><div className="mt-3 divide-y rounded-2xl border border-[var(--color-divider-neutral)] px-5">{payment.items.map((item) => <article key={item.id} className="flex gap-4 py-4">{item.imageUrl ? <img src={item.imageUrl} alt="" className="h-20 w-20 rounded-xl object-cover" /> : <div className="h-20 w-20 rounded-xl bg-[var(--color-surface-warm)]" />}<div className="flex-1"><div className="flex items-start justify-between gap-2"><p className="font-semibold">{item.productName}</p>{item.relatedPlanId && item.relatedPlanSlug ? <span className="rounded-full bg-[var(--color-secondary)] px-2 py-0.5 text-[11px]">{item.relatedPlanSlug}</span> : null}</div><p className="mt-2 text-body-13-r text-[var(--color-text-secondary)]">수량 {item.quantity}개 · 환불 {item.refundedQuantity}개</p><p className="mt-1 font-semibold">{formatKrwPrice(item.allocatedAmount)}</p></div></article>)}</div></section>}
    {payment.deliveryAddress && <section className="mt-8"><h2 className="text-[20px] font-bold">배송지</h2><div className="mt-3 rounded-2xl border border-[var(--color-divider-neutral)] p-5 text-body-14-r"><p className="font-semibold">{payment.deliveryAddress.receiverName}</p><p className="mt-1">{payment.deliveryAddress.phoneNumber}</p><p className="mt-1">({payment.deliveryAddress.zipCode}) {payment.deliveryAddress.address} {payment.deliveryAddress.addressDetail}</p></div></section>}
  </div>;
}
