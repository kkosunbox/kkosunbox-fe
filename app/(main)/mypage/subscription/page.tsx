import dynamic from "next/dynamic";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchSubscriptions, fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { fetchBillingInfo } from "@/features/billing/api/queries";

const SubscriptionManagementSection = dynamic(
  () => import("@/widgets/mypage/ui/SubscriptionManagementSection"),
);

export const metadata = { title: "구독관리 | 꼬순박스" };

export default async function SubscriptionManagementPage() {
  const token = await getServerToken();
  const [subscriptions, plans, billingInfo] = await Promise.all([
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
