import { getServerToken } from "@/features/auth/lib/session";
import { fetchActiveSubscription, fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { SubscriptionManagementSection } from "@/widgets/mypage";

export const metadata = { title: "구독관리 | 꼬순박스" };

export default async function SubscriptionManagementPage() {
  const token = await getServerToken();

  const [subscription, plans] = await Promise.all([
    fetchActiveSubscription(token),
    fetchSubscriptionPlans(token),
  ]);

  return (
    <SubscriptionManagementSection
      subscription={subscription}
      plans={plans}
    />
  );
}
