import { redirect } from "next/navigation";
import { getAuthUser } from "@/features/auth/lib/session";
import { NOINDEX_METADATA } from "@/shared/lib/seo";
import { OrderHistorySection } from "@/widgets/orders";

export const metadata = {
  ...NOINDEX_METADATA,
  title: "주문내역 | 꼬순박스",
};

/** 주문 데이터 API 연결 전의 보호된 mock 화면. */
export default async function OrdersPage() {
  // 쿠키 유무가 아닌 /v1/auth/user 검증 결과로 접근을 결정한다.
  const authUser = await getAuthUser();
  if (!authUser) {
    redirect(`/login?next=${encodeURIComponent("/orders")}`);
  }

  return <OrderHistorySection />;
}
