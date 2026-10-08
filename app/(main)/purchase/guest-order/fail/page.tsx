import { redirect } from "next/navigation";

// 비회원 결제위젯 실패·취소 리다이렉트 — 회원 단건 결제와 같이 구매하기 페이지에서 모달로 안내한다.
export default async function GuestOrderFailPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  redirect(`/purchase?confirmError=${encodeURIComponent(code ?? "PAY_PROCESS_CANCELED")}`);
}
