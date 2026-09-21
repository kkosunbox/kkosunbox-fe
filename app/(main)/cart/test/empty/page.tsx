import type { Metadata } from "next";
import { CartEmptyState } from "@/widgets/cart";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "빈 장바구니 테스트 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default function EmptyCartTestPage() {
  return (
    <main className="mx-auto w-full max-w-[1100px] px-6 pb-20 pt-[calc(var(--header-offset)+40px)]">
      <h1 className="mb-8 text-[28px] font-bold text-[var(--color-text)]">장바구니</h1>
      <CartEmptyState />
    </main>
  );
}
