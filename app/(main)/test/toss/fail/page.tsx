import Link from "next/link";

type SearchParams = {
  code?: string;
  message?: string;
  orderId?: string;
};

export default async function TossFailPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { code, message, orderId } = await searchParams;

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <h1 className="text-2xl font-bold">결제 실패</h1>

        <div className="flex flex-col gap-1 text-zinc-700">
          <p>에러 코드: {code}</p>
          <p>실패 사유: {message}</p>
          {orderId && <p>주문번호: {orderId}</p>}
        </div>

        <Link href="/test/toss" className="text-sm font-medium text-zinc-500 hover:underline">
          ← 다시 테스트하기
        </Link>
      </div>
    </main>
  );
}
