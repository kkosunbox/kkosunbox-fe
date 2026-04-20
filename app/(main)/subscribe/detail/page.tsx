import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchProfile } from "@/features/profile/api/queries";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { SubscribeProductDetailPage } from "@/widgets/subscribe/plans";

export const metadata = {
  title: "제품 상세보기 | 꼬순박스",
};

export default async function SubscribeDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string }>;
}) {
  const { planId: planIdStr } = await searchParams;
  const planId = Number(planIdStr);
  if (!Number.isFinite(planId) || planId <= 0) {
    redirect("/subscribe");
  }

  const token = await getServerToken();
  const profile = await fetchProfile(token);
  const plans = await fetchSubscriptionPlans(token, profile?.id);

  if (plans.length === 0) {
    redirect("/subscribe");
  }

  const selectedPlan = plans.find((plan) => plan.id === planId) ?? plans[0];

  return <SubscribeProductDetailPage initialPlan={selectedPlan} plans={plans} />;
}
