import { getServerToken } from "@/features/auth/lib/session";
import { fetchProfile } from "@/features/profile/api/queries";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { SubscribePlansSection } from "@/widgets/subscribe/plans";

export default async function SubscribePage() {
  const token = await getServerToken();
  const profile = await fetchProfile(token);
  const plans = await fetchSubscriptionPlans(token, profile?.id);

  return <SubscribePlansSection plans={plans} />;
}
