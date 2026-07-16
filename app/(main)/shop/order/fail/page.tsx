import Link from "next/link";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = {
  title: "결제 실패 | 꼬순박스",
  ...NOINDEX_METADATA,
};

// Toss 결제위젯(일반/단건 결제) 실패·취소 리다이렉트. query로 에러 code·message를 받는다.
type SearchParams = {
  code?: string;
  message?: string;
  orderId?: string;
  productId?: string;
};

export default async function ShopOrderFailPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { code, message, orderId, productId } = await searchParams;

  return (
    <div className="pt-[var(--header-offset)]">
      <div className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-16">
        <h1 className="text-title-24-b text-[var(--color-text-emphasis)]">결제에 실패했습니다</h1>

        <div className="flex flex-col gap-1 text-body-14-r text-[var(--color-text-secondary)]">
          <p>에러 코드: {code ?? "(없음)"}</p>
          <p>실패 사유: {message ?? "(없음)"}</p>
          {orderId ? <p>주문번호: {orderId}</p> : null}
        </div>

        <div className="mt-2 flex items-center gap-4">
          {productId ? (
            <Link
              href={`/shop/order?productId=${productId}`}
              className="text-body-14-sb text-[var(--color-primary)] hover:underline"
            >
              ← 다시 시도하기
            </Link>
          ) : null}
          <Link href="/shop" className="text-body-14-sb text-[var(--color-text-secondary)] hover:underline">
            스토어로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
