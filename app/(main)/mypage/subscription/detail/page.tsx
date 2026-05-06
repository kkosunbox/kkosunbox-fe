import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import {
  fetchSubscriptionPaymentHistory,
  fetchSubscriptions,
} from "@/features/subscription/api/queries";
import { SubscriptionDetailSection } from "@/widgets/mypage";

export const metadata = { title: "구독중인 플랜 | 꼬순박스" };

interface PageProps {
  searchParams: Promise<{ subscriptionId?: string }>;
}

export default async function SubscriptionDetailPage({ searchParams }: PageProps) {
  const { subscriptionId } = await searchParams;
  const token = await getServerToken();
  const subscriptions = await fetchSubscriptions(token);

  const targetId = subscriptionId ? Number(subscriptionId) : null;
  const subscription = targetId
    ? subscriptions.find((s) => s.id === targetId && s.isActive)
    : subscriptions.find((s) => s.isActive);

  if (!subscription) {
    redirect("/mypage/subscription");
  }

  const subscriptionPayments = await fetchSubscriptionPaymentHistory(
    subscription.id,
    token,
  );

  return (
    <SubscriptionDetailSection
      subscription={subscription}
      payments={subscriptionPayments}
    />
  );
}
