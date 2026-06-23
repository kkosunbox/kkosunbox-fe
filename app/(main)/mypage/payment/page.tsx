import { getServerToken } from "@/features/auth/lib/session";
import { fetchBillingInfo } from "@/features/billing/api/queries";
import { fetchActiveSubscription, fetchPaymentHistory } from "@/features/subscription/api/queries";
import { PaymentManagementSection } from "@/widgets/mypage";

export const metadata = { title: "결제관리 | 꼬순박스" };

export default async function PaymentPage() {
  const token = await getServerToken();

  const [billingInfo, subscription, payments] = await Promise.all([
    fetchBillingInfo(token),
    fetchActiveSubscription(token),
    fetchPaymentHistory(token),
  ]);

  return (
    <PaymentManagementSection
      billingInfo={billingInfo}
      subscription={subscription}
      payments={payments}
    />
  );
}
