import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchPaginatedPaymentHistory } from "@/features/subscription/api/queries";
import { fetchDeliveryAddresses } from "@/features/delivery-address/api/queries";
import type { DeliveryStatus } from "@/features/subscription/api/types";
import { DeliveryStatusManager } from "@/features/subscription/ui/DeliveryStatusManager";

const VALID_STATUSES: DeliveryStatus[] = [
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
  if (!token) redirect("/login");

  const { status } = await searchParams;
  const deliveryStatus: DeliveryStatus = VALID_STATUSES.includes(
    status as DeliveryStatus,
  )
    ? (status as DeliveryStatus)
    : "PendingDelivery";

  const [data, addresses] = await Promise.all([
    fetchPaginatedPaymentHistory(token, { deliveryStatus, page: 1, limit: PAGE_LIMIT }),
    fetchDeliveryAddresses(token),
  ]);

  return (
    <DeliveryStatusManager
      initialPayments={data.payments}
      initialTotal={data.total}
      deliveryStatus={deliveryStatus}
      pageLimit={PAGE_LIMIT}
      deliveryAddress={addresses[0] ?? null}
    />
  );
}
