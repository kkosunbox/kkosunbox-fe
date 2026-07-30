import Link from "next/link";
import { getShopProduct } from "@/entities/product";
import { formatKrwPrice } from "@/shared/lib/format";
import { confirmTossPayment } from "@/shared/lib/payments/tossPaymentConfirm";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = {
  title: "결제 완료 | 꼬순박스",
  ...NOINDEX_METADATA,
};

type SearchParams = {
  paymentKey?: string;
  orderId?: string;
  amount?: string;
  productId?: string;
  quantity?: string;
};

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

  const { ok, body } = await confirmTossPayment({ paymentKey, orderId, amount });
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
