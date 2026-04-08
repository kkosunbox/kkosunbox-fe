import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchBillingInfo } from "@/features/billing/api/queries";
import { fetchDeliveryAddresses } from "@/features/delivery-address/api/queries";
import { fetchProfiles } from "@/features/profile/api/queries";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { OrderSection } from "@/widgets/order";

export const metadata = {
  title: "주문 | 꼬순박스",
};

export default async function OrderPage({
  searchParams,
}: {
  searchParams: Promise<{ planId?: string }>;
}) {
  const { planId: planIdStr } = await searchParams;
  const planId = planIdStr ? Number(planIdStr) : NaN;
  if (!Number.isFinite(planId) || planId <= 0) {
    redirect("/subscribe");
  }

  const token = await getServerToken();
  const [plans, profiles, addresses, billing] = await Promise.all([
    fetchSubscriptionPlans(token),
    fetchProfiles(token),
    fetchDeliveryAddresses(token),
    fetchBillingInfo(token),
  ]);

  const plan = plans.find((p) => p.id === planId);
  if (!plan) {
    redirect("/subscribe");
  }

  if (profiles.length === 0) {
    redirect("/mypage/profile");
  }

  return (
    <OrderSection
      plan={plan}
      profiles={profiles}
      initialAddresses={addresses}
      hasBilling={billing !== null}
    />
  );
}
