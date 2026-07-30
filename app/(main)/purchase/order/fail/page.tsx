import { redirect } from "next/navigation";

// Toss 결제위젯(단건 결제) 실패·취소 리다이렉트. 별도 페이지 없이 구매하기 페이지에서 모달로 안내한다.
type SearchParams = {
  code?: string;
};

export default async function PurchaseOrderFailPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { code } = await searchParams;
  redirect(`/purchase?confirmError=${encodeURIComponent(code ?? "PAY_PROCESS_CANCELED")}`);
}
