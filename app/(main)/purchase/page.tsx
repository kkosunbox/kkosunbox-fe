import type { Metadata } from "next";
import { Suspense } from "react";
import { PurchaseListSection, PurchasePaymentErrorNotice } from "@/widgets/purchase";
import { PACKAGES, CURRENT_PURCHASE_TIER } from "@/entities/package";
import { fetchProducts } from "@/features/product/api/queries";
import { resolvePurchaseProduct } from "@/features/product/lib/resolvePurchaseProduct";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "구매하기 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default async function PurchasePage() {
  const pkg = PACKAGES.find((p) => p.tier === CURRENT_PURCHASE_TIER)!;
  const products = await fetchProducts();
  const product = resolvePurchaseProduct(products, pkg.name);

  return (
    <>
      <Suspense fallback={null}>
        <PurchasePaymentErrorNotice />
      </Suspense>
      <PurchaseListSection product={product} />
    </>
  );
}
