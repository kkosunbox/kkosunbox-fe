import dynamic from "next/dynamic";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchSubscriptions, fetchSubscriptionPlans } from "@/features/subscription/api/queries";

const SubscriptionChangePlansSection = dynamic(
  () => import("@/widgets/mypage/ui/SubscriptionChangePlansSection"),
);

export const metadata = { title: "구독 변경 | 꼬순박스" };

export default async function SubscriptionChangePage({
  searchParams,
}: {
  searchParams: Promise<{ subscriptionId?: string }>;
}) {
  const token = await getServerToken();
  const { subscriptionId } = await searchParams;

  const [allSubscriptions, plans] = await Promise.all([
    fetchSubscriptions(token),
    fetchSubscriptionPlans(token),
  ]);

  const parsedSubscriptionId = subscriptionId ? Number(subscriptionId) : NaN;
  const targetSubscriptionId = Number.isFinite(parsedSubscriptionId)
    ? parsedSubscriptionId
    : undefined;

  const targetSubscription =
    targetSubscriptionId !== undefined
      ? (allSubscriptions.find((s) => Number(s.id) === targetSubscriptionId) ?? null)
      : null;

  return (
    <SubscriptionChangePlansSection
      plans={plans}
      targetSubscription={targetSubscription}
    />
  );
}
