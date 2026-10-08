"use client";

/* eslint-disable @next/next/no-img-element -- 주문 시점의 원격 이미지 스냅샷을 표시한다. */

import { useState, type ReactNode } from "react";
import { formatGuestOrderId } from "@/features/guest-order";
import type { ProductOrderDto } from "@/features/product/api";
import { formatKrwPrice } from "@/shared/lib/format";

const STATUS_LABEL = { pending: "결제 대기", failed: "결제 실패", preparing: "배송준비중", shipping: "배송중", delivered: "배송완료", refunded: "전액 환불", partially_refunded: "부분 환불" } as const;
const DELIVERY_LABELS = ["배송준비중", "배송중", "배송완료"];

export const GUEST_ORDER_CARD = "grid rounded-[20px] border border-[var(--color-text-muted)] max-md:grid-cols-1 max-md:gap-6 max-md:p-5 md:grid-cols-2 md:px-10 md:py-6";
export const GUEST_ORDER_CARD_RIGHT = "min-w-0 border-[var(--color-text-muted)] max-md:border-t max-md:pt-6 md:border-l md:pl-10";
export const GUEST_ORDER_HEADING = "mb-5 text-subtitle-18-b tracking-[-0.04em] text-[var(--color-text-emphasis)]";

function formatOrderDate(iso: string) {
  return iso.slice(0, 10).replace(/-/g, ".");
}

function CopyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** 주문번호(복사) · 부가 액션 · 주문일자 바 */
export function GuestOrderNumberBar({ orderId, createdAt, actions }: { orderId: string; createdAt: string; actions?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const displayId = formatGuestOrderId(orderId);

  async function copy() {
    try {
      await navigator.clipboard.writeText(displayId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 미지원 — 주문번호가 화면에 그대로 보이므로 수동 복사가 가능하다.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[12px] bg-[var(--color-surface-light)] px-10 py-3 text-body-14-m max-md:px-4">
      <p className="break-all font-semibold text-[var(--color-text)]">주문번호 No.{displayId}</p>
      <button type="button" onClick={() => void copy()} aria-label="주문번호 복사" className="inline-flex items-center gap-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
        <CopyIcon />
        {copied && <span className="text-body-13-m" role="status">복사되었습니다</span>}
      </button>
      {actions}
      <time dateTime={createdAt} className="text-body-13-m text-[var(--color-text-secondary)] md:ml-auto">주문일자 : {formatOrderDate(createdAt)}</time>
    </div>
  );
}

/** 주문상품 정보 · 결제정보 카드 */
export function GuestOrderInfoCard({ order }: { order: ProductOrderDto }) {
  return (
    <div className={GUEST_ORDER_CARD}>
      <section className="min-w-0 md:pr-10">
        <h2 className={GUEST_ORDER_HEADING}>주문상품 정보</h2>
        <div className="space-y-6">
          {order.items.map((item) => (
            <article key={item.id} className="flex items-center max-md:gap-4 md:gap-9">
              <div className="h-[120px] w-[130px] shrink-0 overflow-hidden rounded-[12px] bg-[var(--color-surface-light)] max-md:h-[100px] max-md:w-[100px]">
                {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="break-words text-subtitle-16-sb tracking-[-0.04em] text-[var(--color-text-emphasis)]">{item.productName}</h3>
                  <span className="rounded-[5px] bg-[var(--color-border-light)] px-1 text-body-12-m text-[var(--color-text-secondary)]">단품</span>
                </div>
                <p className="text-price-16-eb text-[var(--color-text)]">{formatKrwPrice(item.unitPrice)}</p>
                <p className="text-price-16-m text-[var(--color-text-secondary)]">수량 {item.quantity}개</p>
                {item.refundedQuantity > 0 && <p className="text-body-13-r text-[var(--color-text-secondary)]">취소 {item.refundedQuantity}개</p>}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className={GUEST_ORDER_CARD_RIGHT}>
        <h2 className={GUEST_ORDER_HEADING}>결제정보</h2>
        <dl className="space-y-3 text-body-13-m text-[var(--color-text)]">
          <div className="flex justify-between gap-4">
            <dt>주문상품금액</dt>
            <dd className="flex flex-col items-end gap-3">{order.items.map((item) => <span key={item.id}>{formatKrwPrice(item.itemAmount)}</span>)}</dd>
          </div>
          <div className="flex justify-between gap-4"><dt>총 쿠폰 할인금액</dt><dd>-{formatKrwPrice(order.couponDiscountAmount)}</dd></div>
          <div className="flex justify-between gap-4"><dt>배송비</dt><dd>{formatKrwPrice(order.shippingFee)}</dd></div>
          <div className="flex items-center justify-between gap-4 border-t border-[var(--color-text-muted)] pt-3">
            <dt className="text-body-14-b">총 결제금액</dt>
            <dd className="text-price-20-eb">{formatKrwPrice(order.amount)}</dd>
          </div>
          {order.refundedAmount > 0 && <div className="flex justify-between gap-4"><dt>환불금액</dt><dd>{formatKrwPrice(order.refundedAmount)}</dd></div>}
          <div className="flex justify-between gap-4"><dt>결제방식</dt><dd>{order.method ?? "-"}</dd></div>
        </dl>
      </section>
    </div>
  );
}

/** 배송조회 진행바 — 회원 주문 상세(OrderDetailSection)와 같은 규칙 */
export function GuestDeliveryProgress({ order }: { order: ProductOrderDto }) {
  const deliveryStep = order.deliveryStatus === "DeliveryCompleted" ? 2 : order.deliveryStatus === "DeliveryInProgress" ? 1 : order.deliveryStatus === "PendingDelivery" ? 0 : null;
  const step = order.displayStatus === "preparing" ? 0 : order.displayStatus === "shipping" ? 1 : order.displayStatus === "delivered" ? 2 : order.displayStatus === "partially_refunded" ? deliveryStep : null;
  return (
    <>
      {step === null ? (
        <p className="rounded-xl bg-[var(--color-surface-light)] px-4 py-5 text-body-14-m text-[var(--color-text-secondary)]">{STATUS_LABEL[order.displayStatus]}</p>
      ) : (
        <div className="pt-3" aria-label={`배송 상태: ${DELIVERY_LABELS[step]}`}>
          <div className="mx-5 h-2 rounded-full bg-[var(--color-text-muted)]">
            <div className="relative h-full rounded-full bg-[var(--color-cta-button)]" style={{ width: `${step * 50}%` }}>
              <span className="absolute right-0 top-1/2 h-6 w-6 -translate-y-1/2 translate-x-1/2 rounded-full border-4 border-[var(--color-cta-button)] bg-white" />
            </div>
          </div>
          <ol className="mt-6 flex justify-between text-body-13-r text-[var(--color-text-secondary)]">
            {DELIVERY_LABELS.map((label, index) => (
              <li key={label} aria-current={step === index ? "step" : undefined} className={step === index ? "rounded-full bg-[var(--color-surface-warm)] px-3 text-[var(--color-cta-button)]" : undefined}>{label}</li>
            ))}
          </ol>
          {order.displayStatus === "partially_refunded" && <p className="mt-2 text-body-13-r text-[var(--color-text-secondary)]">부분 환불</p>}
        </div>
      )}
      {order.trackingNumber && <p className="mt-3 break-all text-body-13-r text-[var(--color-text-secondary)]">송장번호 {order.trackingNumber}</p>}
    </>
  );
}
