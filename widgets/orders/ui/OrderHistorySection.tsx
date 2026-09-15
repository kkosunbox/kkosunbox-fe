"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { TIER_BOX_IMAGES, type PackageTier } from "@/entities/package";

type OrderKind = "subscription" | "purchase";
type DeliveryStatus = "배송중" | "배송준비중" | "배송완료";

interface OrderItem {
  id: string;
  date: string;
  kind: OrderKind;
  tier: PackageTier;
  title: string;
  paymentDescription: string;
  amount: number;
  status: DeliveryStatus;
}

/** API 연결 전 화면 검증용 데이터. 이후 GET /orders 응답으로 교체할 수 있도록 UI와 분리한다. */
const MOCK_ORDERS: OrderItem[] = [
  { id: "123456777890", date: "2026.09.09", kind: "subscription", tier: "Premium", title: "프리미엄 패키지 구독", paymentDescription: "결제일 · 매달 21일", amount: 33900, status: "배송중" },
  { id: "123456777891", date: "2026.09.09", kind: "subscription", tier: "Premium", title: "프리미엄 패키지 구독", paymentDescription: "결제일 · 매달 21일", amount: 33900, status: "배송준비중" },
  { id: "123456777892", date: "2026.09.09", kind: "purchase", tier: "Standard", title: "스탠다드 패키지", paymentDescription: "단품구매", amount: 28900, status: "배송완료" },
  { id: "123456777893", date: "2026.09.09", kind: "subscription", tier: "Standard", title: "스탠다드 패키지 구독", paymentDescription: "결제일 · 매달 21일", amount: 28900, status: "배송완료" },
  { id: "123456777894", date: "2026.08.21", kind: "subscription", tier: "Basic", title: "베이직 패키지 구독", paymentDescription: "결제일 · 매달 21일", amount: 23900, status: "배송완료" },
  { id: "123456777895", date: "2026.08.12", kind: "purchase", tier: "Premium", title: "프리미엄 패키지", paymentDescription: "단품구매", amount: 33900, status: "배송완료" },
  { id: "123456777896", date: "2026.07.21", kind: "subscription", tier: "Standard", title: "스탠다드 패키지 구독", paymentDescription: "결제일 · 매달 21일", amount: 28900, status: "배송완료" },
  { id: "123456777897", date: "2026.07.10", kind: "purchase", tier: "Basic", title: "베이직 패키지", paymentDescription: "단품구매", amount: 23900, status: "배송완료" },
  { id: "123456777898", date: "2026.06.21", kind: "subscription", tier: "Premium", title: "프리미엄 패키지 구독", paymentDescription: "결제일 · 매달 21일", amount: 33900, status: "배송완료" },
  { id: "123456777899", date: "2026.06.08", kind: "purchase", tier: "Standard", title: "스탠다드 패키지", paymentDescription: "단품구매", amount: 28900, status: "배송완료" },
  { id: "123456777900", date: "2026.05.21", kind: "subscription", tier: "Basic", title: "베이직 패키지 구독", paymentDescription: "결제일 · 매달 21일", amount: 23900, status: "배송완료" },
  { id: "123456777901", date: "2026.05.04", kind: "purchase", tier: "Premium", title: "프리미엄 패키지", paymentDescription: "단품구매", amount: 33900, status: "배송완료" },
];

const PAGE_SIZE = 4;
const tierClass: Record<PackageTier, string> = {
  Premium: "bg-[var(--color-premium)]",
  Standard: "bg-[var(--color-plus)]",
  Basic: "bg-[var(--color-basic)]",
};

function BackIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ChevronIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function TruckIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6h11v10H3zM14 9h3l4 4v3h-7zM7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
}

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const completed = status === "배송완료";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-btn-12-m ${completed ? "border-[var(--color-text-muted)] text-[var(--color-text-label)]" : "border-[var(--color-status-success-bg)] bg-[var(--color-status-success-bg)] text-[var(--color-status-success)]"}`}>
      {!completed && <TruckIcon />}
      {completed && <span className="flex h-3 w-3 items-center justify-center rounded-full border border-current text-[9px]">✓</span>}
      {status}
    </span>
  );
}

function OrderCard({ order, onDetail }: { order: OrderItem; onDetail: (order: OrderItem) => void }) {
  const image = TIER_BOX_IMAGES[order.tier];
  const tierLabel = order.tier === "Premium" ? "프리미엄" : order.tier === "Standard" ? "스탠다드" : "베이직";
  return (
    <article className="rounded-[20px] border border-[var(--color-text-muted)] bg-white px-5 py-5 max-md:rounded-[14px] max-md:px-4 max-md:py-4 md:px-8">
      <div className="mb-4 flex items-center justify-between gap-3 text-body-14-m max-md:mb-3 max-md:text-body-13-r">
        <div className="flex min-w-0 items-center gap-3"><strong className="text-[var(--color-text)]">주문번호 {order.id}</strong><span className="text-[var(--color-text-secondary)]">{order.date}</span></div>
        <div className="flex shrink-0 items-center gap-2"><StatusBadge status={order.status} /><ChevronIcon /></div>
      </div>
      <div className="flex items-center gap-6 max-md:flex-col max-md:items-stretch max-md:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-5 max-md:gap-3">
          <div className="h-[104px] w-[112px] shrink-0 overflow-hidden rounded-[12px] bg-[var(--color-surface-light)] max-md:h-[82px] max-md:w-[88px]">
            <Image src={image} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-btn-12-m text-white ${tierClass[order.tier]}`}>{tierLabel}</span>
            <h2 className="mt-2 text-subtitle-16-sb text-[var(--color-text)] max-md:text-body-14-sb">{order.title}</h2>
            <p className="mt-1 text-body-14-r text-[var(--color-text-secondary)] max-md:text-body-13-r">{order.paymentDescription}</p>
            <p className="mt-1 text-body-14-r text-[var(--color-text-secondary)] max-md:text-body-13-r">결제금액 · {order.amount.toLocaleString("ko-KR")}원</p>
          </div>
        </div>
        <div className="flex w-[166px] shrink-0 flex-col border-l border-[var(--color-text-muted)] pl-7 max-md:w-full max-md:flex-row max-md:items-center max-md:justify-between max-md:border-l-0 max-md:border-t max-md:pt-4 max-md:pl-0">
          <span className="text-body-13-r text-[var(--color-text-secondary)]">총 결제금액</span>
          <strong className="mt-1 text-price-20-eb text-[var(--color-text-price)] max-md:mt-0">{order.amount.toLocaleString("ko-KR")}원</strong>
          <button type="button" onClick={() => onDetail(order)} className="mt-5 h-10 rounded-[8px] border border-[var(--color-cta-button)] text-btn-14-m text-[var(--color-cta-button)] transition-colors hover:bg-[var(--color-surface-warm)] max-md:mt-0 max-md:w-[120px]">주문 상세보기</button>
        </div>
      </div>
    </article>
  );
}

