import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { confirmProductOrderServer, fetchProducts } from "@/features/product/api/queries";
import { resolveProductTier } from "@/features/product/lib/resolveProductsByTier";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { OrderCompleteSection } from "@/widgets/purchase";
import { ApiError } from "@/shared/lib/api";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = {
  title: "주문 완료 | 꼬순박스",
  ...NOINDEX_METADATA,
};

type SearchParams = {
  paymentKey?: string;
  orderId?: string;
  amount?: string;
};

// 결제 승인 후 이 화면에서 주문완료 요약을 바로 보여준다.
// 실패 시에는 화면을 그리지 않고 구매하기 페이지에서 모달로 안내한다.
export default async function PurchaseOrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { paymentKey, orderId, amount } = await searchParams;

  if (!paymentKey || !orderId || !amount) {
    redirect("/purchase?confirmError=BAD_REQUEST");
  }

  const token = await getServerToken();

  let order, tier;
  try {
    const [confirmedOrder, products, plans] = await Promise.all([
      confirmProductOrderServer(token, { orderId, paymentKey, amount: Number(amount) }),
      fetchProducts(token),
      fetchSubscriptionPlans(token),
    ]);
    const product = products.find((p) => p.id === confirmedOrder.productId) ?? null;
    order = confirmedOrder;
    tier = product ? resolveProductTier(product, plans) : null;
  } catch (err) {
    const code = err instanceof ApiError ? err.code : "UNKNOWN_ERROR";
    redirect(`/purchase?confirmError=${encodeURIComponent(code)}`);
  }

  return (
    <OrderCompleteSection
      orderId={orderId}
      createdAt={order.createdAt}
      productName={order.productName}
      quantity={order.quantity}
      amount={order.amount}
      productId={order.productId}
      method={order.method}
      tier={tier}
    />
  );
}
