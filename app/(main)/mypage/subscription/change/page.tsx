import { getServerToken } from "@/features/auth/lib/session";
import { fetchProfile } from "@/features/profile/api/queries";
import { fetchSubscriptions, fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { SubscriptionChangePlansSection } from "@/widgets/mypage";

export const metadata = { title: "구독 변경 | 꼬순박스" };

export default async function SubscriptionChangePage({
  searchParams,
}: {
  searchParams: Promise<{ subscriptionId?: string }>;
}) {
  const token = await getServerToken();
  const profile = await fetchProfile(token);
  const { subscriptionId } = await searchParams;

  const [allSubscriptions, plans] = await Promise.all([
    fetchSubscriptions(token),
    fetchSubscriptionPlans(token, profile?.id),
  ]);

  const subscriptions = allSubscriptions.filter((s) => s.isActive);
  const targetSubscriptionId = subscriptionId ? Number(subscriptionId) : undefined;

  return (
    <SubscriptionChangePlansSection
      subscriptions={subscriptions}
      plans={plans}
      targetSubscriptionId={targetSubscriptionId}
    />
  );
}
