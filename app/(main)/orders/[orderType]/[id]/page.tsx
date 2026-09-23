import { notFound, redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchCombinedPayment } from "@/features/payment/api/queries";
import { OrderDetailSection } from "@/widgets/orders";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = { title: "주문 상세정보 | 꼬순박스", ...NOINDEX_METADATA };

export default async function OrderDetailPage({ params }: { params: Promise<{ orderType: string; id: string }> }) {
  const token = await getServerToken();
  if (!token) redirect("/login?next=/orders");
  const { orderType, id: rawId } = await params;
  if (orderType !== "subscription" && orderType !== "product") notFound();
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  const payment = await fetchCombinedPayment(orderType, id, token);
  if (!payment) notFound();
  return <OrderDetailSection payment={payment} />;
}