export default function OrderHistorySection() {
  const [kind, setKind] = useState<"all" | OrderKind>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<OrderItem | null>(null);
  const orders = useMemo(() => MOCK_ORDERS.filter((order) => kind === "all" || order.kind === kind), [kind]);
  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageOrders = orders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selectKind = (next: "all" | OrderKind) => { setKind(next); setPage(1); };

  const tabs = [
    ["all", `전체 ${MOCK_ORDERS.length}`],
    ["subscription", `구독제품 ${MOCK_ORDERS.filter((o) => o.kind === "subscription").length}`],
    ["purchase", `단품제품 ${MOCK_ORDERS.filter((o) => o.kind === "purchase").length}`],
  ] as const;

  return (
    <div className="bg-white pt-[var(--header-offset)]">
      <section className="bg-[var(--color-subscription-header-bg)]">
        <div className="mx-auto max-w-content px-6 py-10 lg:px-0 lg:py-[38px]">
          <h1 className="flex items-center gap-1 text-display-28-eb text-[var(--color-text)] max-md:text-display-20-eb"><BackIcon />주문내역</h1>
          <p className="mt-2 pl-7 text-body-14-m text-[var(--color-text-on-warm)] max-md:pl-0 max-md:text-body-13-r">지금까지의 주문 내역을 한눈에 확인해보세요.</p>
        </div>
      </section>

      <section className="mx-auto min-h-[880px] max-w-content px-6 py-8 pb-16 lg:px-0 lg:py-8 lg:pb-[76px]">
        <div className="flex gap-2" role="tablist" aria-label="주문 유형">
          {tabs.map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={kind === value} onClick={() => selectKind(value)} className={`h-8 rounded-full border px-5 text-btn-14-m transition-colors max-md:px-3 max-md:text-btn-12-m ${kind === value ? "border-[var(--color-cta-button)] bg-[var(--color-cta-button)] text-white" : "border-[var(--color-text-muted)] text-[var(--color-text-label)] hover:border-[var(--color-primary)]"}`}>{label}</button>)}
        </div>
        <div className="mt-7 space-y-7 max-md:mt-5 max-md:space-y-4">
          {pageOrders.map((order) => <OrderCard key={order.id} order={order} onDetail={setSelected} />)}
        </div>
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="주문 내역 페이지 탐색">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((value) => <button key={value} type="button" onClick={() => setPage(value)} aria-current={value === currentPage ? "page" : undefined} className={`flex h-6 w-6 items-center justify-center text-body-13-r ${value === currentPage ? "font-bold text-[var(--color-text)]" : "text-[var(--color-text-secondary)]"}`}>{value}</button>)}
        </nav>
      </section>

      {selected && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-6" role="dialog" aria-modal="true" aria-labelledby="order-detail-title"><div className="w-full max-w-[420px] rounded-[16px] bg-white p-6 shadow-xl"><div className="flex items-start justify-between gap-4"><div><h2 id="order-detail-title" className="text-subtitle-18-b text-[var(--color-text)]">주문 상세</h2><p className="mt-2 text-body-14-r text-[var(--color-text-secondary)]">주문번호 {selected.id}</p></div><button type="button" onClick={() => setSelected(null)} className="text-body-14-m text-[var(--color-text-label)]">닫기</button></div><dl className="mt-6 space-y-3 border-y border-[var(--color-text-muted)] py-4 text-body-14-r"><div className="flex justify-between"><dt className="text-[var(--color-text-secondary)]">상품</dt><dd>{selected.title}</dd></div><div className="flex justify-between"><dt className="text-[var(--color-text-secondary)]">배송 상태</dt><dd>{selected.status}</dd></div><div className="flex justify-between"><dt className="text-[var(--color-text-secondary)]">결제 금액</dt><dd className="font-semibold">{selected.amount.toLocaleString("ko-KR")}원</dd></div></dl><p className="mt-4 text-body-13-r text-[var(--color-text-secondary)]">현재는 주문 내역 화면 검증을 위한 mock 상세 정보입니다.</p></div></div>}
    </div>
  );
}
