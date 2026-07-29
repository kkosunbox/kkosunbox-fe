import type { Metadata } from "next";
import { PurchaseListSection } from "@/widgets/purchase";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "구매하기 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default function PurchasePage() {
  return <PurchaseListSection />;
}
