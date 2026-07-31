import type { Metadata } from "next";
import { Suspense } from "react";
import { PurchaseListSection, PurchasePaymentErrorNotice } from "@/widgets/purchase";
import { fetchProducts } from "@/features/product/api/queries";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { resolveProductsByTier } from "@/features/product/lib/resolveProductsByTier";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "구매하기 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default async function PurchasePage() {
  const [products, plans] = await Promise.all([fetchProducts(), fetchSubscriptionPlans()]);
  const productsByTier = resolveProductsByTier(products, plans);

  return (
    <>
      <Suspense fallback={null}>
        <PurchasePaymentErrorNotice />
      </Suspense>
      <PurchaseListSection productsByTier={productsByTier} />
    </>
  );
}
