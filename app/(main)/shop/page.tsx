import type { Metadata } from "next";
import { ShopListSection } from "@/widgets/shop";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "간식 스토어 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default function ShopPage() {
  return <ShopListSection />;
}
