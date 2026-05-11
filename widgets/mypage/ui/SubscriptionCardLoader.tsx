import "server-only";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchSubscriptions } from "@/features/subscription/api/queries";
import { SubscriptionCard } from "./SubscriptionCard";

export async function SubscriptionCardLoader() {
  const token = await getServerToken();
  const allSubscriptions = await fetchSubscriptions(token);
  const subscriptions = allSubscriptions.filter((s) => s.isActive);
  return <SubscriptionCard subscriptions={subscriptions} />;
}
