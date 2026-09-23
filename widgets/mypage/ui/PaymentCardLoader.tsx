import "server-only";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchCombinedPaymentTypeSummary } from "@/features/payment/api/queries";
import { PaymentCard } from "./PaymentCard";

export async function PaymentCardLoader() {
  const token = await getServerToken();
  const summary = await fetchCombinedPaymentTypeSummary(token);
  return <PaymentCard summary={summary} />;
}
