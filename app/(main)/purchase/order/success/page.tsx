import { redirect } from "next/navigation";
import { getServerToken } from "@/features/auth/lib/session";
import { confirmProductOrderServer } from "@/features/product/api/queries";
import { ApiError } from "@/shared/lib/api";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = {
  title: "결제 처리중 | 꼬순박스",
  ...NOINDEX_METADATA,
};

type SearchParams = {
  paymentKey?: string;
  orderId?: string;
  amount?: string;
};

// 결과를 별도 페이지로 보여주지 않고 바로 처리 후 리다이렉트한다.
// 성공 → 마이페이지 구매관리(해당 상품 상세, 허브 역할), 실패 → 구매하기 페이지에서 모달로 안내.
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

  let redirectTo: string;
  try {
    const order = await confirmProductOrderServer(token, {
      orderId,
      paymentKey,
      amount: Number(amount),
    });
    redirectTo = `/mypage/purchase?productId=${order.productId}`;
  } catch (err) {
    const code = err instanceof ApiError ? err.code : "UNKNOWN_ERROR";
    redirectTo = `/purchase?confirmError=${encodeURIComponent(code)}`;
  }

  redirect(redirectTo);
}
