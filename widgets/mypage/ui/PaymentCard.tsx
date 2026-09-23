import Link from "next/link";
import type { CombinedPaymentTypeSummaryResponse } from "@/features/payment/api/types";
import { DashboardCard, SectionHeader } from "../lib/dashboard-shared";

interface PaymentCardProps {
  summary: CombinedPaymentTypeSummaryResponse;
}

function OrderTypeIcon({ subscription }: { subscription: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0 text-[var(--color-footer-bg)]">
      {subscription ? <>
        <circle cx="17" cy="7" r="6" fill="currentColor" />
        <circle cx="11" cy="13" r="9" fill="currentColor" fillOpacity="0.32" />
        <path d="m7 12 3 3 6-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </> : <>
        <path d="M7.5 9V7a4.5 4.5 0 0 1 9 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 7h16l1 14H3L4 7Z" fill="currentColor" fillOpacity="0.32" />
        <path d="M7 12h9M7 16h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </>}
    </svg>
  );
}

export function PaymentCard({ summary }: PaymentCardProps) {
  const types = [
    { value: "subscription", label: "구독제품", count: summary.subscriptionCount },
    { value: "product", label: "단품제품", count: summary.productCount },
  ] as const;

  return (
    <DashboardCard className="lg:h-[186px]">
      <SectionHeader title="주문관리" href="/orders" linkLabel="주문내역" spacing="wide" />
      <div className="grid grid-cols-2 max-md:gap-3 md:gap-5">
        {types.map(({ value, label, count }) => (
          <Link
            key={value}
            href={`/orders?orderType=${value}`}
            aria-label={`${label} ${count}건 주문 내역 보기`}
            className="flex min-h-[85px] min-w-0 rounded-[12px] bg-white transition-shadow hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] max-md:flex-col max-md:justify-center max-md:gap-2 max-md:px-2 max-md:py-3 md:items-center md:justify-between md:gap-2 md:px-3"
          >
            <span className="flex items-center gap-2 max-md:justify-center">
              <OrderTypeIcon subscription={value === "subscription"} />
              <span className="whitespace-nowrap text-subtitle-16-b text-[var(--color-text)] max-md:text-body-14-sb">{label}</span>
            </span>
            <span className="break-words text-center text-title-20-b text-[var(--color-cta-button)]">{count.toLocaleString("ko-KR")}건</span>
          </Link>
        ))}
      </div>
    </DashboardCard>
  );
}
