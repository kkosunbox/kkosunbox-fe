import { GuestOrderDetailSection } from "@/widgets/guest-order";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = { title: "비회원 주문 상세정보 | 꼬순박스", ...NOINDEX_METADATA };

// 조회 키(주문자 연락처)는 URL에 두지 않고 같은 탭 sessionStorage에서 읽는다 — 클라이언트에서 조회한다.
export default async function GuestOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return <GuestOrderDetailSection orderId={decodeURIComponent(orderId)} />;
}
