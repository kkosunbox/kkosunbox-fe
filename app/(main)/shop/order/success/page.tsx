import Link from "next/link";
import { getShopProduct } from "@/entities/product";
import { formatKrwPrice } from "@/shared/lib/format";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = {
  title: "결제 완료 | 꼬순박스",
  ...NOINDEX_METADATA,
};

// Toss 결제위젯(일반/단건 결제) 성공 리다이렉트.
// 결제 승인(confirm)은 시크릿 키가 필요해 서버 컴포넌트에서만 처리한다.
// 문서용 테스트 시크릿 키 — /test/toss/success와 동일한 Toss 공식 문서 테스트 키.
const WIDGET_SECRET_KEY = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";

type SearchParams = {
  paymentKey?: string;
  orderId?: string;
  amount?: string;
  productId?: string;
  quantity?: string;
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
  const encryptedSecretKey = "Basic " + Buffer.from(WIDGET_SECRET_KEY + ":").toString("base64");

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

export default async function ShopOrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { paymentKey, orderId, amount, productId, quantity } = await searchParams;

  if (!paymentKey || !orderId || !amount) {
    return (
      <div className="pt-[var(--header-offset)]">
        <div className="mx-auto flex max-w-xl flex-col gap-2 px-6 py-16">
          <h1 className="text-title-24-b text-[var(--color-text-emphasis)]">잘못된 접근입니다</h1>
          <p className="text-body-14-r text-[var(--color-text-secondary)]">결제 파라미터가 없습니다.</p>
          <Link href="/shop" className="mt-4 text-body-14-sb text-[var(--color-primary)] hover:underline">
            ← 스토어로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const { ok, body } = await confirmPayment({ paymentKey, orderId, amount });
  const product = productId ? getShopProduct(productId) : undefined;

  return (
    <div className="pt-[var(--header-offset)]">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-16">
        <h1 className="text-title-24-b text-[var(--color-text-emphasis)]">
          {ok ? "결제가 완료되었습니다" : "결제 승인에 실패했습니다"}
        </h1>

        <div className="flex flex-col gap-1 text-body-14-r text-[var(--color-text-secondary)]">
          {product ? (
            <p>
              {product.name} {quantity ?? 1}개
            </p>
          ) : null}
          <p>결제 금액: {formatKrwPrice(Number(amount))}</p>
          <p>주문번호: {orderId}</p>
        </div>

        {!ok ? (
          <p className="text-body-13-m text-red-600" role="alert">
            {body?.code}: {body?.message}
          </p>
        ) : null}

        <Link href="/shop" className="mt-4 text-body-14-sb text-[var(--color-primary)] hover:underline">
          ← 스토어로 돌아가기
        </Link>
      </div>
    </div>
  );
}
