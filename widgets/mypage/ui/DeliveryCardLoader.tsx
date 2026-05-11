import "server-only";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchDeliveryStatusSummary } from "@/features/subscription/api/queries";
import { DeliveryCard } from "./DeliveryCard";

export async function DeliveryCardLoader() {
  const token = await getServerToken();
  const summary = await fetchDeliveryStatusSummary(token);
  return <DeliveryCard summary={summary} />;
}
