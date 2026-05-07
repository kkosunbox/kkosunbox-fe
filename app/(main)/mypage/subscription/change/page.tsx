import { getServerToken } from "@/features/auth/lib/session";
import { fetchProfile } from "@/features/profile/api/queries";
import { fetchSubscriptions, fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { SubscriptionChangePlansSection } from "@/widgets/mypage";

export const metadata = { title: "구독 변경 | 꼬순박스" };

export default async function SubscriptionChangePage() {
  const token = await getServerToken();
  const profile = await fetchProfile(token);

  const [allSubscriptions, plans] = await Promise.all([
    fetchSubscriptions(token),
    fetchSubscriptionPlans(token, profile?.id),
  ]);

  const subscriptions = allSubscriptions.filter((s) => s.isActive);

  return (
    <SubscriptionChangePlansSection
      subscriptions={subscriptions}
      plans={plans}
    />
  );
}
