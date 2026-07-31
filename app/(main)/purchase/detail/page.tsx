import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PurchaseProductDetailPage } from "@/widgets/purchase";
import { PACKAGES, getPackagePurchaseProduct } from "@/entities/package";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchProducts } from "@/features/product/api/queries";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { resolveProductsByTier } from "@/features/product/lib/resolveProductsByTier";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata: Metadata = {
  title: "상품 상세 | 꼬순박스",
  ...NOINDEX_METADATA,
};

export default async function PurchaseDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier } = await searchParams;
  const pkg = PACKAGES.find((p) => p.tier === tier);
  const purchaseProduct = pkg ? getPackagePurchaseProduct(pkg.tier) : undefined;

  if (!pkg || !purchaseProduct) {
    redirect("/purchase");
  }

  // 비로그인 방문자도 상세 페이지 조회 가능 — 토큰이 없으면 fetchProducts가 공개 카탈로그만 반환.
  const token = await getServerToken();
  const [products, plans] = await Promise.all([fetchProducts(token), fetchSubscriptionPlans(token)]);
  // 화면 가격은 실제 매칭 상품이 있으면 그걸로 덮어써서 /purchase/order와 정합성을 맞춘다.
  const product = resolveProductsByTier(products, plans)[pkg.tier];
  const effectivePurchaseProduct = { ...purchaseProduct, price: product?.price ?? purchaseProduct.price };

  return (
    <PurchaseProductDetailPage
      pkg={pkg}
      purchaseProduct={effectivePurchaseProduct}
      relatedPlanId={product?.relatedPlanId ?? null}
    />
  );
}
