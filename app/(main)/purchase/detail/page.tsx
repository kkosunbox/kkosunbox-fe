import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PurchaseProductDetailPage } from "@/widgets/purchase";
import { PACKAGES, getPackagePurchaseProduct } from "@/entities/package";
import { getServerToken } from "@/features/auth/lib/session";
import { fetchProduct, fetchProducts } from "@/features/product/api/queries";
import { fetchSubscriptionPlans } from "@/features/subscription/api/queries";
import { resolveProductsByTier } from "@/features/product/lib/resolveProductsByTier";
import { resolveProductTier } from "@/features/product/lib/resolveProductsByTier";
import { NOINDEX_FOLLOW_METADATA } from "@/shared/lib/seo";
import IndependentProductDetailPage from "@/widgets/purchase/ui/detail/IndependentProductDetailPage";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; productId?: string }>;
}): Promise<Metadata> {
  const { tier, productId } = await searchParams;
  if (productId) return { title: "상품 상세 | 꼬순박스", ...NOINDEX_FOLLOW_METADATA };
  const pkg = PACKAGES.find((item) => item.tier === tier);

  if (!pkg) {
    return {
      title: "상품 상세 | 꼬순박스",
      alternates: { canonical: "/purchase" },
      ...NOINDEX_FOLLOW_METADATA,
    };
  }

  const description = `${pkg.name}를 단품으로 만나보세요. 휴먼그레이드 재료로 만든 프리미엄 강아지 수제간식 패키지입니다.`;

  return {
    title: `${pkg.name} 단품 | 꼬순박스`,
    description,
    alternates: { canonical: "/purchase" },
    ...NOINDEX_FOLLOW_METADATA,
  };
}

export default async function PurchaseDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; productId?: string }>;
}) {
  const { tier, productId: productIdParam } = await searchParams;

  // 비로그인 방문자도 상세 페이지 조회 가능 — 토큰이 없으면 fetchProducts가 공개 카탈로그만 반환.
  const token = await getServerToken();
  const requestedId = productIdParam ? Number(productIdParam) : null;
  if (productIdParam && (!requestedId || !Number.isInteger(requestedId))) redirect("/purchase");

  const [requestedProduct, products, plans] = await Promise.all([
    requestedId ? fetchProduct(requestedId, token) : Promise.resolve(null),
    requestedId ? Promise.resolve([]) : fetchProducts(token),
    fetchSubscriptionPlans(token),
  ]);
  if (requestedId && !requestedProduct) redirect("/purchase");
  if (requestedProduct && requestedProduct.relatedPlanId == null) return <IndependentProductDetailPage product={requestedProduct} />;

  const resolvedTier = requestedProduct ? resolveProductTier(requestedProduct, plans) : null;
  const pkg = PACKAGES.find((p) => p.tier === (resolvedTier ?? tier));
  const purchaseProduct = pkg ? getPackagePurchaseProduct(pkg.tier) : undefined;
  if (!pkg || !purchaseProduct) redirect("/purchase");
  // 화면 가격은 실제 매칭 상품이 있으면 그걸로 덮어써서 /purchase/order와 정합성을 맞춘다.
  const product = requestedProduct ?? resolveProductsByTier(products, plans)[pkg.tier];
  const effectivePurchaseProduct = {
    ...purchaseProduct,
    price: product?.price ?? purchaseProduct.price,
    originalPrice: product?.originalPrice ?? null,
  };

  return (
    <PurchaseProductDetailPage
      pkg={pkg}
      purchaseProduct={effectivePurchaseProduct}
      relatedPlanId={product?.relatedPlanId ?? null}
      productId={product?.id ?? null}
      isSoldOut={product?.isSoldOut ?? false}
      isSalesPaused={product?.isSalesPaused ?? false}
      imageUrl={product?.imageUrl ?? null}
    />
  );
}
