import type { Metadata } from "next";
import Link from "next/link";
import { CartEmptyState } from "@/widgets/cart";
import { NOINDEX_METADATA } from "@/shared/lib/seo";
import { PageHeaderBand } from "@/shared/ui";

export const metadata: Metadata = {
  title: "빈 장바구니 테스트 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default function EmptyCartTestPage() {
  return (
    <div className="flex flex-1 flex-col bg-white pt-[var(--header-offset)]">
      <PageHeaderBand title="장바구니" description="상품과 수량을 확인하신 후 주문을 진행해 주세요." backControl={<Link href="/cart" aria-label="장바구니로 돌아가기"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 5-7 7 7 7" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>} />
      <div className="mx-auto flex w-full max-w-[1240px] flex-1 justify-center max-xl:px-6 xl:px-0 pb-[106px] pt-[120px]"><CartEmptyState /></div>
    </div>
  );
}
