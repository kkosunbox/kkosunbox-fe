import "server-only";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchCombinedDeliveryStatusSummary } from "@/features/payment/api/queries";
import { DeliveryCard } from "./DeliveryCard";

export async function DeliveryCardLoader() {
  const token = await getServerToken();
  const summary = await fetchCombinedDeliveryStatusSummary(token);
  return <DeliveryCard summary={summary} />;
}
