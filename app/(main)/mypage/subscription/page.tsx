import { getServerToken } from "@/features/auth/lib/session";
import { fetchProfile } from "@/features/profile/api/queries";
import { fetchSubscriptions, fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { fetchBillingInfo } from "@/features/billing/api/queries";
import { SubscriptionManagementSection } from "@/widgets/mypage";

export const metadata = { title: "구독관리 | 꼬순박스" };

export default async function SubscriptionManagementPage() {
  const token = await getServerToken();
  const [profile, subscriptions, plans, billingInfo] = await Promise.all([
    fetchProfile(token),
    fetchSubscriptions(token),
    fetchSubscriptionPlans(token),
    fetchBillingInfo(token),
  ]);

  return (
    <SubscriptionManagementSection
      subscriptions={subscriptions}
      plans={plans}
      billingInfo={billingInfo}
    />
  );
}
