import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchProfile } from "@/features/profile/api/queries";
import { fetchActiveSubscription, fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { SubscriptionChangePlansSection } from "@/widgets/mypage";

export const metadata = { title: "구독 변경 | 꼬순박스" };

export default async function SubscriptionChangePage() {
  const token = await getServerToken();
  const profile = await fetchProfile(token);

  const [subscription, plans] = await Promise.all([
    fetchActiveSubscription(token),
    fetchSubscriptionPlans(token, profile?.id),
  ]);

  if (!subscription || !subscription.isActive) {
    redirect("/mypage/subscription");
  }

  return (
    <SubscriptionChangePlansSection
      subscription={subscription}
      plans={plans}
    />
  );
}
