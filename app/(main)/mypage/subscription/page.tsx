import { getServerToken } from "@/features/auth/lib/session";
import { fetchProfile } from "@/features/profile/api/queries";
import { fetchActiveSubscription, fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { SubscriptionManagementSection } from "@/widgets/mypage";

export const metadata = { title: "구독관리 | 꼬순박스" };

export default async function SubscriptionManagementPage() {
  const token = await getServerToken();
  const profile = await fetchProfile(token);

  const [subscription, plans] = await Promise.all([
    fetchActiveSubscription(token),
    fetchSubscriptionPlans(token, profile?.id),
  ]);

  return (
    <SubscriptionManagementSection
      subscription={subscription}
      plans={plans}
    />
  );
}
