import Link from "next/link";

// Toss 자동결제(빌링) 카드 등록 성공 리다이렉트.
// query로 authKey·customerKey를 받는다. 계약 완료 후:
//   백엔드 POST /v1/billing/register {authKey, customerKey} 호출 → 빌링키 발급.
// 현재(계약 전)는 값 확인용으로만 표시한다.

type SearchParams = {
  authKey?: string;
  customerKey?: string;
};

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { authKey, customerKey } = await searchParams;

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <h1 className="text-2xl font-bold">빌링 카드 등록 인증 완료</h1>
        <p className="text-zinc-600">
          Toss 자동결제 카드 등록 인증이 완료되었습니다. 아래 값으로 백엔드 빌링키
          발급(<code>POST /v1/billing/register</code>)을 진행하면 됩니다.
        </p>

        <div className="flex flex-col gap-1 break-all text-zinc-700">
          <p>authKey: {authKey ?? "(없음)"}</p>
          <p>customerKey: {customerKey ?? "(없음)"}</p>
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
