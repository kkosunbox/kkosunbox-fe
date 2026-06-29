import Link from "next/link";

// Toss 자동결제(빌링) 카드 등록 실패/취소 리다이렉트.
// query로 에러 code·message를 받는다.

type SearchParams = {
  code?: string;
  message?: string;
};

export default async function BillingFailPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { code, message } = await searchParams;

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <h1 className="text-2xl font-bold">빌링 카드 등록 실패</h1>

        <div className="flex flex-col gap-1 text-zinc-700">
          <p>에러 코드: {code ?? "(없음)"}</p>
          <p>실패 사유: {message ?? "(없음)"}</p>
        </div>

        <Link
          href="/subscribe"
          className="text-sm font-medium text-zinc-500 hover:underline"
        >
          ← 구독으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
