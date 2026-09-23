"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CombinedPaymentDto } from "@/features/payment/api/types";
import { cancelProductOrder, getProductOrderReceipt } from "@/features/product/api/productApi";
import { getPaymentReceipt } from "@/features/subscription/api";
import { getPackageTierBySlug, TIER_BOX_IMAGES } from "@/entities/package";
import { useModal } from "@/shared/ui";
import { getErrorMessage } from "@/shared/lib/api";
import { formatKrwPrice } from "@/shared/lib/format";

/* eslint-disable @next/next/no-img-element -- 주문 시점의 원격 이미지 스냅샷을 표시한다. */
const STATUS_LABEL = { pending: "결제 대기", failed: "결제 실패", preparing: "배송준비중", shipping: "배송중", delivered: "배송완료", refunded: "전액 환불", partially_refunded: "부분 환불" } as const;
const CARD = "grid rounded-[20px] border border-[var(--color-text-muted)] max-md:grid-cols-1 max-md:gap-6 max-md:p-5 md:grid-cols-2 md:px-[35px] md:py-5";
const RIGHT = "min-w-0 border-[var(--color-text-muted)] max-md:border-t max-md:pt-6 md:border-l md:pl-[35px]";
const HEADING = "mb-4 text-subtitle-18-b text-[var(--color-text)]";

function DeliveryProgress({ payment }: { payment: CombinedPaymentDto }) {
  const deliveryStep = payment.deliveryStatus === "DeliveryCompleted" ? 2 : payment.deliveryStatus === "DeliveryInProgress" ? 1 : payment.deliveryStatus === "PendingDelivery" ? 0 : null;
  const step = payment.displayStatus === "preparing" ? 0 : payment.displayStatus === "shipping" ? 1 : payment.displayStatus === "delivered" ? 2 : payment.displayStatus === "partially_refunded" ? deliveryStep : null;
  const labels = ["배송준비중", "배송중", "배송완료"];
  return <>
    {step === null ? <p className="rounded-xl bg-[var(--color-surface-light)] px-4 py-5 text-body-14-m text-[var(--color-text-secondary)]">{STATUS_LABEL[payment.displayStatus]}</p> : <div className="pt-3" aria-label={`배송 상태: ${labels[step]}`}>
      <div className="mx-5 h-2 rounded-full bg-[var(--color-text-muted)]">
        <div className="relative h-full rounded-full bg-[var(--color-cta-button)]" style={{ width: `${step * 50}%` }}><span className="absolute right-0 top-1/2 h-6 w-6 translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[var(--color-cta-button)] bg-white" /></div>
      </div>
      <ol className="mt-6 flex justify-between text-body-13-r text-[var(--color-text-secondary)]">{labels.map((label, index) => <li key={label} aria-current={step === index ? "step" : undefined} className={step === index ? "rounded-full bg-[var(--color-surface-warm)] px-3 text-[var(--color-cta-button)]" : undefined}>{label}</li>)}</ol>
      {payment.displayStatus === "partially_refunded" && <p className="mt-2 text-body-13-r text-[var(--color-text-secondary)]">부분 환불</p>}
    </div>}
    {payment.trackingNumber && <p className="mt-3 break-all text-body-13-r text-[var(--color-text-secondary)]">송장번호 {payment.trackingNumber}</p>}
  </>;
}

