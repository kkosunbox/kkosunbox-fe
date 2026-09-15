import type { Metadata } from "next";
import { CartSection } from "@/widgets/cart";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "장바구니 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default function CartPage() {
  return <CartSection />;
}
