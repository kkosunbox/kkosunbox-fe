import { redirect } from "next/navigation";
import { confirmGuestOrderServer } from "@/features/product/api/queries";
import { GuestOrderCompleteSection } from "@/widgets/guest-order";
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
  /** 장바구니 주문일 때 결제 완료 후 브라우저 장바구니에서 지울 항목 */
  cartItemIds?: string;
};

// 비회원 결제 승인 후 주문완료 화면. 실패 시 구매하기 페이지에서 모달로 안내한다.
export default async function GuestOrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { paymentKey, orderId, amount, cartItemIds: cartItemIdsParam } = await searchParams;

  if (!paymentKey || !orderId || !amount) {
    redirect("/purchase?confirmError=BAD_REQUEST");
  }

  let detail;
  try {
    detail = await confirmGuestOrderServer({ orderId, paymentKey, amount: Number(amount) });
  } catch (err) {
    const code = err instanceof ApiError ? err.code : "UNKNOWN_ERROR";
    redirect(`/purchase?confirmError=${encodeURIComponent(code)}`);
  }

  const cartItemIds = cartItemIdsParam?.split(",").map(Number).filter((id) => Number.isInteger(id) && id > 0) ?? [];
  return <GuestOrderCompleteSection detail={detail} cartItemIds={cartItemIds} />;
}
