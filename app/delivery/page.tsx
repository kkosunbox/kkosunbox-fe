import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchCombinedPaymentHistory } from "@/features/payment/api/queries";
import type { CombinedDeliveryStatus } from "@/features/payment/api/types";
import { DeliveryStatusManager } from "@/features/subscription/ui/DeliveryStatusManager";

const VALID_STATUSES: CombinedDeliveryStatus[] = [
  "PendingDelivery",
  "DeliveryInProgress",
  "DeliveryCompleted",
];

const PAGE_LIMIT = 5;

export default async function DeliveryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const token = await getServerToken();
  if (!token) redirect("/login?next=/delivery");

  const { status } = await searchParams;
  const deliveryStatus: CombinedDeliveryStatus = VALID_STATUSES.includes(
    status as CombinedDeliveryStatus,
  )
    ? (status as CombinedDeliveryStatus)
    : "PendingDelivery";

  // 배송지는 결제 건별 스냅샷(`payment.deliveryAddress`)으로 내려오므로 따로 조회하지 않는다.
  const data = await fetchCombinedPaymentHistory(token, {
    deliveryStatus,
    page: 1,
    limit: PAGE_LIMIT,
  });

  return (
    <DeliveryStatusManager
      initialPayments={data.payments}
      initialTotal={data.total}
      deliveryStatus={deliveryStatus}
      pageLimit={PAGE_LIMIT}
    />
  );
}
