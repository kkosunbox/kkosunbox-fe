import Link from "next/link";

// 결제 승인(confirm)을 서버에서 처리하는 테스트용 성공 페이지.
// 시크릿 키는 서버 컴포넌트에서만 사용되어 클라이언트에 노출되지 않는다.

// ⚠️ Toss 공식 문서 공유 샘플 키(TossPaymentTest.tsx의 WIDGET_CLIENT_KEY와 짝) — 우리 실 계정 시크릿키 아님.
// 실제 체크아웃과 무관한 데모 전용. 다른 곳에 복붙 금지 — /shop/order/success의 시크릿키 불일치 버그가
// 이 패턴(실 클라이언트키 + 이 문서 시크릿키)을 잘못 섞어 쓰다 생긴 것.
const WIDGET_SECRET_KEY = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";

type SearchParams = {
  paymentKey?: string;
  orderId?: string;
  amount?: string;
};

async function confirmPayment({
  paymentKey,
  orderId,
  amount,
}: {
  paymentKey: string;
  orderId: string;
  amount: string;
}) {
  const encryptedSecretKey =
    "Basic " + Buffer.from(WIDGET_SECRET_KEY + ":").toString("base64");

  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: encryptedSecretKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderId, amount: Number(amount), paymentKey }),
    cache: "no-store",
  });

  const body = await res.json();
  return { ok: res.ok, body };
}

export default async function TossSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { paymentKey, orderId, amount } = await searchParams;

  if (!paymentKey || !orderId || !amount) {
    return (
      <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950">
        <div className="mx-auto flex max-w-xl flex-col gap-2">
          <h1 className="text-2xl font-bold">잘못된 접근입니다</h1>
          <p className="text-zinc-600">결제 파라미터가 없습니다.</p>
        </div>
      </main>
    );
  }

  const { ok, body } = await confirmPayment({ paymentKey, orderId, amount });

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <h1 className="text-2xl font-bold">
          {ok ? "결제 성공" : "결제 승인 실패"}
        </h1>

        <div className="flex flex-col gap-1 text-zinc-700">
          <p>주문번호: {orderId}</p>
          <p>결제 금액: {Number(amount).toLocaleString()}원</p>
          <p className="break-all">paymentKey: {paymentKey}</p>
        </div>

        {!ok && (
          <p className="text-red-600">
            {body?.code}: {body?.message}
          </p>
        )}

        <pre className="overflow-x-auto rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
          {JSON.stringify(body, null, 2)}
        </pre>

        <Link href="/test/toss" className="text-sm font-medium text-zinc-500 hover:underline">
          ← 다시 테스트하기
        </Link>
      </div>
    </main>
  );
}
