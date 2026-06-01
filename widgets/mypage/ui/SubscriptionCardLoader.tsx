import "server-only";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchSubscriptions } from "@/features/subscription/api/queries";
import { fetchEligiblePlans, fetchMyReviews } from "@/features/review/api/queries";
import { SubscriptionCard } from "./SubscriptionCard";

export async function SubscriptionCardLoader() {
  const token = await getServerToken();
  const [allSubscriptions, eligiblePlans, myReviews] = await Promise.all([
    fetchSubscriptions(token),
    fetchEligiblePlans(token),
    fetchMyReviews(token),
  ]);
  const active = allSubscriptions.filter((s) => s.isActive);

  return (
    <SubscriptionCard
      subscriptions={active}
      eligiblePlans={eligiblePlans}
      myReviews={myReviews}
    />
  );
}
