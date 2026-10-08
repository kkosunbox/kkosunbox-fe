import Image from "next/image";
import Link from "next/link";
import type { CombinedPaymentTypeSummaryResponse } from "@/features/payment/api/types";
import { DashboardCard, SectionHeader } from "../lib/dashboard-shared";

interface PaymentCardProps {
  summary: CombinedPaymentTypeSummaryResponse;
}

/** Figma check-circle / Basket 아이콘 원본 */
function OrderTypeIcon({ subscription }: { subscription: boolean }) {
  return (
    <Image
      src={subscription ? "/images/mypage/order-subscription.svg" : "/images/mypage/order-product.svg"}
      alt=""
      width={24}
      height={24}
      className="shrink-0"
    />
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
            className="flex min-h-[85px] min-w-0 rounded-[12px] max-lg:bg-white lg:bg-[var(--color-surface-light)] transition-shadow hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] max-md:flex-col max-md:justify-center max-md:gap-2 max-md:px-2 max-md:py-3 md:items-center md:justify-between md:gap-2 md:max-lg:px-3 lg:pr-5 lg:pl-3"
          >
            <span className="flex items-center gap-2 max-md:justify-center">
              <OrderTypeIcon subscription={value === "subscription"} />
              <span className="whitespace-nowrap text-subtitle-16-b text-[var(--color-text)] max-md:text-body-14-sb lg:tracking-[-0.02em]">{label}</span>
            </span>
            <span className="break-words text-center text-title-20-b text-[var(--color-cta-button)]">{count.toLocaleString("ko-KR")}건</span>
          </Link>
        ))}
      </div>
    </DashboardCard>
  );
}