export default function OrderDetailSection({ payment }: { payment: CombinedPaymentDto }) {
  const router = useRouter();
  const { openAlert } = useModal();
  const [busy, setBusy] = useState(false);
  const subscription = payment.orderType === "subscription";
  const address = payment.deliveryAddress;
  const canCancel = !subscription && payment.deliveryStatus === "PendingDelivery" && (payment.status === "completed" || payment.status === "partially_refunded") && payment.items.some(item => item.quantity > item.refundedQuantity);
  const canReceipt = payment.status === "completed" || payment.status === "partially_refunded" || payment.status === "refunded";
  const products = subscription || !payment.items.length
    ? [{ id: payment.id, productName: payment.name, imageUrl: payment.imageUrl, relatedPlanSlug: payment.planSlug, quantity: undefined, refundedQuantity: 0 }]
    : payment.items;

  async function openReceipt() {
    setBusy(true);
    // 클릭 이벤트 안에서 창을 열어 비동기 API 응답 이후 팝업 차단을 방지한다.
    const popup = window.open("about:blank", "_blank");
    if (popup) popup.opener = null;
    try {
      const data = subscription ? await getPaymentReceipt(String(payment.id)) : await getProductOrderReceipt(payment.id);
      if (popup) popup.location.replace(data.receiptUrl);
      else openAlert({ title: "팝업이 차단되었습니다.", description: "브라우저에서 팝업을 허용한 후 다시 시도해 주세요." });
    } catch (error) {
      popup?.close();
      openAlert({ title: getErrorMessage(error, "영수증을 불러올 수 없습니다.") });
    } finally { setBusy(false); }
  }

  async function cancelOrder() {
    if (!canCancel || busy) return;
    setBusy(true);
    try {
      await cancelProductOrder(payment.id);
      router.refresh();
      openAlert({ title: "주문이 취소되었습니다." });
    } catch (error) {
      openAlert({ title: getErrorMessage(error, "주문 취소 중 오류가 발생했습니다.") });
    } finally { setBusy(false); }
  }

  return <div className="bg-white pt-[var(--header-offset)]">
    <header className="bg-[var(--color-subscription-header-bg)]">
      <div className="mx-auto max-w-[1060px] px-6 max-md:py-8 md:py-[38px]">
        <div className="flex items-center gap-1"><Link href="/orders" aria-label="주문내역으로 돌아가기" className="text-[var(--color-text-secondary)]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></Link><h1 className="text-title-24-b text-[var(--color-text)] max-md:text-display-20-eb">주문 상세정보</h1></div>
        <p className="mt-2 pl-7 text-body-16-m text-[var(--color-text-on-warm)] max-md:text-body-13-r">주문하신 상품의 상세정보입니다.</p>
      </div>
    </header>
    <div className="mx-auto max-w-[1060px] px-6 pb-[74px] pt-9">
      <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[12px] bg-[var(--color-surface-light)] px-6 py-3 text-body-14-m max-md:px-4">
        <p className="break-all font-semibold text-[var(--color-text)]">주문번호 No.{payment.orderId}</p>
        <button type="button" disabled={!canReceipt || busy} onClick={openReceipt} className="inline-flex items-center gap-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3M12 3v11m-4-4 4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>구매 영수증</button>
        <time dateTime={payment.createdAt} className="text-[var(--color-text-secondary)] md:ml-auto">주문일자 : {payment.createdAt.slice(0, 10).replace(/-/g, ".")}</time>
      </div>
      <div className={CARD}>
        <section className="min-w-0 md:pr-[35px]"><h2 className={HEADING}>배송지</h2>{address ? <div className="space-y-1 text-body-14-m text-[var(--color-text)]"><p className="text-subtitle-16-b">{address.receiverName}{address.nickname ? `(${address.nickname})` : ""}</p><p>{address.phoneNumber}</p><p className="break-words">{address.address} {address.addressDetail} ({address.zipCode})</p>{address.memo && <p className="text-[var(--color-text-secondary)]">배송 메모: {address.memo}</p>}</div> : <p className="text-body-14-r text-[var(--color-text-secondary)]">주문 당시 배송지 정보가 없습니다.</p>}</section>
        <section className={RIGHT}><h2 className={HEADING}>배송조회</h2><DeliveryProgress payment={payment} /></section>
      </div>
      <div className={`${CARD} mt-6`}>
        <section className="min-w-0 md:pr-[35px]"><h2 className={HEADING}>주문상품 정보</h2><div className="space-y-5">{products.map(item => {
          const tier = getPackageTierBySlug(item.relatedPlanSlug ?? "") ?? (/프리미엄|premium/i.test(item.productName) ? "Premium" : /스탠다드|standard/i.test(item.productName) ? "Standard" : /베이직|basic/i.test(item.productName) ? "Basic" : null);
          const image = item.imageUrl || (tier ? TIER_BOX_IMAGES[tier].src : null);
          return <article key={item.id} className="flex items-center max-md:gap-4 md:gap-9"><div className="shrink-0 overflow-hidden rounded-[12px] bg-[var(--color-surface-light)] max-md:h-[100px] max-md:w-[100px] md:h-[148px] md:w-[160px]">{image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-body-13-r text-[var(--color-text-secondary)]">상품 이미지</span>}</div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="break-words text-subtitle-16-b text-[var(--color-text)]">{item.productName}</h3><span className="rounded bg-[var(--color-surface-light)] px-1 text-btn-12-m text-[var(--color-text-secondary)]">{subscription ? "구독" : "단품"}</span></div><p className="mt-2 text-subtitle-16-b text-[var(--color-text)]">{subscription ? "정기구독" : "단품구매"}</p>{item.quantity !== undefined && <p className="mt-2 text-body-16-r text-[var(--color-text-secondary)]">수량 {item.quantity}개</p>}{item.refundedQuantity > 0 && <p className="mt-1 text-body-13-r text-[var(--color-text-secondary)]">환불 {item.refundedQuantity}개</p>}</div></article>;
        })}</div></section>
        <section className={RIGHT}><h2 className={HEADING}>결제정보</h2><dl className="space-y-2 text-body-14-m text-[var(--color-text)]">
          <div className="flex justify-between gap-4"><dt>주문상품금액</dt><dd>{payment.itemsAmount !== undefined ? formatKrwPrice(payment.itemsAmount) : "-"}</dd></div>
          <div className="flex justify-between gap-4"><dt>총 쿠폰 할인금액</dt><dd>{payment.couponDiscountAmount !== undefined ? `-${formatKrwPrice(payment.couponDiscountAmount)}` : "-"}</dd></div>
          <div className="flex justify-between gap-4"><dt>배송비</dt><dd>{payment.shippingFee !== undefined ? formatKrwPrice(payment.shippingFee) : "-"}</dd></div>
          <div className="flex items-center justify-between gap-4 border-t border-[var(--color-text-muted)] pt-3"><dt className="font-bold">총 결제금액</dt><dd className="text-price-20-eb">{formatKrwPrice(payment.amount)}</dd></div>
          {!!payment.refundedAmount && <div className="flex justify-between gap-4"><dt>환불금액</dt><dd>{formatKrwPrice(payment.refundedAmount)}</dd></div>}
          <div className="flex justify-between gap-4"><dt>결제방식</dt><dd>{payment.method ?? "-"}</dd></div>
        </dl></section>
      </div>
      {!subscription && <button type="button" disabled={!canCancel || busy} onClick={() => openAlert({ title: "주문을 취소할까요?", description: "주문에 포함된 남은 상품 전체가 취소됩니다.", primaryLabel: "주문취소", secondaryLabel: "돌아가기", onPrimary: cancelOrder })} className="mt-6 rounded-[6px] border border-[var(--color-text-muted)] px-5 py-2 text-body-14-m text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-light)] disabled:cursor-not-allowed disabled:opacity-50">{busy ? "처리 중..." : "주문취소"}</button>}
    </div>
  </div>;
}
