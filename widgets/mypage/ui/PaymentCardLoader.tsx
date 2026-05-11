import "server-only";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchBillingInfo } from "@/features/billing/api/queries";
import { fetchActiveSubscription } from "@/features/subscription/api/queries";
import { PaymentCard } from "./PaymentCard";

export async function PaymentCardLoader() {
  const token = await getServerToken();
  const [billingInfo, subscription] = await Promise.all([
    fetchBillingInfo(token),
    fetchActiveSubscription(token),
  ]);
  return <PaymentCard billingInfo={billingInfo} subscription={subscription} />;
}
