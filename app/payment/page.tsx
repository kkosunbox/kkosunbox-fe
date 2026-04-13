import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchBillingInfo } from "@/features/billing/api/queries";
import { PaymentManager } from "@/features/billing/ui";

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ method?: string }>;
}) {
  const token = await getServerToken();
  if (!token) redirect("/login");

  const { method } = await searchParams;

  const billing = await fetchBillingInfo(token);

  return (
    <PaymentManager
      initialMethod={method ?? "신용카드"}
      initialBilling={billing}
    />
  );
}
