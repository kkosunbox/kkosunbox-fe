import type { Metadata } from "next";
import Link from "next/link";
import { CartEmptyState } from "@/widgets/cart";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "빈 장바구니 테스트 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default function EmptyCartTestPage() {
  return (
    <div className="flex flex-1 flex-col bg-white pt-[var(--header-offset)]">
      <section className="bg-[var(--color-banner-bg)]/10">
        <div className="mx-auto flex h-[148px] w-full max-w-[var(--max-width-content)] flex-col justify-center px-6 lg:px-0">
          <div className="flex items-center gap-1"><Link href="/cart" aria-label="장바구니로 돌아가기"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 5-7 7 7 7" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></Link><h1 className="text-[24px] font-bold tracking-[-0.04em] text-[var(--color-text)]">장바구니</h1></div>
          <p className="ml-7 mt-2 text-body-16-m text-[var(--color-text-price)]">상품과 수량을 확인하신 후 주문을 진행해 주세요.</p>
        </div>
      </section>
      <div className="mx-auto flex w-full max-w-[var(--max-width-content)] flex-1 justify-center px-6 pb-[106px] pt-[120px]"><CartEmptyState /></div>
    </div>
  );
}
